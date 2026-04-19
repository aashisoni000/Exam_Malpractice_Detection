let reports = require('../mockData/reports.json');

const getAllReports = async () => {
  // Returns directly what reports.json contains: 
  // Student Name, Exam Name, Reason, Severity, Time
  return reports;
};

module.exports = { getAllReports };
