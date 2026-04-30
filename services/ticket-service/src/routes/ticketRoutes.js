const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const { checkout, getMyTickets, getTicket, validateTicket } = require('../controllers/ticketController');

router.use(auth);

router.post('/checkout',                       checkout);
router.get('/tickets',                         getMyTickets);
router.get('/tickets/:id',                     getTicket);
router.post('/tickets/:ticketCode/validate',   validateTicket);

module.exports = router;
