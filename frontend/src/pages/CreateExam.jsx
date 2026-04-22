// pages/CreateExam.jsx
// Admin page: Create a new exam.
// Route: /admin-dashboard/create-exam  (nested inside AdminLayout)

import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { examAPI } from '../services/api';
import Toast from '../components/Toast';
import { PlusIcon, BookOpenIcon, ClockIcon } from '../components/Icons';

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
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <PlusIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create New Exam</h1>
        </div>
        <p className="text-slate-400 text-sm ml-12">
          Fill in the details below. Students will be able to see and take this exam.
        </p>
      </div>

      {/* Form card */}
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

          {/* Subject Name */}
          <div>
            <label htmlFor="subject_name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Subject Name <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                id="subject_name"
                name="subject_name"
                type="text"
                value={form.subject_name}
                onChange={handleChange}
                placeholder="e.g. Database Management Systems"
                className={`input-field pl-9 ${errors.subject_name ? 'border-red-500/60' : ''}`}
              />
            </div>
            {errors.subject_name && (
              <p className="text-red-400 text-xs mt-1.5">{errors.subject_name}</p>
            )}
          </div>

          {/* Exam Date */}
          <div>
            <label htmlFor="exam_date" className="block text-sm font-medium text-slate-300 mb-1.5">
              Exam Date <span className="text-indigo-400">*</span>
            </label>
            <input
              id="exam_date"
              name="exam_date"
              type="date"
              min={today}
              value={form.exam_date}
              onChange={handleChange}
              className={`input-field ${errors.exam_date ? 'border-red-500/60' : ''}`}
              style={{ colorScheme: 'dark' }}
            />
            {errors.exam_date && (
              <p className="text-red-400 text-xs mt-1.5">{errors.exam_date}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-medium text-slate-300 mb-1.5">
              Duration <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="1"
                max="360"
                value={form.duration_minutes}
                onChange={handleChange}
                placeholder="e.g. 60"
                className={`input-field pl-9 ${errors.duration_minutes ? 'border-red-500/60' : ''}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
                minutes
              </span>
            </div>
            {errors.duration_minutes && (
              <p className="text-red-400 text-xs mt-1.5">{errors.duration_minutes}</p>
            )}
          </div>

          {/* Preview badge */}
          {form.subject_name && form.exam_date && form.duration_minutes && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">Preview</p>
              <p className="text-white font-semibold">{form.subject_name}</p>
              <p className="text-slate-400 text-sm mt-0.5">
                {new Date(form.exam_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                &nbsp;·&nbsp;{form.duration_minutes} minutes
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              id="create-exam-btn"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Create Exam
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="px-5 py-3 text-sm text-slate-400 hover:text-white border border-slate-700/40 
                         hover:border-slate-600 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
