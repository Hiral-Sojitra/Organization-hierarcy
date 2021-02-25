const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
router.post('/create', orgController.create);
router.post('/edit', orgController.edit);
router.get('/:id', orgController.view);

module.exports = router;