// pages/MyExams.jsx
// Student page: View list of all available exams.
// Route: /student-dashboard/exams (nested inside StudentLayout)

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { examAPI } from '../services/api';
import { BookOpenIcon, ClockIcon, ArrowRightIcon } from '../components/Icons';

const MyExams = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await examAPI.getForStudent(user.id);
        if (data.success) {
          setExams(data.exams);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch exams. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user.id]);

  const handleStartExam = (examId) => {
    navigate(`/student-dashboard/take-exam/${examId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 text-indigo-500 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">My Exams</h1>
        <p className="text-slate-400 text-sm">Select an exam to start. Please ensure you are in a quiet environment.</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpenIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No exams available</h2>
          <p className="text-slate-500 text-sm">Check back later for scheduled assessments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.exam_id} className="card hover:border-indigo-500/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</span>
                  <p className="text-sm text-slate-300 flex items-center gap-1 justify-end">
                    <ClockIcon className="w-4 h-4" /> {exam.duration_minutes}m
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {exam.subject_name}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <span>Date:</span>
                <span className="text-slate-200">
                  {new Date(exam.exam_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>

              <button
                onClick={() => handleStartExam(exam.exam_id)}
                className="w-full btn-primary group/btn flex items-center justify-center gap-2"
              >
                Start Exam
                <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyExams;
