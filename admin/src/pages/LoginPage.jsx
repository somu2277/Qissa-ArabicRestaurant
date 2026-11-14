import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@qissa.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password.trim());
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@qissa.com');
    setPassword('password123');
    setError('');
  };

  const handleQuickLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('admin@qissa.com', 'password123');
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to sign in. Please verify backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6F0]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E9ECEF] shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#E8602C] text-white flex items-center justify-center mx-auto mb-4 font-serif text-2xl font-bold shadow-md shadow-[#E8602C]/25">
            Q
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Admin Portal</h1>
          <p className="text-xs text-[#6B655D] mt-1">Sign in to manage Qissa Arabic Restaurant</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-[#6B655D]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@qissa.com"
                className="w-full pl-11 pr-4 py-3 bg-[#FAF6F0] border border-[#E0D7C9] rounded-2xl text-xs text-[#1A1A1A] outline-none focus:border-[#E8602C] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-[#6B655D]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 bg-[#FAF6F0] border border-[#E0D7C9] rounded-2xl text-xs text-[#1A1A1A] outline-none focus:border-[#E8602C] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-[#6B655D] hover:text-[#1A1A1A]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-2xl bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#E8602C]/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F2EBE0] text-center space-y-3">
          <p className="text-[11px] text-[#6B655D]">
            Default Demo Credentials: <br />
            <strong className="text-[#1A1A1A]">admin@qissa.com</strong> /{' '}
            <strong className="text-[#1A1A1A]">password123</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs text-white bg-[#E8602C] hover:bg-[#D14E1E] font-bold py-2 px-4 rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Login</span>
            </button>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs text-[#E8602C] hover:text-[#D14E1E] font-bold py-2 px-3 rounded-xl bg-[#E8602C]/10 hover:bg-[#E8602C]/20 transition-colors"
            >
              <span>Auto-fill Fields</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
