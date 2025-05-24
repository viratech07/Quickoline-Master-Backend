const express = require('express');
const router = express.Router();
const AutomationController = require('../controllers/autocontroller');

router.post('/automation', AutomationController.createAutomation);
router.get('/',AutomationController.getAllAutomations);
router.get('/:id', AutomationController.getAutomationById);
router.put('/:id', AutomationController.updateAutomation);
router.delete('/', AutomationController.deleteAllAutomations);
router.delete('/:id', AutomationController.deleteAutomation);

module.exports = router;