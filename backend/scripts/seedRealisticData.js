require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../config/db');

const SUBJECTS = [
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Artificial Intelligence',
  'Machine Learning',
  'Software Engineering',
  'Mathematics',
  'Physics',
  'Data Structures' // Added 9th
];

async function run() {
  try {
    console.log("=== CLEAR EXISTING FAKE DATA ===");
    await pool.query('DELETE FROM Submission;');
    await pool.query('DELETE FROM IP_Log;');
    await pool.query('DELETE FROM Suspicion_Report;');
    await pool.query('DELETE FROM Exam_Attempt;');
    await pool.query('DELETE FROM Exam;');

    console.log("=== CREATE REALISTIC EXAMS ===");
    const examsToInsert = [];
    for (let i = 0; i < SUBJECTS.length; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const dateStr = date.toISOString().split('T')[0];
        const duration = 60 + Math.floor(Math.random() * 61);
        examsToInsert.push([SUBJECTS[i], dateStr, duration]);
    }
    
    await pool.query(
        'INSERT INTO Exam (subject_name, exam_date, duration_minutes) VALUES ?',
        [examsToInsert]
    );

    console.log("=== GET ASSIGNED IDs ===");
    const [students] = await pool.query('SELECT student_id FROM Student');
    const [exams] = await pool.query('SELECT exam_id, duration_minutes FROM Exam');
    
    // Exact counts
    const numAttempts = 65; // Within 61-69
    
    // Explicit reports: High -> 4, Medium -> 4, Low -> 6
    let reportsSpec = [
      ...Array(4).fill('High'),
      ...Array(4).fill('Medium'),
      ...Array(6).fill('Low')
    ];
    reportsSpec.sort(() => Math.random() - 0.5);

    const generatedReports = [];

    // Target IP logs: 72 (we have 65 attempts, so we need 7 extra IPs spread out)
    let extraIps = 7;

    for (let i = 0; i < numAttempts; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const exam = exams[Math.floor(Math.random() * exams.length)];
        
        const isSuspicious = reportsSpec.length > 0;
        let severity = null;
        let reason = null;
        
        let actualDuration = exam.duration_minutes - Math.floor(Math.random() * 15);
        if (isSuspicious) {
           severity = reportsSpec.pop();
           if (severity === 'Low') {
             reason = 'Fast submission';
           } else if (severity === 'Medium') {
             reason = Math.random() > 0.5 ? 'Tab switched' : 'Window focus lost';
           } else {
             reason = Math.random() > 0.5 ? 'Multiple IP detected' : 'Very fast completion';
           }
        }
        
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 10));
        startTime.setHours(9 + Math.floor(Math.random() * 8)); 
        const endTime = new Date(startTime.getTime() + actualDuration * 60 * 1000);
        
        const startTimeStr = startTime.toISOString().slice(0, 19).replace('T', ' ');
        const endTimeStr = endTime.toISOString().slice(0, 19).replace('T', ' ');

        const [attemptResult] = await pool.query(
          'INSERT INTO Exam_Attempt (student_id, exam_id, start_time, end_time, total_time_minutes) VALUES (?, ?, ?, ?, ?)',
          [student.student_id, exam.exam_id, startTimeStr, endTimeStr, actualDuration]
        );
        const attemptId = attemptResult.insertId;

        const answersJson = JSON.stringify({ completed: true, auto_submitted: isSuspicious && actualDuration < 10 });
        await pool.query(
          'INSERT INTO Submission (attempt_id, answers_text, answers_json, submission_time) VALUES (?, ?, ?, ?)',
          [attemptId, "{}", answersJson, endTimeStr]
        );

        let numIps = 1;
        if (extraIps > 0 && Math.random() > 0.5) {
            numIps = 2; // Add one extra IP to this attempt
            extraIps--;
        }

        for (let j = 0; j < numIps; j++) {
           const prefix = Math.random() > 0.5 ? '192.168' : '10.0';
           const ip = `${prefix}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}`;
           await pool.query('INSERT INTO IP_Log (attempt_id, ip_address) VALUES (?, ?)', [attemptId, ip]);
        }
        
        if (isSuspicious) {
           generatedReports.push([attemptId, reason, severity, endTimeStr]);
        }
    }

    // Assign any remaining extraIps randomly if loop finished before they depleted
    if (extraIps > 0) {
        const [lastAttempts] = await pool.query('SELECT attempt_id FROM Exam_Attempt ORDER BY attempt_id DESC LIMIT ?', [extraIps]);
        for (let a of lastAttempts) {
           await pool.query('INSERT INTO IP_Log (attempt_id, ip_address) VALUES (?, ?)', [a.attempt_id, '10.0.99.99']);
        }
    }

    await pool.query('DELETE FROM Suspicion_Report;');
    
    for (let r of generatedReports) {
       await pool.query(
         'INSERT INTO Suspicion_Report (attempt_id, reason, severity, reported_time) VALUES (?, ?, ?, ?)',
         r
       );
    }
  } catch (err) {
    console.error("Error generating data:", err);
  } finally {
    pool.end();
  }
}
run();
