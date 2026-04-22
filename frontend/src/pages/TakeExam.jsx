import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExams, startExam, submitExam } from '../api/examApi';
import { getQuestions, getOptions } from '../api/questionApi';
import { ClockIcon, ShieldCheckIcon } from '../components/Icons';
import Toast from '../components/Toast';
import Loader from '../components/common/Loader';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

const TakeExam = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
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
        // 1. Fetch exam details
        const examsRes = await getExams();
        const allExams = Array.isArray(examsRes) ? examsRes : (examsRes.exams || []);
        const currentExam = allExams.find(e => e.exam_id === parseInt(examId));
        
        if (!currentExam) {
          setToast({ message: "Exam not found.", type: "error" });
          setTimeout(() => navigate('/student-dashboard/my-exams'), 2000);
          return;
        }

        setExam(currentExam);
        setTimeLeft(currentExam.duration_minutes * 60);

        // 2. Fetch questions and their options
        const qRes = await getQuestions(examId);
        const qList = Array.isArray(qRes) ? qRes : (qRes.questions || []);
        
        const questionsWithOpts = await Promise.all(qList.map(async (q) => {
          const optRes = await getOptions(q.question_id);
          const opts = Array.isArray(optRes) ? optRes : (optRes.options || []);
          return { ...q, options: opts };
        }));
        
        setQuestions(questionsWithOpts);

        // 3. Start attempt on backend
        const startData = await startExam({ student_id: user.id || user.student_id, exam_id: parseInt(examId) });
        // The success response might be { success: true, data: { attempt_id: ... } }
        const actualData = startData.data || startData;
        if (actualData.attempt_id) {
          setAttemptId(actualData.attempt_id);
        } else {
          setToast({ message: 'Failed to start exam session on server.', type: "error" });
        }
      } catch (err) {
        console.error("Init Error:", err);
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

  const handleAnswerChange = (qId, optionId) => {
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
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
      const answersJson = JSON.stringify(answers);
      await submitExam({ 
        attempt_id: attemptId, 
        answers_text: answersJson // backend expects answers_text for DB storage
      });

      setToast({ message: "Exam submitted successfully!", type: "success" });
      setTimeout(() => navigate('/student-dashboard/my-exams'), 2000);
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
      <div className="sticky top-0 z-20 bg-white py-4 mb-8 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{exam?.subject_name}</h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-tight">Integrity Monitoring Active</p>
        </div>
        <Badge variant={isLowTime ? 'danger' : 'default'} className="px-5 py-2.5 rounded-xl border border-transparent flex items-center gap-3">
          <ClockIcon className={`w-5 h-5 ${isLowTime ? 'animate-pulse' : ''}`} />
          <span className="font-mono text-xl font-bold tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </Badge>
      </div>

      <div className="flex flex-col gap-8">
        {questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">No questions found for this exam.</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((q, index) => (
            <Card key={q.question_id} className="relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#7FB77E]">
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#4d7f4c] uppercase tracking-widest bg-[#e5efdf] px-2 py-0.5 rounded">Question {index + 1}</span>
                    <span className="text-xs text-gray-400 font-medium">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                  </div>
                  <h3 className="text-lg text-gray-800 font-semibold mt-4 leading-relaxed">{q.question_text}</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {q.options.map((opt) => (
                    <label 
                      key={opt.option_id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        answers[q.question_id] === opt.option_id
                          ? 'border-[#7FB77E] bg-[#f5f9f4]'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.question_id}`}
                        className="w-4 h-4 text-[#7FB77E] focus:ring-[#7FB77E]"
                        checked={answers[q.question_id] === opt.option_id}
                        onChange={() => handleAnswerChange(q.question_id, opt.option_id)}
                        disabled={isSubmitting}
                      />
                      <span className="text-gray-700 text-sm font-medium">{opt.option_text}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* malpractice warning */}
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber-50 border border-amber-100">
          <ShieldCheckIcon className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Advanced Malpractice Detection</p>
            <p className="text-xs text-amber-700/80 mt-1 font-medium leading-relaxed">
              Detection algorithms are active. Tab switching, window blurring, and unauthorized activity are logged in real-time. 
              Any detected anomalies will be reported for review.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || questions.length === 0}
            className="px-12 py-4 text-lg shadow-lg shadow-[#7FB77E]/20"
          >
            {isSubmitting ? 'Submitting Result...' : 'Final Submission'}
            {!isSubmitting && <ShieldCheckIcon className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
