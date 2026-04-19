const fs = require('fs');
const path = require('path');

let exams = require('../mockData/exams.json');
let attempts = require('../mockData/attempts.json');
let submissions = [];
let ipLogs = [];

const getAllExams = async () => {
  return exams;
};

const createExam = async (examData) => {
  const newExam = {
    exam_id: exams.length + 1,
    subject_name: examData.subject_name,
    exam_date: examData.exam_date,
    duration_minutes: examData.duration_minutes
  };
  exams.push(newExam);
  return newExam;
};

const startExam = async (student_id, exam_id, ip_address) => {
  const newAttempt = {
    attempt_id: attempts.length + 1,
    student_id,
    exam_id,
    start_time: new Date().toISOString()
  };
  attempts.push(newAttempt);

  ipLogs.push({
    log_id: ipLogs.length + 1,
    attempt_id: newAttempt.attempt_id,
    ip_address,
    login_time: new Date().toISOString()
  });

  return newAttempt;
};

const submitExam = async (attempt_id, answers_text) => {
  const attempt = attempts.find(a => a.attempt_id == attempt_id);
  if (!attempt) throw new Error('Attempt not found');

  attempt.end_time = new Date().toISOString();
  attempt.total_time_minutes = Math.round((new Date(attempt.end_time) - new Date(attempt.start_time)) / 60000);

  const submission = {
    submission_id: submissions.length + 1,
    attempt_id,
    answers_text,
    submission_time: new Date().toISOString()
  };
  submissions.push(submission);
  
  return attempt;
};

module.exports = {
  getAllExams,
  createExam,
  startExam,
  submitExam
};
