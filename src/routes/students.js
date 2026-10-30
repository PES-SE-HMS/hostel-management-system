const router = require('express').Router();
const c = require('../controllers/studentController');
const { requireRole } = require('../middleware/auth');

// FR-03: only administrators manage student records
router.get('/', requireRole('admin', 'warden'), c.list);
router.get('/:id', requireRole('admin', 'warden'), c.get);
router.post('/', requireRole('admin'), c.create);
router.put('/:id', requireRole('admin'), c.update);

module.exports = router;
