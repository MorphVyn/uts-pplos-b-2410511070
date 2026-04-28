const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db      = require('../db/database');

const ACCESS_TTL  = parseInt(process.env.JWT_ACCESS_TTL  || '900');
const REFRESH_TTL = parseInt(process.env.JWT_REFRESH_TTL || '604800');

//  Helper: buat access token + simpan refresh token 
async function issueTokens(user) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );

  const refreshToken = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
  const expiresAt    = new Date(Date.now() + REFRESH_TTL * 1000);

  await db.execute(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, refreshToken, expiresAt]
  );

  return { accessToken, refreshToken };
}

//  POST /api/auth/register 
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(422).json({ message: 'name, email, dan password wajib diisi.' });
  }
  if (password.length < 8) {
    return res.status(422).json({ message: 'Password minimal 8 karakter.' });
  }

  const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ message: 'Email sudah terdaftar.' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashed]
  );

  return res.status(201).json({
    message: 'Registrasi berhasil.',
    user: { id: result.insertId, name, email },
  });
};

//  POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ message: 'Email dan password wajib diisi.' });
  }

  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user   = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Email atau password salah.' });
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  return res.json({
    message:       'Login berhasil.',
    access_token:  accessToken,
    refresh_token: refreshToken,
    token_type:    'Bearer',
    expires_in:    ACCESS_TTL,
  });
};

//  POST /api/auth/refresh 
const refresh = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(422).json({ message: 'refresh_token wajib diisi.' });
  }

  const [rows] = await db.execute(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [refresh_token]
  );
  if (rows.length === 0) {
    return res.status(401).json({ message: 'Refresh token tidak valid atau kadaluarsa.' });
  }

  const record = rows[0];
  await db.execute('DELETE FROM refresh_tokens WHERE id = ?', [record.id]);

  const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [record.user_id]);
  const user = userRows[0];

  const { accessToken, refreshToken } = await issueTokens(user);

  return res.json({
    access_token:  accessToken,
    refresh_token: refreshToken,
    token_type:    'Bearer',
    expires_in:    ACCESS_TTL,
  });
};

//  POST /api/auth/logout 
const logout = async (req, res) => {
  await db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [req.user.sub]);
  return res.status(200).json({ message: 'Logout berhasil.' });
};

//  GET /api/auth/me 
const me = async (req, res) => {
  const [rows] = await db.execute(
    'SELECT id, name, email, avatar, email_verified, created_at FROM users WHERE id = ?',
    [req.user.sub]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan.' });
  return res.json({ user: rows[0] });
};

module.exports = { register, login, refresh, logout, me };
