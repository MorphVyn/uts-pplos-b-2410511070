const jwt = require('jsonwebtoken');

const PUBLIC = [
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/refresh' },
  { method: 'GET',  path: '/api/auth/google' },
  { method: 'GET',  path: '/api/auth/google/callback' },
  { method: 'GET',  path: '/health' },
];

const authMiddleware = (req, res, next) => {
  const isPublic = PUBLIC.some(
    r => r.method === req.method && req.path.startsWith(r.path)
  );
  if (isPublic) return next();

  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Token sudah kadaluarsa.'
      : 'Token tidak valid.';
    return res.status(401).json({ message: msg });
  }
};

module.exports = authMiddleware;
