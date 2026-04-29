require('dotenv').config();
const express = require('express');
const routes  = require('./routes/ticketRoutes');

const app  = express();
const PORT = process.env.PORT || 8003;

app.use(express.json());
app.get('/health', (_, res) => res.json({ service: 'ticket-service', status: 'ok' }));
app.use('/api', routes);
app.use((_, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`Ticket service berjalan di port ${PORT}`));
