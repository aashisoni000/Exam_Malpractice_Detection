// pages/CreateExam.jsx
// Admin page: Create a new exam.
// Route: /admin-dashboard/create-exam  (nested inside AdminLayout)

import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { examAPI } from '../services/api';
import Toast from '../components/Toast';
import { PlusIcon, BookOpenIcon, ClockIcon } from '../components/Icons';
import Card, { CardContent } from '../components/ui/Card';

const CreateExam = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject_name: '',
    exam_date: '',
    duration_minutes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.subject_name.trim()) errs.subject_name = 'Subject name is required.';
    if (!form.exam_date) errs.exam_date = 'Exam date is required.';
    if (!form.duration_minutes || isNaN(form.duration_minutes) || +form.duration_minutes <= 0)
      errs.duration_minutes = 'Enter a valid duration (minutes).';
    return errs;
  };

  const handleChange = (e) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await examAPI.create(
        form.subject_name.trim(),
        form.exam_date,
        parseInt(form.duration_minutes)
      );
      // axios wraps data: res.data is the server response body
      const exam = res?.data?.data?.exam || res?.data?.exam || {};
      const examId = exam.exam_id;
      setToast({ message: `Exam "${form.subject_name}" created! Add questions now.`, type: 'success' });
      setTimeout(() => {
        if (examId) {
          navigate(`/admin-dashboard/exam-builder/${examId}`);
        } else {
          navigate('/admin-dashboard/exams');
        }
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create exam. Check backend connection.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Minimum date: today ────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto page-enter">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#e5efdf] flex items-center justify-center">
            <PlusIcon className="w-6 h-6 text-[#7FB77E]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Exam</h1>
        </div>
        <p className="text-gray-500 text-sm ml-14">
          Fill in the details below. Students will see this exam on their dashboard.
        </p>
      </div>

      {/* Form card */}
      <Card className="p-1">
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

            {/* Subject Name */}
            <div className="space-y-2">
              <label htmlFor="subject_name" className="block text-sm font-semibold text-gray-700">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpenIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="subject_name"
                  name="subject_name"
                  type="text"
                  value={form.subject_name}
                  onChange={handleChange}
                  placeholder="e.g. Database Management Systems"
                  className={`w-full bg-white border-2 rounded-xl py-3 pl-12 pr-4 outline-none transition-all focus:border-[#7FB77E] focus:ring-4 focus:ring-[#7FB77E]/10 ${
                    errors.subject_name ? 'border-red-200' : 'border-gray-100'
                  }`}
                />
              </div>
              {errors.subject_name && (
                <p className="text-red-500 text-xs font-medium">{errors.subject_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exam Date */}
              <div className="space-y-2">
                <label htmlFor="exam_date" className="block text-sm font-semibold text-gray-700">
                  Exam Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="exam_date"
                  name="exam_date"
                  type="date"
                  min={today}
                  value={form.exam_date}
                  onChange={handleChange}
                  className={`w-full bg-white border-2 rounded-xl py-3 px-4 outline-none transition-all focus:border-[#7FB77E] focus:ring-4 focus:ring-[#7FB77E]/10 ${
                    errors.exam_date ? 'border-red-200' : 'border-gray-100'
                  }`}
                />
                {errors.exam_date && (
                  <p className="text-red-500 text-xs font-medium">{errors.exam_date}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label htmlFor="duration_minutes" className="block text-sm font-semibold text-gray-700">
                  Duration (Mins) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min="1"
                    max="360"
                    value={form.duration_minutes}
                    onChange={handleChange}
                    placeholder="e.g. 60"
                    className={`w-full bg-white border-2 rounded-xl py-3 pl-12 pr-4 outline-none transition-all focus:border-[#7FB77E] focus:ring-4 focus:ring-[#7FB77E]/10 ${
                      errors.duration_minutes ? 'border-red-200' : 'border-gray-100'
                    }`}
                  />
                </div>
                {errors.duration_minutes && (
                  <p className="text-red-500 text-xs font-medium">{errors.duration_minutes}</p>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {form.subject_name && form.exam_date && form.duration_minutes && (
              <div className="bg-[#f5f9f4] border border-[#e5efdf] rounded-2xl p-5">
                <p className="text-[10px] text-[#4d7f4c] font-bold uppercase tracking-widest mb-3">Live Preview</p>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-gray-800 font-bold text-lg">{form.subject_name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(form.exam_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </p>
                  </div>
                  <div className="shrink-0 bg-[#7FB77E] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {form.duration_minutes} mins
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 bg-[#7FB77E] hover:bg-[#6aa96b] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#7FB77E]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    Create Exam
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin-dashboard')}
                className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 border-2 border-gray-100 hover:border-gray-200 rounded-2xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateExam;
