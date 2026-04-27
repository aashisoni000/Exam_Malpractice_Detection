const express = require('express');
const router = express.Router();
const examSessionController = require('../controllers/examSessionController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateActiveSession } = require('../middleware/sessionMiddleware');

// Use /api/exam/start and /api/exam/end but registered under session logic
router.use(authMiddleware);

router.post('/start', examSessionController.startExam);

// These require an active session
router.post('/end', validateActiveSession, examSessionController.endExam);
router.post('/log-ip', validateActiveSession, examSessionController.logIp);
router.post('/log-event', validateActiveSession, examSessionController.logEvent);

module.exports = router;



