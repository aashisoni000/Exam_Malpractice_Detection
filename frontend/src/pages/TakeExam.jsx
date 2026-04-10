// pages/TakeExam.jsx
// Student exam portal: Handles timer, questions, and malpractice detection.
// Route: /student-dashboard/take-exam/:exam_id

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { examAPI } from '../services/api';
import { ClockIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '../components/Icons';
import Toast from '../components/Toast';

const MOCK_QUESTIONS = [
  { id: 1, text: "Explain the concept of Database Normalization and its importance." },
  { id: 2, text: "What is a Database Trigger? Provide an example use case." },
  { id: 3, text: "Explain how Database Indexing improves query performance." }
];

const TakeExam = () => {
  const { exam_id } = useParams();
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);
  const isWarnedRef = useRef(false);

  // ── Initialization ──────────────────────────────────────────────────────────
  useEffect(() => {
    const initExam = async () => {
      try {
        // Fetch exam details first to get duration
        const { data: examListData } = await examAPI.getForStudent(user.id);
        const currentExam = examListData.exams.find(e => e.exam_id === parseInt(exam_id));
        
        if (!currentExam) {
          setToast({ message: "Exam not found.", type: "error" });
          setTimeout(() => navigate('/student-dashboard/exams'), 2000);
          return;
        }

        setExam(currentExam);
        setTimeLeft(currentExam.duration_minutes * 60);

        // Start attempt on backend
        const { data: startData } = await examAPI.start(user.id, exam_id);
        if (startData.success) {
          setAttemptId(startData.attempt_id);
        } else {
          setToast({ message: startData.message, type: "error" });
        }
      } catch (err) {
        setToast({ message: "Failed to initialize exam session.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    initExam();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam_id, user.id, navigate]);

  // ── Timer Logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft > 0 && !loading && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            autoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [timeLeft, loading, isSubmitting]);

  // ── Tab Switch Detection ──────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && attemptId && !isSubmitting) {
        // Log suspicion event
        examAPI.logEvent(attemptId, "Tab switched / Window minimized", "Medium");
        setToast({ message: "Malpractice activity detected: Tab switch logged.", type: "warning" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [attemptId, isSubmitting]);

  // ── Format Time ─────────────────────────────────────────────────────────────
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const autoSubmit = () => {
    setToast({ message: "Time is up! Auto-submitting...", type: "warning" });
    handleSubmit();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const answersText = JSON.stringify(answers);
      const { data } = await examAPI.submit(attemptId, answersText);

      if (data.success) {
        setToast({ message: "Exam submitted successfully!", type: "success" });
        setTimeout(() => navigate('/student-dashboard'), 2000);
      } else {
        setToast({ message: data.message, type: "error" });
        setIsSubmitting(false);
      }
    } catch (err) {
      setToast({ message: "Submission failed. Please try again.", type: "error" });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 text-indigo-500 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto page-enter pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header with Timer */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md py-4 mb-8 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{exam?.subject_name}</h1>
          <p className="text-slate-500 text-xs">Stay on this tab. All activity is being monitored.</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${timeLeft < 300 ? 'bg-red-500/10 border-red-500/30' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
          <ClockIcon className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`} />
          <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-indigo-400'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {MOCK_QUESTIONS.map((q, index) => (
          <div key={q.id} className="card relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
            <div className="mb-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Question {index + 1}</span>
              <h3 className="text-lg text-white font-medium mt-1">{q.text}</h3>
            </div>
            <textarea
              className="input-field min-h-[150px] resize-none"
              placeholder="Type your answer here..."
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        ))}

        {/* malptectice warning */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <ShieldCheckIcon className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Integrity Monitoring Active</p>
            <p className="text-xs text-amber-500/80 mt-0.5">
              Switching tabs, copying text, or leaving this window will be logged as a suspicion event. 
              Ensure a stable internet connection before submitting.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary px-12 py-4 text-lg shadow-indigo-500/20 flex items-center gap-3"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            {!isSubmitting && <ShieldCheckIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
