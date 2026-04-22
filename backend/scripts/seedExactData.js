require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../config/db');

const studentDataRaw = `RA2411026010870 - Tanmayi Sinha
RA2411026010878 - Harsh Soni
RA2411026010899 - Abhishek Ranjan
RA2411026010906 - Piyush Kumar
RA2411026010909 - Satyam Rout
RA2411026010893 - Aalif Hassan
RA2411026010928 - Praveen R S
RA2411026010930 - Pracheeta Sahu
RA2411026010902 - Gowtham
RA2411026010888 - Aditya Raj
RA2411026010873 - Anand S Kumar
RA2411026010885 - Joshik R
RA2411026010896 - Likesh kanna S
RA2411026010898 - Elvin Joseph
RA2411026010921 - Jaswanth kumar C K
RA2411026010908 - G. Pavan Reddy
RA2411026010918 - J. Prashanth
RA2411026010919 - GP. Harshan
RA2411026010920 - K. Lokeshwar Reddy
RA2411026010932 - K. Nanda Maheshwar Reddy
RA2411026010884 - Sreenidhi Sreehari
RA2411026010891 - Jerry
RA2411026010913 - Ashik
RA2411026010927 - Hemant M B
RA2411026010933 - Deepak E
RA2411026010886 - PRAGNA M
RA2411026010887 - JESSICA K
RA2411026010894 - AASHI SONI
RA2411026010922 - NISHITHA A
RA2411026010923 - PAVANI SOUMYA S S
RA2411026010877 - Harshit Joshi
RA2411026010924 - Yash Kumar
RA2411026010907 - Anirudh Peri
RA2411026010890 - Vaishnavi
RA2411026010914 - Nadanitika
RA2411026010910 - Varun Sai Jonnalagadda
RA2411026010900 - S Dhanush
RA2411026010892 - S Sai Vardhan
RA2411026010889 - B Rahul Chandra
RA2411026010869 - T.Nikhil
RA2411026010882 - Nomula Hemanth
RA2411026010883 - RAGHU VARMA
RA2411026010917 - GEETHIK SAIRAJ
RA2411026010926 - HARSHA VARDHAN
RA2411026010931 - ROHAN REDDY
RA2411026010881 - Lakshya Sinha
RA2411026010895 - Shaik abdul ahad
RA2411026010901 - Vikram jai singh
RA2411026010916 - Thanush gudivada
RA2411026010911 - Anapalepu Baby Naga Akshitha Priya
RA2411026010876 - Dodla Tejendra Koushik
RA2411026010905 - Shaik Israr
RA2411026010871 - Bhashyam Sethu Venkata Prakash
RA2411026010929 - Addanki Akshay kumar`;

const REQUIRED_EXAMS = [
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Artificial Intelligence',
  'Machine Learning',
  'Software Engineering'
];

