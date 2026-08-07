import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, LogIn, AlertCircle, Sparkles,
  Mail, Phone, Lock, CheckCircle, ShieldCheck, KeyRound
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
  const [sentOtpHint, setSentOtpHint] = useState('');

  // Status & Feedback State
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const { login, sendOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  // Reset errors when switching tab
  const handleTabChange = (method) => {
    setLoginMethod(method);
    setError('');
    setSuccess('');
    setOtpSent(false);
    setOtpCode('');
    setSentOtpHint('');
  };

  /* ── 1. Standard Password Login Handler ── */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
      setSuccess(result.message || 'OTP code sent successfully!');
      if (result.dev_otp) {
        setSentOtpHint(result.dev_otp);
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

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black font-serif text-text-main">Welcome Back</h2>
            <p className="text-text-muted text-sm mt-1">Sign in as User or Admin</p>
          </div>

          {/* Login Mode Tabs (Password / Email OTP / Phone OTP) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-bg-main border border-border-color rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('password')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'password'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main'
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
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main'
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
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Phone size={13} />
              Phone OTP
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-2 bg-emerald-900/30 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
              {sentOtpHint && (
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono font-bold">
                  Code: {sentOtpHint}
                </span>
              )}
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
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Username / Email / Phone
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="Username, email, or mobile number"
                    className="w-full px-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
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
                      className="w-full px-4 py-3.5 pr-12 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        required
                        placeholder="yourname@gmail.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || !emailInput}
                      className="px-4 py-3.5 bg-secondary text-primary font-bold text-xs rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-50 shrink-0"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      required
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-center text-lg font-mono font-bold tracking-widest text-text-main focus:border-primary outline-none transition-all"
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpSent}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Verifying...</>
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
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        required
                        placeholder="e.g. 9876543210"
                        className="w-full pl-11 pr-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || !phoneInput}
                      className="px-4 py-3.5 bg-secondary text-primary font-bold text-xs rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-50 shrink-0"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      required
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-center text-lg font-mono font-bold tracking-widest text-text-main focus:border-primary outline-none transition-all"
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpSent}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Verifying...</>
                  ) : (
                    <><ShieldCheck size={18} /> Verify Phone & Sign In</>
                  )}
                </button>
              </motion.form>
            )}

          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-color" />
            <span className="text-xs text-text-muted font-medium">OR</span>
            <div className="flex-1 h-px bg-border-color" />
          </div>

          {/* Guest / Register / Forgot Password Quick Access */}
          <div className="flex flex-col gap-2 text-center text-sm">
            <p className="text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create one free
              </Link>
            </p>
            <Link to="/forgot-password" className="text-xs text-primary/80 hover:text-primary font-medium hover:underline inline-flex items-center justify-center gap-1 mt-1">
              <KeyRound size={12} /> Forgot Password or Reset Account?
            </Link>
          </div>

        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary" /> Multi-Factor OTP</span>
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-secondary" /> 100% Encrypted</span>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;