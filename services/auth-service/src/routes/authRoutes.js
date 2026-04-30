const router = require('express').Router();
const auth   = require('../controllers/authController');
const oauth  = require('../controllers/oauthController');
const verify = require('../middleware/authMiddleware');

router.post('/register',        auth.register);
router.post('/login',           auth.login);
router.post('/refresh',         auth.refresh);
router.get('/google',           oauth.redirect);
router.get('/google/callback',  oauth.callback);

router.post('/logout', verify, auth.logout);
router.get('/me',      verify, auth.me);

module.exports = router;
