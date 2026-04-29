require('dotenv').config();
const { pool } = require('../config/db');

const questionBank = {
  'Database Management Systems': [
    { text: 'Which of the following is not a property of transactions?', type: 'MCQ', options: [
      { text: 'Atomicity', correct: false },
      { text: 'Consistency', correct: false },
      { text: 'Isolation', correct: false },
      { text: 'Redundancy', correct: true }
    ]},
    { text: 'Who proposed the relational model?', type: 'MCQ', options: [
      { text: 'E.F. Codd', correct: true },
      { text: 'Charles Bachman', correct: false },
      { text: 'Bill Gates', correct: false },
      { text: 'Larry Ellison', correct: false }
    ]},
    { text: 'SQL stands for Structured Query Language.', type: 'TRUE_FALSE', options: [
      { text: 'True', correct: true },
      { text: 'False', correct: false }
    ]},
    { text: 'Normalization is the process of organizing data in a database.', type: 'TRUE_FALSE', options: [
      { text: 'True', correct: true },
      { text: 'False', correct: false }
    ]},
    { text: 'Which key uniquely identifies a record?', type: 'MCQ', options: [
      { text: 'Foreign Key', correct: false },
      { text: 'Primary Key', correct: true },
      { text: 'Secondary Key', correct: false },
      { text: 'Composite Key', correct: false }
    ]}
  ],
  'Operating Systems': [
    { text: 'What is a process?', type: 'MCQ', options: [
      { text: 'A program in execution', correct: true },
      { text: 'A static code', correct: false },
      { text: 'A hardware component', correct: false },
      { text: 'A file on disk', correct: false }
    ]},
    { text: 'Which scheduling algorithm is preemptive?', type: 'MCQ', options: [
      { text: 'FCFS', correct: false },
      { text: 'Round Robin', correct: true },
      { text: 'SJF (Non-preemptive)', correct: false },
      { text: 'Priority (Non-preemptive)', correct: false }
    ]},
    { text: 'A deadlock occurs when processes wait indefinitely for resources.', type: 'TRUE_FALSE', options: [
      { text: 'True', correct: true },
      { text: 'False', correct: false }
    ]},
    { text: 'Virtual memory allows execution of processes that may not be completely in memory.', type: 'TRUE_FALSE', options: [
      { text: 'True', correct: true },
      { text: 'False', correct: false }
    ]},
    { text: 'What does FIFO stands for?', type: 'MCQ', options: [
      { text: 'First In First Out', correct: true },
      { text: 'Fast In Fast Out', correct: false },
      { text: 'First In Final Out', correct: false },
      { text: 'Fine In Fine Out', correct: false }
    ]}
  ],
  'Computer Networks': [
    { text: 'How many layers are in the OSI model?', type: 'MCQ', options: [
      { text: '5', correct: false },
      { text: '6', correct: false },
      { text: '7', correct: true },
      { text: '8', correct: false }
    ]},
    { text: 'HTTP works at which layer?', type: 'MCQ', options: [
      { text: 'Transport', correct: false },
      { text: 'Network', correct: false },
      { text: 'Application', correct: true },
      { text: 'Data Link', correct: false }
    ]},
    { text: 'IPv6 addresses are 128 bits long.', type: 'TRUE_FALSE', options: [
      { text: 'True', correct: true },
      { text: 'False', correct: false }
    ]},
    { text: 'UDP is a connection-oriented protocol.', type: 'TRUE_FALSE', options: [
      { text: 'True', correct: false },
      { text: 'False', correct: true }
    ]},
    { text: 'What is the full form of DNS?', type: 'MCQ', options: [
      { text: 'Domain Name System', correct: true },
      { text: 'Digital Network System', correct: false },
      { text: 'Data Name Service', correct: false },
      { text: 'Domain Network Service', correct: false }
    ]}
  ]
};

// Generic questions for subjects not explicitly defined
const genericQuestions = [
  { text: 'Is the following statement correct? "Software testing is the process of finding bugs."', type: 'TRUE_FALSE', options: [
    { text: 'True', correct: true },
    { text: 'False', correct: false }
  ]},
  { text: 'Which of the following is an example of an AI application?', type: 'MCQ', options: [
    { text: 'Calculator', correct: false },
    { text: 'Siri/Alexa', correct: true },
    { text: 'Notepad', correct: false },
    { text: 'Clock', correct: false }
  ]},
  { text: 'The time complexity of binary search is O(log n).', type: 'TRUE_FALSE', options: [
    { text: 'True', correct: true },
    { text: 'False', correct: false }
  ]}
];

async function seed() {
  try {
    console.log('🔄 Starting Question Seeding...');

    // 1. Get All Exams
    const [exams] = await pool.query('SELECT exam_id, subject_name FROM Exam');
    if (exams.length === 0) {
      console.log('⚠️ No exams found in database. Seed exams first.');
      return;
    }

    let totalQuestions = 0;
    let totalOptions = 0;

    for (const exam of exams) {
      console.log(`\n📚 Seeding for Exam: ${exam.subject_name} (ID: ${exam.exam_id})`);
      
      const questionsForThisExam = questionBank[exam.subject_name] || [];
      // Combine with generic questions if needed to reach count
      const finalQuestions = [...questionsForThisExam, ...genericQuestions.slice(0, 8 - questionsForThisExam.length)];

      for (const q of finalQuestions) {
        // Insert Question
        const [qResult] = await pool.query(
          'INSERT INTO Question (exam_id, question_text, question_type, marks) VALUES (?, ?, ?, ?)',
          [exam.exam_id, q.text, q.type.toLowerCase(), 1]
        );
        const question_id = qResult.insertId;
        totalQuestions++;

        // Insert Options
        for (const opt of q.options) {
          await pool.query(
            'INSERT INTO `Option` (question_id, option_text, is_correct) VALUES (?, ?, ?)',
            [question_id, opt.text, opt.correct ? 1 : 0]
          );
          totalOptions++;
        }
      }
      console.log(`✅ Inserted ${finalQuestions.length} questions for exam: ${exam.subject_name}`);
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`Total Questions Inserted: ${totalQuestions}`);
    console.log(`Total Options Inserted: ${totalOptions}`);

    // 2. Validate Insertions
    const [counts] = await pool.query('SELECT exam_id, COUNT(*) as count FROM Question GROUP BY exam_id');
    console.log('\n--- Question Counts per Exam ---');
    console.table(counts);

    console.log('\n🚀 SEEDING COMPLETED SUCCESSFULLY');

  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
  } finally {
    pool.end();
  }
}

seed();
