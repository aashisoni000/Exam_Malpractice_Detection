import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExams, startExam, submitExam } from '../api/examApi';
import { ClockIcon, ShieldCheckIcon } from '../components/Icons';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

const MOCK_QUESTIONS = [
  { id: 1, text: "Explain the concept of Database Normalization and its importance." },
  { id: 2, text: "What is a Database Trigger? Provide an example use case." },
  { id: 3, text: "Explain how Database Indexing improves query performance." }
];

const TakeExam = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    const initExam = async () => {
      try {
        const data = await getExams();
        const currentExam = data.find(e => e.exam_id === parseInt(examId));
        
        if (!currentExam) {
          setToast({ message: "Exam not found.", type: "error" });
          setTimeout(() => navigate('/student-dashboard'), 2000);
          return;
        }

        setExam(currentExam);
        setTimeLeft(currentExam.duration_minutes * 60);

        const startData = await startExam({ student_id: user.id, exam_id: examId });
        if (startData.attempt_id) {
          setAttemptId(startData.attempt_id);
        } else {
          setToast({ message: 'Failed to start attempt', type: "error" });
        }
      } catch (err) {
        setToast({ message: "Failed to initialize exam session.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    initExam();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId, user, navigate]);

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

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

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
      await submitExam({ attempt_id: attemptId, answers_text: answersText });

      setToast({ message: "Exam submitted successfully!", type: "success" });
      setTimeout(() => navigate('/student-dashboard'), 2000);
    } catch (err) {
      setToast({ message: "Submission failed. Please try again.", type: "error" });
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const isLowTime = timeLeft < 300; // < 5 mins

  return (
    <div className="max-w-4xl mx-auto page-enter pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header with Timer */}
      <div className="sticky top-0 z-20 bg-[#F8F9FA]/90 backdrop-blur-md py-4 mb-8 flex items-center justify-between border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{exam?.subject_name}</h1>
          <p className="text-gray-500 text-sm font-medium">Stay on this tab. All activity is being monitored.</p>
        </div>
        <Badge variant={isLowTime ? 'danger' : 'default'} className="px-5 py-2.5 rounded-xl border border-transparent flex items-center gap-3">
          <ClockIcon className={`w-5 h-5 ${isLowTime ? 'animate-pulse' : ''}`} />
          <span className="font-mono text-xl font-bold tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        {MOCK_QUESTIONS.map((q, index) => (
          <Card key={q.id} className="relative overflow-hidden group border-l-4 border-l-[#7FB77E]">
            <CardContent>
              <div className="mb-4">
                <span className="text-xs font-bold text-[#4d7f4c] uppercase tracking-widest bg-[#e5efdf] px-2 py-1 rounded-md">Question {index + 1}</span>
                <h3 className="text-lg text-gray-800 font-semibold mt-3">{q.text}</h3>
              </div>
              <textarea
                className="w-full bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-3 outline-none transition-all min-h-[150px] resize-y"
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>
        ))}

        {/* malpractice warning */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#fff8e6] border border-[#f5d996]">
          <ShieldCheckIcon className="w-6 h-6 text-[#d99f26] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#b38014]">Integrity Monitoring Active</p>
            <p className="text-sm text-[#996d11] mt-1 font-medium leading-relaxed">
              Switching tabs, copying text, or leaving this window will be logged as a suspicion event. 
              Ensure a stable internet connection before submitting.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-10 py-3.5 text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            {!isSubmitting && <ShieldCheckIcon className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
