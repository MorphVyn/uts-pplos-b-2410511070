const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs:        60 * 1000, 
  max:             60,         
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) =>
    res.status(429).json({ message: 'Terlalu banyak request. Coba lagi dalam 1 menit.' }),
});
