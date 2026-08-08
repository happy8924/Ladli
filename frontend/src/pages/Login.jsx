import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, LogIn, AlertCircle, Sparkles, Smartphone,
  Mail, Phone, Lock, CheckCircle2, ShieldCheck, KeyRound, ArrowRight
} from 'lucide-react';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'email_otp' | 'phone_otp'

  // Password Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Email / Phone OTP Login State
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode]       = useState('');
  const [otpSent, setOtpSent]       = useState(false);

  // Status & Feedback State
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [simulatedToast, setSimulatedToast] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const { login, sendOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  // Reset dark mode on mount so login is always bright & readable
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Reset feedback state when switching tab
  const handleTabChange = (method) => {
    setLoginMethod(method);
    setError('');
    setSuccess('');
    setSimulatedToast(null);
    setOtpSent(false);
    setOtpCode('');
  };

  /* ── 1. Standard Password Login Handler ── */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setSimulatedToast(null);

    if (!username || !password) {
      setError('Please enter your username/email/phone and password');
      setLoading(false);
      return;
    }

    const result = await login(username, password);
    if (result.success) {
      if (result.role === 'admin' || result.role === 'logistics') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Invalid username, email/phone, or password');
    }
    setLoading(false);
  };

  /* ── 2. Send OTP Handler (Email or Phone) ── */
  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    setSimulatedToast(null);

    const targetInput = loginMethod === 'email_otp' ? emailInput : phoneInput;
    if (!targetInput) {
      setError(loginMethod === 'email_otp' ? 'Please enter a valid Email address' : 'Please enter a valid Phone number');
      return;
    }

    setOtpSending(true);
    const result = await sendOtp(targetInput, 'login');
    setOtpSending(false);

    if (result.success) {
      setOtpSent(true);
      setSuccess(result.message || 'Verification OTP code dispatched successfully!');
      if (result.simulated_toast) {
        setSimulatedToast(result.simulated_toast);
      }
    } else {
      setError(result.message || 'Failed to send OTP code');
    }
  };

  /* ── 3. Verify OTP & Login Handler ── */
  const handleOtpLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetInput = loginMethod === 'email_otp' ? emailInput : phoneInput;

    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the 6-digit verification code sent to your ' + (loginMethod === 'email_otp' ? 'email' : 'phone'));
      return;
    }

    setLoading(true);
    const result = await loginWithOtp(targetInput, otpCode);
    setLoading(false);

    if (result.success) {
      if (result.role === 'admin' || result.role === 'logistics') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Invalid or expired OTP code');
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

        {/* Form Card */}
        <div className="bg-white border border-[#EADBC8] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-[#800000]/5">

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black font-serif text-[#1A0A0A]">Welcome Back</h2>
            <p className="text-[#554444] text-xs mt-1">Sign in as Customer or Store Administrator</p>
          </div>

          {/* Login Method Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('password')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'password'
                  ? 'bg-[#800000] text-white shadow-md'
                  : 'text-[#554444] hover:text-[#800000]'
              }`}
            >
              <Lock size={13} />
              Password
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('email_otp')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'email_otp'
                  ? 'bg-[#800000] text-white shadow-md'
                  : 'text-[#554444] hover:text-[#800000]'
              }`}
            >
              <Mail size={13} />
              Email OTP
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('phone_otp')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'phone_otp'
                  ? 'bg-[#800000] text-white shadow-md'
                  : 'text-[#554444] hover:text-[#800000]'
              }`}
            >
              <Phone size={13} />
              Phone OTP
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl mb-5 text-xs font-semibold leading-relaxed shadow-sm"
            >
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl mb-4 text-xs font-semibold leading-relaxed shadow-sm"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {simulatedToast && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1E293B] text-slate-100 p-4 rounded-2xl border border-amber-500/30 shadow-xl mb-5 text-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2 border-b border-slate-700/60 pb-2">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Smartphone size={15} /> {simulatedToast.title}
                </span>
                <span className="bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-md text-[11px] font-black tracking-wider">
                  OTP: {simulatedToast.code}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {simulatedToast.notice}
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* ════════ MODE 1: PASSWORD LOGIN ════════ */}
            {loginMethod === 'password' && (
              <motion.form
                key="password_form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handlePasswordSubmit}
                className="flex flex-col gap-4"
              >
                {/* Username / Email / Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">
                    Username / Email / Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="Enter username, email or mobile number"
                    className="w-full px-4 py-3.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#554444] uppercase tracking-wider">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs text-[#800000] hover:underline font-bold">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 pr-12 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000] transition-colors p-1"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-[#800000]/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Signing in...</>
                  ) : (
                    <><LogIn size={18} /> Sign In with Password</>
                  )}
                </button>
              </motion.form>
            )}

            {/* ════════ MODE 2: EMAIL OTP LOGIN ════════ */}
            {loginMethod === 'email_otp' && (
              <motion.form
                key="email_otp_form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleOtpLoginSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        required
                        placeholder="yourname@gmail.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || !emailInput}
                      className="px-4 py-3.5 bg-[#C9A227] hover:bg-[#B8901F] text-[#4A0000] font-black text-xs rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="• • • • • •"
                      className="w-full py-3.5 px-4 bg-[#FAF7F2] border-2 border-[#C9A227] rounded-2xl text-center text-xl font-mono font-black tracking-[0.4em] text-[#800000] focus:bg-white focus:border-[#800000] outline-none transition-all"
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpSent}
                  className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-[#800000]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Verifying OTP...</>
                  ) : (
                    <><ShieldCheck size={18} /> Verify Email & Sign In</>
                  )}
                </button>
              </motion.form>
            )}

            {/* ════════ MODE 3: PHONE OTP LOGIN ════════ */}
            {loginMethod === 'phone_otp' && (
              <motion.form
                key="phone_otp_form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleOtpLoginSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        required
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || !phoneInput}
                      className="px-4 py-3.5 bg-[#C9A227] hover:bg-[#B8901F] text-[#4A0000] font-black text-xs rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="• • • • • •"
                      className="w-full py-3.5 px-4 bg-[#FAF7F2] border-2 border-[#C9A227] rounded-2xl text-center text-xl font-mono font-black tracking-[0.4em] text-[#800000] focus:bg-white focus:border-[#800000] outline-none transition-all"
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpSent}
                  className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-[#800000]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Verifying OTP...</>
                  ) : (
                    <><ShieldCheck size={18} /> Verify Phone & Sign In</>
                  )}
                </button>
              </motion.form>
            )}

          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#EADBC8]" />
            <span className="text-xs text-[#554444] font-bold">OR</span>
            <div className="flex-1 h-px bg-[#EADBC8]" />
          </div>

          {/* Guest / Register / Forgot Password Quick Access */}
          <div className="flex flex-col gap-2 text-center text-xs font-medium text-[#554444]">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="text-[#800000] font-black hover:underline">
                Create one free
              </Link>
            </p>
            <Link to="/forgot-password" className="text-xs text-[#800000]/80 hover:text-[#800000] font-bold hover:underline inline-flex items-center justify-center gap-1 mt-1">
              <KeyRound size={13} /> Forgot Password or Reset Account?
            </Link>
          </div>

        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs font-semibold text-[#800000]/80">
          <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-[#C9A227]" /> Multi-Factor OTP</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#800000]" /> 100% Encrypted</span>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;