import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getExams, 
  startExamSession, 
  endExamSession, 
  submitExam, 
  logIpDuringExam,
  logExamEvent
} from '../api/examApi';
import { getQuestions, getOptions } from '../api/questionApi';
import { 
  ClockIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  DocumentIcon,
  UserIcon,
  SignalIcon
} from '../components/Icons';
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
  
  // Monitoring States
  const [showIPWarning, setShowIPWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [eventSeverity, setEventSeverity] = useState(null);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [idleReportCount, setIdleReportCount] = useState(0);
  const [idleSeverity, setIdleSeverity] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [networkSeverity, setNetworkSeverity] = useState(null);

  const timerRef = useRef(null);
  const ipLoggerRef = useRef(null);
  const idleTimerRef = useRef(null);

  useEffect(() => {
    const initExam = async () => {
      try {
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

        const qRes = await getQuestions(examId);
        const qList = Array.isArray(qRes) ? qRes : (qRes.questions || []);
        
        const questionsWithOpts = await Promise.all(qList.map(async (q) => {
          const optRes = await getOptions(q.question_id);
          const opts = Array.isArray(optRes) ? optRes : (optRes.options || []);
          return { ...q, options: opts };
        }));
        
        setQuestions(questionsWithOpts);

        const startRes = await startExamSession({ 
          student_id: user.id || user.student_id, 
          exam_id: parseInt(examId) 
        });
        
        if (startRes.attempt_id) {
          setAttemptId(startRes.attempt_id);
        } else {
          setToast({ message: 'Failed to start exam session.', type: "error" });
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
      if (ipLoggerRef.current) clearInterval(ipLoggerRef.current);
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [examId, user, navigate]);

  // Handle Exam Timer
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

  // Handle Monitoring Lifecycle
  useEffect(() => {
    if (attemptId && !isSubmitting) {
      // 1. IP Logging
      const logIP = async () => {
        try {
          const result = await logIpDuringExam({ attempt_id: attemptId });
          if (result.multipleIP) setShowIPWarning(true);
        } catch (err) { console.error(err); }
      };
      logIP();
      ipLoggerRef.current = setInterval(logIP, 30000);

      // 2. Tab/Focus Interaction
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          try {
            const res = await logExamEvent({ attempt_id: attemptId, reason: "Tab switched" });
            if (res.success) { setTabSwitchCount(res.count); setEventSeverity(res.severity); }
          } catch (err) { console.error(err); }
        }
      };
      const handleBlur = async () => {
        try { await logExamEvent({ attempt_id: attemptId, reason: "Window focus lost" }); } catch (err) { console.error(err); }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);

      // 3. Idle Detection
      const resetIdle = () => setIdleSeconds(0);
      window.addEventListener("mousemove", resetIdle);
      window.addEventListener("keydown", resetIdle);
      window.addEventListener("click", resetIdle);

      idleTimerRef.current = setInterval(async () => {
        setIdleSeconds(prev => {
          const newVal = prev + 1;
          if (newVal >= 60) {
            logExamEvent({ attempt_id: attemptId, reason: "Idle inactivity" })
              .then(res => {
                if (res.success) {
                  setIdleReportCount(res.count);
                  setIdleSeverity(res.severity);
                }
              }).catch(err => console.error(err));
            return 0;
          }
          return newVal;
        });
      }, 1000);

      // 4. Network Monitoring
      const handleOffline = async () => {
        setIsOnline(false);
        try { await logExamEvent({ attempt_id: attemptId, reason: "Network disconnected" }); } catch (err) { console.error(err); }
      };
      const handleOnline = async () => {
        setIsOnline(true);
        try {
          const res = await logExamEvent({ attempt_id: attemptId, reason: "Network reconnected" });
          if (res.success) {
            setReconnectCount(res.count);
            setNetworkSeverity(res.severity);
          }
        } catch (err) { console.error(err); }
      };
      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);

      return () => {
        if (ipLoggerRef.current) clearInterval(ipLoggerRef.current);
        if (idleTimerRef.current) clearInterval(idleTimerRef.current);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("mousemove", resetIdle);
        window.removeEventListener("keydown", resetIdle);
        window.removeEventListener("click", resetIdle);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("online", handleOnline);
      };
    }
  }, [attemptId, isSubmitting]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const handleAnswerChange = (qId, optionId) => {
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
    setIdleSeconds(0);
  };

  const autoSubmit = () => {
    setToast({ message: "Time is up! Auto-submitting...", type: "warning" });
    handleEndExam(true);
  };

  const handleEndExam = async (force = false) => {
    if (isSubmitting) return;
    if (!force && !window.confirm("End exam and submit answers?")) return;

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (ipLoggerRef.current) clearInterval(ipLoggerRef.current);
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);

    try {
      const answersJson = JSON.stringify(answers);
      await submitExam({ attempt_id: attemptId, answers_text: answersJson });
      await endExamSession({ attempt_id: attemptId });

      setToast({ message: "Exam submitted successfully!", type: "success" });
      setTimeout(() => navigate('/student-dashboard/my-exams'), 2000);
    } catch (err) {
      setToast({ message: "Submission error.", type: "error" });
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const isLowTime = timeLeft < 300;

  const getSeverityBanner = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'high') return 'bg-red-600';
    if (s === 'medium') return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="max-w-4xl mx-auto page-enter pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Floating Warning Stack */}
      <div className="sticky top-0 z-40 flex flex-col gap-0.5 -mx-6">
        {!isOnline && (
          <div className="bg-red-700 text-white py-3 px-6 shadow-2xl flex items-center justify-center gap-3 animate-pulse border-b border-white/20">
            <SignalIcon className="w-6 h-6 text-white" />
            <span className="font-extrabold text-sm uppercase tracking-tighter">Connection Lost: You are currently offline. Activity is logged.</span>
          </div>
        )}
        {showIPWarning && (
          <div className="bg-red-600 text-white py-2.5 px-6 shadow-xl flex items-center justify-center gap-3 animate-pulse border-b border-white/10">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="font-bold text-sm">MULTI-DEVICE ALERT: Multiple IP addresses detected.</span>
          </div>
        )}
        {tabSwitchCount > 0 && (
          <div className={`${getSeverityBanner(eventSeverity)} text-white py-2 px-6 flex items-center justify-center gap-3 shadow-lg border-b border-white/10 text-center`}>
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="font-bold text-xs">Tab Switch Warning ({tabSwitchCount}) — Integrity risk increasing.</span>
          </div>
        )}
        {idleReportCount > 0 && (
          <div className={`${getSeverityBanner(idleSeverity)} text-white py-2 px-6 flex items-center justify-center gap-3 shadow-lg border-b border-white/10`}>
            <UserIcon className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wide">Inactivity logged. Please remain engaged with the exam.</span>
          </div>
        )}
        {reconnectCount > 0 && (
          <div className={`${getSeverityBanner(networkSeverity)} text-white py-2 px-6 flex items-center justify-center gap-3 shadow-lg border-b border-white/10`}>
            <SignalIcon className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wide">Network instability detected. Reconnects: {reconnectCount}</span>
          </div>
        )}
      </div>

      {/* Exam Header */}
      <div className="sticky top-0 z-20 bg-[#F5F0E6] py-5 mb-8 border-b border-[#E6DECE] shadow-sm px-6 -mx-6 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-ping'}`} title={isOnline ? 'Network Online' : 'Network Offline'} />
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">{exam?.subject_name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-3 h-3 text-[#7FB77E]" />
                  Active Monitoring
                </p>
                {reconnectCount > 0 && <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">Reconnects: {reconnectCount}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col items-end mr-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${idleSeconds > 40 ? 'bg-red-500 animate-ping' : 'bg-[#7FB77E]'}`} />
                Engagement: {60 - idleSeconds}s
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-white/50 border border-gray-200 rounded-md">
                   <SignalIcon className={`w-3 h-3 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                   <span className="text-[9px] font-black uppercase text-gray-500">{isOnline ? 'Stable' : 'Offline'}</span>
                </div>
              </div>
            </div>
            
            <Badge variant={isLowTime ? 'danger' : 'default'} className="px-6 py-3 rounded-2xl border-none flex items-center gap-3 bg-white shadow-inner">
              <ClockIcon className={`w-6 h-6 ${isLowTime ? 'text-red-500 animate-pulse' : 'text-[#7FB77E]'}`} />
              <span className="font-mono text-2xl font-black text-gray-700 tracking-tighter">{formatTime(timeLeft)}</span>
            </Badge>
            
            <button
              onClick={() => handleEndExam(false)}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white font-black py-3 px-8 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm uppercase tracking-wider"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {questions.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-2 border-gray-200"><CardContent><p className="text-gray-400 font-medium">No exam questions available at this time.</p></CardContent></Card>
        ) : (
          questions.map((q, index) => (
            <Card key={q.question_id} className="relative overflow-hidden group shadow-md hover:shadow-xl transition-all border-l-8 border-l-[#7FB77E] rounded-3xl">
              <CardContent className="p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#4d7f4c] uppercase tracking-[0.2em] bg-[#e5efdf] px-3 py-1 rounded-lg">Question {index + 1}</span>
                    <Badge variant="neutral" className="bg-gray-100 text-gray-500 font-bold px-3">{q.marks} Marks</Badge>
                  </div>
                  <h3 className="text-xl text-gray-800 font-bold mt-6 leading-tight select-none">{q.question_text}</h3>
                </div>

                <div className="flex flex-col gap-4">
                  {q.options.map((opt) => (
                    <label key={opt.option_id} className={`flex items-center gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all ${answers[q.question_id] === opt.option_id ? 'border-[#7FB77E] bg-[#f5f9f4] shadow-md transform scale-[1.01]' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                      <input type="radio" name={`q-${q.question_id}`} className="w-5 h-5 text-[#7FB77E] accent-[#7FB77E]" checked={answers[q.question_id] === opt.option_id} onChange={() => handleAnswerChange(q.question_id, opt.option_id)} disabled={isSubmitting} />
                      <span className={`text-base font-bold transition-colors ${answers[q.question_id] === opt.option_id ? 'text-[#3e6c3d]' : 'text-gray-600'}`}>{opt.option_text}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <div className="flex items-center gap-6 p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-inner mt-4">
          <div className="bg-indigo-500 p-4 rounded-2xl shadow-lg">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-indigo-900 tracking-tight">Enterprise Integrity Protocol Active</p>
            <p className="text-sm text-indigo-700/80 mt-1 font-bold leading-relaxed">
              Your session is being monitored for network stability, tab interactions, IP integrity, and user engagement. 
              All telemetry is encrypted and logged in real-time.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <Button onClick={() => handleEndExam(false)} disabled={isSubmitting || questions.length === 0} className="px-16 py-5 text-xl font-black rounded-3xl shadow-xl hover:shadow-[#7FB77E]/30 transition-all">
            {isSubmitting ? 'Syncing...' : 'Complete & Submit'}
            {!isSubmitting && <ShieldCheckIcon className="w-6 h-6 ml-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
