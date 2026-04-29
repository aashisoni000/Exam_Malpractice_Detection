import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams } from '../api/examApi';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { BookOpenIcon, ClockIcon } from '../components/Icons';

const Exams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await getExams();
        setExams(res?.data?.exams || []);
      } catch (err) {
        setError('Failed to load exams.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exams</h1>
          <p className="text-gray-500 mt-2 font-medium">
            All scheduled exams ({exams.length} total)
          </p>
        </div>
        <Button onClick={() => navigate('/admin-dashboard/create-exam')}>
          + Create Exam
        </Button>
      </div>

      <ErrorMessage message={error} />

      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Exam ID', 'Subject Name', 'Date', 'Duration', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.length > 0 ? exams.map((exam) => (
                <tr key={exam.exam_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm text-gray-500">#{exam.exam_id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#e5efdf] flex items-center justify-center shrink-0">
                        <BookOpenIcon className="w-4 h-4 text-[#7FB77E]" />
                      </div>
                      <span className="font-semibold text-gray-800">{exam.subject_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(exam.exam_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ClockIcon className="w-4 h-4 text-[#7FB77E]" />
                      <span className="font-medium">{exam.duration_minutes} minutes</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => navigate(`/admin-dashboard/exam-builder/${exam.exam_id}`)}
                      className="text-xs font-semibold px-3 py-1.5 bg-[#e5efdf] text-[#4d7f4c]
                                 rounded-lg hover:bg-[#d4e6d0] transition-colors"
                    >
                      Build Questions
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400">
                    No exams created yet.{' '}
                    <button
                      onClick={() => navigate('/admin-dashboard/create-exam')}
                      className="text-[#7FB77E] font-semibold underline"
                    >
                      Create one now
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exams;
