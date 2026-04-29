const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const axios  = require('axios');
const db     = require('../db/database');

const EVENT_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:8002';

// POST /api/checkout
const checkout = async (req, res) => {
  const { event_id, category_id, quantity = 1 } = req.body;
  const userId = req.user.sub;

  if (!event_id || !category_id) {
    return res.status(422).json({ message: 'event_id dan category_id wajib diisi.' });
  }

  try {
    // Ambil info kategori dari event-service
    const catRes  = await axios.get(
      `${EVENT_URL}/api/events/${event_id}/categories/${category_id}`,
      { headers: { Authorization: req.headers['authorization'] } }
    );
    const category = catRes.data.data;
    const available = category.quota - category.sold;

    if (available < quantity) {
      return res.status(409).json({
        message: `Stok tidak cukup. Tersisa ${available} tiket.`,
      });
    }

    const totalPrice = parseFloat(category.price) * quantity;
    const orderCode  = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    const [orderResult] = await db.execute(
      `INSERT INTO orders (order_code, user_id, event_id, category_id, quantity, total_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderCode, userId, event_id, category_id, quantity, totalPrice]
    );
    const orderId = orderResult.insertId;

    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketCode = `TIX-${uuidv4().toUpperCase()}`;
      const qrPayload  = JSON.stringify({ ticket_code: ticketCode, event_id, category_id, user_id: userId });
      const qrData     = await QRCode.toDataURL(qrPayload);

      await db.execute(
        `INSERT INTO tickets (ticket_code, order_id, user_id, event_id, category_id, qr_data)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ticketCode, orderId, userId, event_id, category_id, qrData]
      );
      tickets.push({ ticket_code: ticketCode, qr_code: qrData });
    }

    // Update sold di event-service (fire-and-forget)
    axios.put(
      `${EVENT_URL}/api/events/${event_id}/categories/${category_id}`,
      { sold: category.sold + quantity },
      { headers: { Authorization: req.headers['authorization'] } }
    ).catch(() => {});

    return res.status(201).json({
      message: 'Pembelian berhasil.',
      order_code: orderCode,
      total_price: totalPrice,
      tickets,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'Event atau kategori tidak ditemukan.' });
    }
    console.error(err.message);
    return res.status(500).json({ message: 'Gagal memproses checkout.' });
  }
};

// GET /api/tickets
const getMyTickets = async (req, res) => {
  const userId  = req.user.sub;
  const page    = parseInt(req.query.page     || '1');
  const perPage = parseInt(req.query.per_page || '10');
  const offset  = (page - 1) * perPage;

  const [[{ total }]] = await db.execute(
    'SELECT COUNT(*) as total FROM tickets WHERE user_id = ?', [userId]
  );
  const [rows] = await db.execute(
    `SELECT id, ticket_code, event_id, category_id, is_used, used_at, created_at
     FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, perPage, offset]
  );

  return res.json({
    data: rows,
    pagination: { total, page, per_page: perPage, pages: Math.ceil(total / perPage) },
  });
};

// GET /api/tickets/:id
const getTicket = async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM tickets WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.sub]
  );
  if (!rows.length) return res.status(404).json({ message: 'Tiket tidak ditemukan.' });
  return res.json({ data: rows[0] });
};

// POST /api/tickets/:ticketCode/validate
const validateTicket = async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM tickets WHERE ticket_code = ?', [req.params.ticketCode]
  );
  if (!rows.length) {
    return res.status(404).json({ message: 'Tiket tidak ditemukan.', valid: false });
  }

  const ticket = rows[0];
  if (ticket.is_used) {
    return res.status(409).json({
      message: 'Tiket sudah digunakan.',
      valid:   false,
      used_at: ticket.used_at,
    });
  }

  await db.execute(
    'UPDATE tickets SET is_used = 1, used_at = NOW() WHERE id = ?', [ticket.id]
  );

  return res.json({
    message:     'Tiket valid. Akses diizinkan.',
    valid:       true,
    ticket_code: ticket.ticket_code,
    event_id:    ticket.event_id,
  });
};

module.exports = { checkout, getMyTickets, getTicket, validateTicket };
