const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', studentController.getStudents);
router.get('/dashboard/:student_id', studentController.getDashboard);

module.exports = router;
