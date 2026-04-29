const reportService = require("../services/reportService");
const { sendSuccess, sendError } = require("../utils/responseHelper");

async function getReports(req, res) {
  try {
    const reports = await reportService.getAllReports();
    console.log("[REPORT_CONTROLLER]", reports.length);
    sendSuccess(res, reports, "Reports fetched");
  } catch (error) {
    console.error("[REPORT_CONTROLLER_ERROR]", error);
    sendError(res, "Failed to fetch reports");
  }
}

async function getStudentReports(req, res) {
  try {
    const studentId = req.user.id;
    console.log("[CONTROLLER] Student ID:", studentId);
    const reports = await reportService.getReportsByStudent(studentId);
    console.log("[DEBUG] Student ID:", studentId);
    console.log("[DEBUG] Rows returned:", reports.length);
    sendSuccess(res, reports, "Student reports fetched");
  } catch (error) {
    console.error("[CONTROLLER_ERROR]", error);
    sendError(res, "Failed to fetch student reports");
  }
}

module.exports = {
  getReports,
  getStudentReports
};
