import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { ShieldCheckIcon } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
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
      
      // The backend returns { status: 'success', message: '...', data: { token, user, role } }
      if (result.status === 'success' && result.data) {
        const { token, user, role: userRole } = result.data;
        
        console.log("Login success. Storing user and token:", userRole);
        login({ ...user, token, role: userRole });
        
        // Use userRole for navigation
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

  const roleOptions = [
    { value: 'student', label: 'Student Login', desc: 'Access your exams' },
    { value: 'admin', label: 'Admin Login', desc: 'Manage system' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 relative overflow-hidden">
      {/* Decorative background blocks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7FB77E]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#A7D7C5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e5efdf] border border-[#d4e6d0] rounded-2xl mb-4 shadow-sm">
            <ShieldCheckIcon className="w-8 h-8 text-[#558b54]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">ExamGuard</h1>
          <p className="text-gray-500 text-sm font-medium">Online Exam Malpractice Detection System</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Sign in to your account</h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setRole(opt.value); setError(''); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                    ${role === opt.value
                      ? 'bg-[#e5efdf] border-[#7FB77E] text-[#4d7f4c]'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <span className={`text-sm font-bold ${role === opt.value ? 'text-[#4d7f4c]' : 'text-gray-600'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {role === 'admin' ? 'Email address' : 'Registration Number'}
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder={role === 'admin' ? 'admin@exam.com' : 'e.g. RA2411026010894'}
                  className="w-full bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-2.5 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                  className="w-full bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-2.5 outline-none transition-all"
                />
              </div>

              <ErrorMessage message={error} />

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3"
              >
                {loading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Student'}`}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wide">Demo credentials</p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold text-gray-800">Student:</span> RA2411026010870 / (any password)
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Admin:</span> admin@exam.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          &copy; {new Date().getFullYear()} ExamGuard · Malpractice Detection
        </p>
      </div>
    </div>
  );
};

export default Login;
