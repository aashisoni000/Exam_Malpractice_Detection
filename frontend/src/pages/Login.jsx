// pages/Login.jsx
// Modern login page with role selection, email/password fields, and API call.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { ShieldCheckIcon } from '../components/Icons';

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(form.email, form.password, role);

      if (data.success) {
        setUser(data.user);
        navigate(data.redirectTo);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach server. Is the backend running?'
          : 'An unexpected error occurred.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student Login', desc: 'Access your exams and reports' },
    { value: 'admin', label: 'Admin Login', desc: 'Manage students and view suspicion logs' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4 shadow-lg shadow-indigo-900/30">
            <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">ExamGuard</h1>
          <p className="text-slate-400 text-sm">Online Exam Malpractice Detection System</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setRole(opt.value); setError(''); }}
                className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200
                  ${role === opt.value
                    ? 'bg-indigo-600/20 border-indigo-500/60 shadow-md shadow-indigo-900/30'
                    : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/70'
                  }`}
              >
                {/* Radio dot */}
                <span className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center
                  ${role === opt.value ? 'border-indigo-400' : 'border-slate-600'}`}>
                  {role === opt.value && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 block" />
                  )}
                </span>
                <span className={`text-sm font-semibold ${role === opt.value ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder={role === 'admin' ? 'admin@exam.com' : 'student@exam.com'}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                `Sign in as ${role === 'admin' ? 'Admin' : 'Student'}`
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <p className="text-xs text-slate-500 font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-slate-600">
              Student: <span className="text-slate-400">student@exam.com / student123</span>
            </p>
            <p className="text-xs text-slate-600">
              Admin: <span className="text-slate-400">admin@exam.com / admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          &copy; {new Date().getFullYear()} ExamGuard · Online Exam Malpractice Detection
        </p>
      </div>
    </div>
  );
};

export default Login;
