const router = require('express').Router();
const c = require('../controllers/authController');
const { requireLogin } = require('../middleware/auth');

router.post('/login', c.login);
router.post('/logout', requireLogin, c.logout);
router.get('/me', requireLogin, c.me);

module.exports = router;
