const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/responseHelper');

exports.getReports = async (req, res, next) => {
  try {
    const data = await reportService.getAllReports();
    sendSuccess(res, data, 'Reports fetched successfully');
  } catch (err) {
    next(err);
  }
};
