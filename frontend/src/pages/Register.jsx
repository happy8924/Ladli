import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const Register = () => {
  const navigate      = useNavigate();
  const { register }  = useAuth();

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [loading, setLoading]         = useState(false);

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  // Password strength
  const strength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!formData.username || !formData.email || !formData.password)
      return setError('All fields are required');
    if (formData.password !== formData.confirmPassword)
      return setError('Passwords do not match');
    if (formData.password.length < 6)
      return setError('Password must be at least 6 characters');

    try {
      setLoading(true);
      const result = await register(formData.username, formData.email, formData.password);
      if (result.success) {
        setSuccess('Account created! Redirecting to login…');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username', icon: null },
    { name: 'email',    label: 'Email Address', type: 'email', placeholder: 'your@email.com', icon: null },
  ];

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
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

          <div className="mb-6">
            <h2 className="text-2xl font-black font-serif text-text-main">Create Account</h2>
            <p className="text-text-muted text-sm mt-1">Join the Ladli family today — it's free!</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
            >
              <AlertCircle size={16} className="shrink-0" /> {error}
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-green-900/30 border border-green-500/40 text-green-400 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
            >
              <CheckCircle size={16} className="shrink-0" /> {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Username + Email */}
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required
                  className="w-full px-4 py-3.5 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                />
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-bg-main border border-border-color rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-border-color'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  className={`w-full px-4 py-3.5 pr-12 bg-bg-main border rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:ring-1 outline-none transition-all ${
                    formData.confirmPassword
                      ? formData.password === formData.confirmPassword
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border-color focus:border-primary focus:ring-primary/30'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            {/* Terms note */}
            <p className="text-xs text-text-muted">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Creating account…</>
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-color" />
            <span className="text-xs text-text-muted font-medium">Already a member?</span>
            <div className="flex-1 h-px bg-border-color" />
          </div>

          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 border border-border-color text-text-muted py-3 rounded-xl font-bold text-sm hover:border-primary/40 hover:text-text-main transition-all"
          >
            Sign In Instead
          </Link>

        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary" /> Free to join</span>
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-secondary" /> No spam ever</span>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;