async function run() {
  try {
    console.log("=== STEP 1: Verify Email Column ===");
    try {
      await pool.query('ALTER TABLE Student ADD COLUMN email VARCHAR(100) UNIQUE;');
      console.log("Added email column to Student table.");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("Email column already exists.");
      } else {
        throw err;
      }
    }

    console.log("\\n=== STEP 2: Remove Placeholder Students ===");
    
    // Find dummy students
    const [dummyStudents] = await pool.query(`
      SELECT student_id FROM Student 
      WHERE email LIKE '%student%@example.com' 
      OR name LIKE '%Test%' 
      OR name LIKE '%Dummy%' 
      OR name LIKE 'Student%'
    `);
    
    if (dummyStudents.length > 0) {
      const dummyIds = dummyStudents.map(s => s.student_id);
      console.log(`Found ${dummyIds.length} dummy students. Performing cascading delete...`);
      
      const idsStr = dummyIds.join(',');
      
      // Cascade delete order
      await pool.query(`DELETE FROM Submission WHERE attempt_id IN (SELECT attempt_id FROM Exam_Attempt WHERE student_id IN (${idsStr}))`);
      await pool.query(`DELETE FROM IP_Log WHERE attempt_id IN (SELECT attempt_id FROM Exam_Attempt WHERE student_id IN (${idsStr}))`);
      await pool.query(`DELETE FROM Suspicion_Report WHERE attempt_id IN (SELECT attempt_id FROM Exam_Attempt WHERE student_id IN (${idsStr}))`);
      await pool.query(`DELETE FROM Exam_Attempt WHERE student_id IN (${idsStr})`);
      await pool.query(`DELETE FROM Student WHERE student_id IN (${idsStr})`);
      
      console.log("Dummy records successfully deleted.");
    } else {
      console.log("No dummy students found to delete.");
    }

    console.log("\\n=== STEP 3: Insert Exact Student Data ===");
    const [existingStudents] = await pool.query('SELECT registration_number FROM Student');
    const existingRegNos = new Set(existingStudents.map(s => s.registration_number));
    
    const [maxIdRow] = await pool.query('SELECT MAX(student_id) as maxId FROM Student');
    let nextStudentId = (maxIdRow[0].maxId || 0) + 1;
    
    const studentsToInsert = [];
    studentDataRaw.split('\\n').filter(l => l.trim()).forEach(line => {
      const parts = line.split(' - ');
      const regNo = parts[0].trim();
      const namePart = parts[1].trim();
      if (!existingRegNos.has(regNo)) {
        // Generate email: convert spaces/dots to dots, lowercase
        const cleanName = namePart.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\\.+|\\.+$/g, '');
        const email = `${cleanName}@example.com`;
        
        studentsToInsert.push([nextStudentId++, namePart, regNo, email]);
        existingRegNos.add(regNo);
      }
    });

    if (studentsToInsert.length > 0) {
      await pool.query(
        'INSERT INTO Student (student_id, name, registration_number, email) VALUES ?',
        [studentsToInsert]
      );
      console.log(`Inserted ${studentsToInsert.length} new students.`);
    } else {
      console.log("All provided students already exist in the database.");
    }

    console.log("\\n=== STEP 4: Ensure Exams Exist ===");
    const [existingExams] = await pool.query('SELECT subject_name FROM Exam');
    const existingExamNames = new Set(existingExams.map(e => e.subject_name));
    
    const [maxExamIdRow] = await pool.query('SELECT MAX(exam_id) as maxId FROM Exam');
    let nextExamId = (maxExamIdRow[0].maxId || 0) + 1;
    
    const examsToInsert = [];
    for (const subject of REQUIRED_EXAMS) {
      if (!existingExamNames.has(subject)) {
        // Random past date within last 60 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));
        const dateStr = date.toISOString().split('T')[0];
        
        examsToInsert.push([nextExamId++, subject, dateStr, 90]);
      }
    }
    
    if (examsToInsert.length > 0) {
      await pool.query(
        'INSERT INTO Exam (exam_id, subject_name, exam_date, duration_minutes) VALUES ?',
        [examsToInsert]
      );
      console.log(`Inserted ${examsToInsert.length} new exams.`);
    } else {
      console.log("All required exams already exist.");
    }

    console.log("\\n=== STEP 5 - 8: Generate Attempts, IP Logs, Submissions, Suspicion Reports ===");
    
    const [allStudents] = await pool.query('SELECT student_id FROM Student');
    const [allExams] = await pool.query('SELECT exam_id, duration_minutes FROM Exam');
    
    const [currentAttempts] = await pool.query('SELECT COUNT(*) as count FROM Exam_Attempt');
    let targetAttempts = 150;
    
    if (currentAttempts[0].count < targetAttempts) {
      const attemptsNeeded = targetAttempts - currentAttempts[0].count;
      console.log(`Generating ${attemptsNeeded} attempts...`);
      
      const [maxAttemptIdRow] = await pool.query('SELECT MAX(attempt_id) as maxId FROM Exam_Attempt');
      let nextAttemptId = (maxAttemptIdRow[0].maxId || 0) + 1;
      
      const [maxIpIdRow] = await pool.query('SELECT MAX(ip_id) as maxId FROM IP_Log');
      let nextIpId = (maxIpIdRow[0].maxId || 0) + 1;

      const [maxSubIdRow] = await pool.query('SELECT MAX(submission_id) as maxId FROM Submission');
      let nextSubId = (maxSubIdRow[0].maxId || 0) + 1;
      
      let reportsTarget = Math.floor(Math.random() * 21) + 40; // 40-60 reports
      let reportReasons = ['Tab switched', 'Exceeded exam duration', 'Multiple IP detected', 'Fast submission'];
      
      for (let i = 0; i < attemptsNeeded; i++) {
        const student = allStudents[Math.floor(Math.random() * allStudents.length)];
        const exam = allExams[Math.floor(Math.random() * allExams.length)];
        
        let duration = exam.duration_minutes;
        const isSuspicious = Math.random() < (reportsTarget / attemptsNeeded);
        
        let actualDuration = duration - Math.floor(Math.random() * 20); // Normal finish
        if (isSuspicious) {
          if (Math.random() > 0.5) {
            actualDuration = duration + Math.floor(Math.random() * 15); // Exceeded duration
          } else {
            actualDuration = Math.floor(Math.random() * 15); // Fast submission
          }
        }
        
        const startTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
        const endTime = new Date(startTime.getTime() + actualDuration * 60 * 1000);
        
        const startTimeStr = startTime.toISOString().slice(0, 19).replace('T', ' ');
        const endTimeStr = endTime.toISOString().slice(0, 19).replace('T', ' ');
        
        await pool.query(
          'INSERT INTO Exam_Attempt (attempt_id, student_id, exam_id, start_time, end_time, total_time_minutes) VALUES (?, ?, ?, ?, ?, ?)',
          [nextAttemptId, student.student_id, exam.exam_id, startTimeStr, endTimeStr, actualDuration]
        );
        
        const ipCount = isSuspicious && Math.random() > 0.6 ? 2 : 1;
        for (let j = 0; j < ipCount; j++) {
          const ip = "192.168.1." + Math.floor(Math.random() * 255);
          await pool.query(
            'INSERT INTO IP_Log (ip_id, attempt_id, ip_address) VALUES (?, ?, ?)',
            [nextIpId++, nextAttemptId, ip]
          );
        }
        
        const answerSet = "Answer set populated by script";
        await pool.query(
          'INSERT INTO Submission (submission_id, attempt_id, answers_text, submission_time) VALUES (?, ?, ?, ?)',
          [nextSubId++, nextAttemptId, answerSet, endTimeStr]
        );
        
        if (isSuspicious) {
          const reason = reportReasons[Math.floor(Math.random() * reportReasons.length)];
          let severity = 'Medium';
          if (reason === 'Fast submission') severity = 'Low';
          if (reason === 'Tab switched') severity = 'Medium';
          if (reason === 'Multiple IP detected') severity = 'High';
          
          await pool.query(
            'INSERT INTO Suspicion_Report (attempt_id, reason, severity, reported_time) VALUES (?, ?, ?, ?)',
            [nextAttemptId, reason, severity, endTimeStr]
          );
        }
        
        nextAttemptId++;
      }
      console.log("Successfully generated attempts, logs, submissions, and reports.");
    } else {
      console.log("Sufficient attempts already exist.");
    }

    console.log("\\n=== STEP 9 & 10: Validate and Summary ===");
    const [c1] = await pool.query('SELECT COUNT(*) as c FROM Student');
    const [c2] = await pool.query('SELECT COUNT(*) as c FROM Exam');
    const [c3] = await pool.query('SELECT COUNT(*) as c FROM Exam_Attempt');
    const [c4] = await pool.query('SELECT COUNT(*) as c FROM Submission');
    const [c5] = await pool.query('SELECT COUNT(*) as c FROM Suspicion_Report');

    console.log("\\n==================================");
    console.log("  DATABASE GENERATION SUMMARY");
    console.log("==================================");
    console.log(" Total Students        : " + c1[0].c);
    console.log(" Total Exams           : " + c2[0].c);
    console.log(" Total Attempts        : " + c3[0].c);
    console.log(" Total Submissions     : " + c4[0].c);
    console.log(" Total Suspicion Logs  : " + c5[0].c);
    console.log("==================================\\n");
    
  } catch (err) {
    console.error("Error during execution:", err);
  } finally {
    pool.end();
  }
}

run();
