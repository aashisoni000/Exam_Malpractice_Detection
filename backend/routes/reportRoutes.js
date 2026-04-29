const express = require("express");
const router = express.Router();
const { getReports, getStudentReports } = require("../controllers/reportController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", getReports);
router.get("/student", authenticateToken, getStudentReports);

module.exports = router;
