require('dotenv').config();
const express     = require('express');
const proxy       = require('express-http-proxy');
const jwtCheck    = require('./middleware/jwtValidation');
const rateLimiter = require('./middleware/rateLimiter');

const app  = express();
const PORT = process.env.PORT || 8000;

const AUTH_URL   = process.env.AUTH_SERVICE_URL   || 'http://localhost:8001';
const EVENT_URL  = process.env.EVENT_SERVICE_URL  || 'http://localhost:8002';
const TICKET_URL = process.env.TICKET_SERVICE_URL || 'http://localhost:8003';

const proxyOpts = (target) => ({
  proxyReqPathResolver: (req) => req.originalUrl,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers['authorization']) {
      proxyReqOpts.headers['Authorization'] = srcReq.headers['authorization'];
    }
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData) => proxyResData,
});

app.use(express.json());

app.get('/health', (_, res) => res.json({
  service: 'api-gateway',
  status:  'ok',
  services: { auth: AUTH_URL, event: EVENT_URL, ticket: TICKET_URL },
}));

app.use(rateLimiter);
app.use(jwtCheck);

app.use('/api/auth',    proxy(AUTH_URL,   proxyOpts(AUTH_URL)));
app.use('/api/events',  proxy(EVENT_URL,  proxyOpts(EVENT_URL)));
app.use('/api/tickets', proxy(TICKET_URL, proxyOpts(TICKET_URL)));
app.use('/api/checkout',proxy(TICKET_URL, proxyOpts(TICKET_URL)));

app.use((_, res) => res.status(404).json({ message: 'Route tidak ditemukan.' }));

app.listen(PORT, () => {
  console.log(`API Gateway berjalan di port ${PORT}`);
  console.log(`  Auth   → ${AUTH_URL}`);
  console.log(`  Event  → ${EVENT_URL}`);
  console.log(`  Ticket → ${TICKET_URL}`);
});