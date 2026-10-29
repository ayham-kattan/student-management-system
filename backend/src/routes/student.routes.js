const { Router } = require('express');
const controller = require('../controllers/student.controller');

// Express 5 forwards rejected promises from async handlers to the error middleware.
const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
