const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseHelper');

exports.getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.getCharts = async (req, res, next) => {
  try {
    const charts = await dashboardService.getCharts();
    sendSuccess(res, charts, 'Dashboard charts retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.getRecentReports = async (req, res, next) => {
  try {
    const reports = await dashboardService.getRecentReports();
    sendSuccess(res, { reports }, 'Recent reports retrieved successfully');
  } catch (err) {
    next(err);
  }
};
