import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, User, Lock, Eye, EyeOff, ArrowLeft, Phone,
  AlertCircle, CheckCircle2, ShieldCheck, KeyRound, Sparkles
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
  const [loading, setLoading] = useState(false);

  // Clear dark mode on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A0A0A] flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">

      {/* Subtle Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#800000]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block group">
            <h1 className="text-4xl font-black font-serif text-[#800000] tracking-tight group-hover:opacity-90 transition-opacity">
              LADLI<span className="text-[#C9A227]">.</span>
            </h1>
          </Link>
          <p className="text-xs font-semibold text-[#800000]/70 uppercase tracking-widest mt-1">
            Authentic Chaniya Choli Boutique
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#EADBC8] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-[#800000]/5">

          {/* Back link */}
          {step !== 3 && (
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[#554444] hover:text-[#800000] text-xs font-bold mb-6 transition-colors">
              <ArrowLeft size={15} /> Back to Login
            </Link>
          )}

          {/* Step indicator */}
          {step !== 3 && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#800000]' : 'bg-[#EADBC8]'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#800000]' : 'bg-[#EADBC8]'}`} />
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ════════ STEP 1: Find Account ════════ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-[#800000]/10 border border-[#800000]/20 rounded-2xl flex items-center justify-center mb-4 text-[#800000]">
                    <KeyRound size={22} />
                  </div>
                  <h2 className="text-2xl font-black font-serif text-[#1A0A0A]">Forgot Password?</h2>
                  <p className="text-[#554444] text-xs mt-1">Enter your registered Username, Email address, or Mobile number</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl mb-5 text-xs font-semibold leading-relaxed shadow-sm">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" /> <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">Username / Email / Mobile</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Enter username, email, or phone"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-[#800000]/20 active:scale-[0.98] disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Finding Account...</>
                    ) : 'Send Verification Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ════════ STEP 2: Verify Code & Reset Password ════════ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center mb-4 text-emerald-800">
                    <ShieldCheck size={22} />
                  </div>
                  <h2 className="text-2xl font-black font-serif text-[#1A0A0A]">Set New Password</h2>
                  <p className="text-[#554444] text-xs mt-1">Verification code sent to <strong className="text-[#1A0A0A] font-bold">{identifier}</strong></p>
                </div>

                {successMsg && (
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl mb-5 text-xs font-semibold leading-relaxed shadow-sm">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl mb-5 text-xs font-semibold leading-relaxed shadow-sm">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" /> <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleReset} className="flex flex-col gap-4">

                  {/* OTP Code */}
                  <div>
                    <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      required
                      className="w-full py-3.5 px-4 bg-[#FAF7F2] border-2 border-[#C9A227] rounded-2xl text-center text-xl font-mono font-black tracking-[0.4em] text-[#800000] focus:bg-white focus:border-[#800000] outline-none transition-all"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        className="w-full pl-11 pr-12 py-3.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000] p-1">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full pl-11 pr-12 py-3.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                      />
                      <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000] p-1">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-[#800000]/20 active:scale-[0.98] disabled:opacity-60 mt-2"
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
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-700">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-black font-serif text-[#1A0A0A] mb-2">Password Reset Success!</h2>
                <p className="text-[#554444] text-xs">Your account password has been updated. Redirecting to login…</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
