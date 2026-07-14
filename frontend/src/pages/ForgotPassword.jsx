import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, User, Lock, Eye, EyeOff, ArrowLeft,
  AlertCircle, CheckCircle, ShieldCheck, KeyRound
} from 'lucide-react';
import api from '../api/api';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = verify, 2 = reset, 3 = success
  const [form, setForm] = useState({ username: '', email: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  /* ── Step 1: Verify username + email ── */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/verify', {
        username: form.username,
        email: form.email,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Account not found. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Set new password ── */
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.newPassword || form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', {
        username: form.username,
        email: form.email,
        new_password: form.newPassword,
      });
      setStep(3);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-black font-serif text-white tracking-tight">
              LADLI<span className="text-secondary">.</span>
            </h1>
          </Link>
          <p className="text-text-muted text-sm mt-2">Authentic Chaniya Choli Boutique</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border-color rounded-3xl p-8 shadow-2xl">

          {/* Back link */}
          {step !== 3 && (
            <Link to="/login" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-main text-sm font-medium mb-6 transition-colors">
              <ArrowLeft size={15} /> Back to Login
            </Link>
          )}

          {/* Step indicator */}
          {step !== 3 && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border-color'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border-color'}`} />
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ════════ STEP 1: Verify Identity ════════ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <KeyRound size={22} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-black font-serif text-text-main">Forgot Password?</h2>
                  <p className="text-text-muted text-sm mt-1">Enter your username and email to verify your account</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Username</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text" name="username" value={form.username} onChange={handleChange}
                        placeholder="Enter your username" required
                        className="w-full pl-11 pr-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email" name="email" value={form.email} onChange={handleChange}
                        placeholder="your@email.com" required
                        className="w-full pl-11 pr-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Verifying...</>
                    ) : 'Continue'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ════════ STEP 2: Reset Password ════════ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck size={22} className="text-green-400" />
                  </div>
                  <h2 className="text-2xl font-black font-serif text-text-main">Set New Password</h2>
                  <p className="text-text-muted text-sm mt-1">Identity verified! Choose a new password for your account</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <form onSubmit={handleReset} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showPass ? 'text' : 'password'} name="newPassword" value={form.newPassword} onChange={handleChange}
                        placeholder="Min 6 characters" required
                        className="w-full pl-11 pr-12 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                        placeholder="Re-enter new password" required
                        className="w-full pl-11 pr-12 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Resetting...</>
                    ) : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ════════ STEP 3: Success ════════ */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-black font-serif text-text-main mb-2">Password Reset!</h2>
                <p className="text-text-muted text-sm">Redirecting you to login…</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
