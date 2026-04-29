import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/common/ErrorMessage';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const result = await loginApi({ email: form.email, password: form.password, role });
      
      if (result.status === 'success' && result.data) {
        const { token, user, role: userRole } = result.data;
        login({ ...user, token, role: userRole });
        
        if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setError(result.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#2E7D32] to-[#A5D6A7] relative overflow-hidden">
        {/* Dotted Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Branding Text */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white px-12">
          <h1 className="text-4xl font-semibold tracking-wide mb-4">
            Secure Exam System
          </h1>
          <p className="text-lg text-center opacity-90 leading-relaxed max-w-sm">
            AI-powered monitoring platform ensuring fairness, security, and academic integrity.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F5F1E8]">
        <div className="w-full max-w-md px-8 py-12">
          {/* Title */}
          <h2 className="text-3xl font-semibold text-[#1B1B1B] mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 mb-8 font-medium">
            Login to continue to your dashboard
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Reg Num */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {role === 'admin' ? 'Email Address' : 'Registration Number'}
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={form.email}
                onChange={handleChange}
                placeholder={role === 'admin' ? 'Enter admin email' : 'Enter Registration Number'}
                className="w-full px-4 py-3 rounded-lg border border-[#E0E0E0] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#81C784] transition duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" title="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                placeholder="Enter Password"
                className="w-full px-4 py-3 rounded-lg border border-[#E0E0E0] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#81C784] transition duration-200"
              />
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Login As
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => { setRole(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-lg border border-[#E0E0E0] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#81C784] transition duration-200 appearance-none cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Error Message */}
            <ErrorMessage message={error} />

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-[#2E7D32] text-white font-semibold hover:bg-[#1B5E20] transition duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          {/* Footer Demo Info (Minimal) */}
          <div className="mt-10 pt-6 border-t border-[#E0E0E0]">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <p className="text-gray-500">Student:</p>
                <p className="text-gray-700">RA2411026010870 / (any)</p>
              </div>
              <div>
                <p className="text-gray-500">Admin:</p>
                <p className="text-gray-700">admin@exam.com / admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
