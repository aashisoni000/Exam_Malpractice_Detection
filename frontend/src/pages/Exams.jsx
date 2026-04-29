import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, assignStudents } from '../api/examApi';
import { getStudents } from '../api/studentApi';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import Toast from '../components/Toast';
import { BookOpenIcon, ClockIcon, UserIcon, ShieldCheckIcon } from '../components/Icons';

const Exams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [examRes, studentRes] = await Promise.all([
          getExams(),
          getStudents()
        ]);
        setExams(examRes?.data?.exams || []);
        setStudents(studentRes?.data?.students || []);
      } catch (err) {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleOpenAssign = (exam) => {
    setSelectedExam(exam);
    setSelectedStudents([]);
    setShowModal(true);
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleAssignSubmit = async () => {
    if (selectedStudents.length === 0) {
      setToast({ message: "Select at least one student", type: "warning" });
      return;
    }

    setIsAssigning(true);
    try {
      await assignStudents({
        exam_id: selectedExam.exam_id,
        student_ids: selectedStudents
      });
      setToast({ message: `Assigned ${selectedStudents.length} students successfully`, type: "success" });
      setShowModal(false);
    } catch (err) {
      setToast({ message: "Assignment failed", type: "error" });
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-6xl mx-auto page-enter">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Exam Management</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Manage schedules and student assignments ({exams.length} active exams)
          </p>
        </div>
        <Button onClick={() => navigate('/admin-dashboard/create-exam')} className="rounded-2xl shadow-lg hover:shadow-[#7FB77E]/30">
          + Create New Exam
        </Button>
      </div>

      <ErrorMessage message={error} />

      <Card className="rounded-[2.5rem] shadow-xl border-none p-2 overflow-hidden bg-white">
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {['Status', 'Subject', 'Date', 'Duration', 'Actions'].map(h => (
                  <th key={h} className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {exams.length > 0 ? exams.map((exam) => (
                <tr key={exam.exam_id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="py-5 px-6">
                     <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#f5f9f4] flex items-center justify-center shrink-0 border border-[#e5efdf]">
                        <BookOpenIcon className="w-5 h-5 text-[#7FB77E]" />
                      </div>
                      <div>
                        <span className="font-black text-gray-800 block text-sm">{exam.subject_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID: #{exam.exam_id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-gray-600 font-bold text-sm">
                    {new Date(exam.exam_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 text-gray-500 font-black text-xs uppercase cursor-default">
                      <ClockIcon className="w-4 h-4 text-[#7FB77E]" />
                      {exam.duration_minutes}m
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenAssign(exam)}
                        className="text-[10px] font-black px-4 py-2 bg-indigo-50 text-indigo-600
                                   rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-wider"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => navigate(`/admin-dashboard/exam-builder/${exam.exam_id}`)}
                        className="text-[10px] font-black px-4 py-2 bg-[#f5f9f4] text-[#4d7f4c]
                                   rounded-xl hover:bg-[#7FB77E] hover:text-white transition-all uppercase tracking-wider"
                      >
                        Questions
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-gray-400 font-bold italic tracking-tight">
                    No active exams available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in transition-all">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
            <div className="p-10 bg-[#f5f9f4] border-b border-[#e5efdf]">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-[1.5rem] bg-[#7FB77E] flex items-center justify-center shadow-lg shadow-[#7FB77E]/30">
                     <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">Assign Students</h3>
               </div>
               <p className="text-gray-500 font-bold text-sm">Target Exam: <span className="text-[#4d7f4c]">{selectedExam?.subject_name}</span></p>
            </div>
            
            <div className="p-8 max-h-[40vh] overflow-y-auto scrollbar-hide">
              <div className="flex flex-col gap-2">
                {students.map(student => (
                  <label 
                    key={student.student_id} 
                    className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                      selectedStudents.includes(student.student_id) 
                        ? 'border-[#7FB77E] bg-[#f5f9f4]' 
                        : 'border-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800">{student.student_name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.email}</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-[#7FB77E] rounded-lg"
                      checked={selectedStudents.includes(student.student_id)}
                      onChange={() => toggleStudent(student.student_id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="p-10 bg-gray-50 flex items-center justify-between">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {selectedStudents.length} Selected
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-xs font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignSubmit}
                  disabled={isAssigning || selectedStudents.length === 0}
                  className="px-8 py-3 bg-[#7FB77E] hover:bg-[#6aa96b] text-white font-black text-xs
                             rounded-2xl shadow-lg shadow-[#7FB77E]/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                >
                  {isAssigning ? 'Processing...' : 'Confirm Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
