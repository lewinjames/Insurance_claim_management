import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, KeyRound, Mail, Sparkles } from 'lucide-react';
import FeedbackAlert from '../components/FeedbackAlert.jsx';

export default function Login() {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  // Controlled form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Controlled form submission using event.preventDefault() as specified in technical requirements
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic frontend validation
    if (!email.trim() || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setFormError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setLoading(true);
    setFormError('');
    const res = await quickLogin(role);
    setLoading(false);
    if (res?.success) {
      navigate('/');
    } else {
      setFormError(res?.message || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Insurance Claim Portal</h2>
        <p className="mt-1 text-sm text-slate-500">
          Project 29 Mini-Project • React & Express JWT Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {formError && <FeedbackAlert type="error" message={formError} onDismiss={() => setFormError('')} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@insurance.edu"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Box for College Examiners / Lab Demo */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Test Credentials (Lab Presentation):</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Admin')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 transition text-xs font-medium cursor-pointer"
              >
                <span className="font-bold">Admin</span>
                <span className="text-[10px] text-purple-600">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Claim Officer')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 transition text-xs font-medium cursor-pointer"
              >
                <span className="font-bold">Officer</span>
                <span className="text-[10px] text-amber-600">Review Claims</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Policyholder')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition text-xs font-medium cursor-pointer"
              >
                <span className="font-bold">Policyholder</span>
                <span className="text-[10px] text-emerald-600">File & Track</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
