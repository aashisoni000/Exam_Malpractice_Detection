import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams } from '../api/examApi';
import { BookOpenIcon, ClockIcon } from '../components/Icons';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const MyExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await getExams();
        console.log("MyExams API Response:", res);
        setExams(res?.data?.exams || []);
      } catch (err) {
        console.error("MyExams Fetch Error:", err);
        setError('Failed to fetch exams. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Exams</h1>
        <p className="text-gray-500 mt-2 font-medium">
          Select an exam to begin. Ensure you are in a quiet environment.
        </p>
      </div>

      <ErrorMessage message={error} />

      {!error && exams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#f1f6ef] flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="w-8 h-8 text-[#7FB77E]" />
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">No exams available</h2>
            <p className="text-gray-400">Check back later for scheduled assessments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.exam_id} className="hover:shadow-lg transition-shadow group">
              <CardContent>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#e5efdf] flex items-center justify-center">
                    <BookOpenIcon className="w-6 h-6 text-[#7FB77E]" />
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                    <ClockIcon className="w-4 h-4" />
                    <span>{exam.duration_minutes}m</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#4d7f4c] transition-colors">
                  {exam.subject_name}
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                  <span className="font-semibold text-gray-600">Date: </span>
                  {new Date(exam.exam_date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>

                <Button
                  onClick={() => navigate(`/student-dashboard/take-exam/${exam.exam_id}`)}
                  className="w-full"
                >
                  Start Exam →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyExams;
