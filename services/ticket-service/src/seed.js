require('dotenv').config();
const mysql  = require('mysql2/promise');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ticket_db',
  });

  console.log('Seeding ticket_db...');

  const USER_ID = 1;

  const orders = [
    { event_id: 1, category_id: 1, quantity: 2, total_price: 300000 },
    { event_id: 1, category_id: 2, quantity: 1, total_price: 500000 },
    { event_id: 4, category_id: 3, quantity: 3, total_price: 450000 },
  ];

  for (const o of orders) {
    const orderCode = `ORD-${Date.now()}-${uuidv4().slice(0,8).toUpperCase()}`;

    const [orderRes] = await conn.execute(
      `INSERT INTO orders (order_code, user_id, event_id, category_id, quantity, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'paid')`,
      [orderCode, USER_ID, o.event_id, o.category_id, o.quantity, o.total_price]
    );
    const orderId = orderRes.insertId;

    // Tiket per quantity
    for (let i = 0; i < o.quantity; i++) {
      const ticketCode = `TIX-${uuidv4().toUpperCase()}`;
      const qrPayload  = JSON.stringify({
        ticket_code: ticketCode,
        event_id:    o.event_id,
        category_id: o.category_id,
        user_id:     USER_ID,
      });
      const qrData = await QRCode.toDataURL(qrPayload);

      await conn.execute(
        `INSERT INTO tickets (ticket_code, order_id, user_id, event_id, category_id, qr_data)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ticketCode, orderId, USER_ID, o.event_id, o.category_id, qrData]
      );
      console.log(`  ✓ Tiket dibuat: ${ticketCode}`);
    }
    console.log(`  ✓ Order: ${orderCode}`);
  }

  console.log('\n✓ Seeder selesai! 3 orders, 6 tiket dummy berhasil dibuat.');
  await conn.end();
}

seed().catch(err => { console.error('Seeder error:', err.message); process.exit(1); });
