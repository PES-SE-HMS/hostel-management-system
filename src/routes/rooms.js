const router = require('express').Router();
const c = require('../controllers/roomController');
const { requireLogin, requireRole } = require('../middleware/auth');

router.get('/availability', requireLogin, c.availability);
router.get('/mine', requireRole('student'), c.myRoom);
router.post('/allocations', requireRole('admin', 'warden'), c.allocate);
router.put('/allocations/:id/vacate', requireRole('admin', 'warden'), c.vacate);

module.exports = router;
