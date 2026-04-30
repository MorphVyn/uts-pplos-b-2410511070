require('dotenv').config();
const express    = require('express');
const authRoutes = require('./routes/authRoutes');

const app  = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());

app.get('/health', (_, res) =>
  res.json({ service: 'auth-service', status: 'ok' })
);

app.use('/api/auth', authRoutes);

app.use((req, res) =>
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () =>
  console.log(`Auth service berjalan di port ${PORT}`)
);
