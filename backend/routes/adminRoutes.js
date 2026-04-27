const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/live-sessions', adminController.getLiveSessions);
router.get('/session-activity/:attempt_id', adminController.getSessionActivity);
router.get('/live-stats', adminController.getLiveStats);
router.post('/terminate-session', adminController.terminateSession);

module.exports = router;
