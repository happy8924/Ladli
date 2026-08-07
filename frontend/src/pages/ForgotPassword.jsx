import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, User, Lock, Eye, EyeOff, ArrowLeft, Phone,
  AlertCircle, CheckCircle, ShieldCheck, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { verifyForgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1 = Find Account, 2 = Verify Code & Reset, 3 = Success
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Step 1: Verify Username / Email / Phone ── */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier) {
      setError('Please enter your Username, Email, or Mobile Phone number.');
      return;
    }

    setLoading(true);
    const result = await verifyForgotPassword(identifier);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Verification code sent!');
      if (result.dev_otp) {
        setOtpHint(result.dev_otp);
      }
      setStep(2);
    } else {
      setError(result.message || 'Account not found. Please check your details.');
    }
  };

  /* ── Step 2: Set New Password with Verification Code ── */
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the verification code sent to your email/phone.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(identifier, otpCode, newPassword);
    setLoading(false);

    if (result.success) {
      setStep(3);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError(result.message || 'Failed to reset password. Please check the OTP code.');
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

            {/* ════════ STEP 1: Find Account ════════ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <KeyRound size={22} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-black font-serif text-text-main">Forgot Password?</h2>
                  <p className="text-text-muted text-sm mt-1">Enter your Username, Email address, or Mobile number</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Username / Email / Mobile</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Enter username, email, or phone"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Finding Account...</>
                    ) : 'Send Reset Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ════════ STEP 2: Verify Code & Reset Password ════════ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck size={22} className="text-green-400" />
                  </div>
                  <h2 className="text-2xl font-black font-serif text-text-main">Set New Password</h2>
                  <p className="text-text-muted text-sm mt-1">Enter the verification code sent to <strong className="text-text-main">{identifier}</strong></p>
                </div>

                {successMsg && (
                  <div className="flex items-center justify-between gap-2 bg-emerald-900/30 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                    <span>{successMsg}</span>
                    {otpHint && (
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono font-bold">
                        Code: {otpHint}
                      </span>
                    )}
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <form onSubmit={handleReset} className="flex flex-col gap-4">

                  {/* OTP Code */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="e.g. 123456"
                      required
                      className="w-full px-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-center text-lg font-mono font-bold tracking-widest text-text-main focus:border-primary outline-none transition-all"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        className="w-full pl-11 pr-12 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full pl-11 pr-12 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Resetting Password...</>
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
                <h2 className="text-2xl font-black font-serif text-text-main mb-2">Password Reset Success!</h2>
                <p className="text-text-muted text-sm">Your password has been updated. Redirecting to login…</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
