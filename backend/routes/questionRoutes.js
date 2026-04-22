const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Question routes
router.get('/:exam_id', questionController.getQuestions);
router.post('/', questionController.createQuestion);

// Option routes
router.get('/:question_id/options', questionController.getOptions);
router.post('/options', questionController.createOption);

module.exports = router;
