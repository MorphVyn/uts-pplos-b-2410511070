const axios = require('axios');
const jwt   = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db    = require('../db/database');

const ACCESS_TTL  = parseInt(process.env.JWT_ACCESS_TTL  || '900');
const REFRESH_TTL = parseInt(process.env.JWT_REFRESH_TTL || '604800');

//  GET /api/auth/google 
const redirect = (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'consent',
    state:         uuidv4(), 
  });

  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
};

//  GET /api/auth/google/callback 
const callback = async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ message: `OAuth ditolak: ${error}` });
  }
  if (!code) {
    return res.status(400).json({ message: 'Authorization code tidak ditemukan.' });
  }

  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
      grant_type:    'authorization_code',
    });
    const googleAccessToken = tokenRes.data.access_token;

    const profileRes = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );
    const profile = profileRes.data;

    const [existing] = await db.execute(
      'SELECT * FROM users WHERE email = ?', [profile.email]
    );

    let user;
    if (existing.length > 0) {
      await db.execute(
        'UPDATE users SET name = ?, avatar = ?, google_id = ?, email_verified = 1 WHERE id = ?',
        [profile.name, profile.picture, profile.sub, existing[0].id]
      );
      user = { ...existing[0], name: profile.name, avatar: profile.picture };
    } else {
      const randomPass = await bcrypt.hash(uuidv4(), 10);
      const [result]   = await db.execute(
        'INSERT INTO users (name, email, password, avatar, google_id, email_verified) VALUES (?, ?, ?, ?, ?, 1)',
        [profile.name, profile.email, randomPass, profile.picture, profile.sub]
      );
      user = { id: result.insertId, name: profile.name, email: profile.email, avatar: profile.picture };
    }

    const accessToken  = jwt.sign(
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

    return res.json({
      message:       'Login dengan Google berhasil.',
      access_token:  accessToken,
      refresh_token: refreshToken,
      token_type:    'Bearer',
      expires_in:    ACCESS_TTL,
      user: {
        id:     user.id,
        name:   user.name,
        email:  user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    return res.status(500).json({ message: 'Gagal memproses login Google.' });
  }
};

module.exports = { redirect, callback };
