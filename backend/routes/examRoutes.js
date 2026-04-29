const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', examController.getExams);
router.post('/', examController.createExam);
router.post('/start', examController.startExam);
router.post('/submit', examController.submitExam);
router.post('/assign', examController.assignStudentsToExam);

module.exports = router;
