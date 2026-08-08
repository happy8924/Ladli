import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

const Register = () => {
  const navigate      = useNavigate();
  const { register }  = useAuth();

  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [loading, setLoading]         = useState(false);

  // Clear dark mode on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-600'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!formData.username || !formData.email || !formData.password)
      return setError('Username, email, and password are required');
    if (formData.password !== formData.confirmPassword)
      return setError('Passwords do not match');
    if (formData.password.length < 6)
      return setError('Password must be at least 6 characters');

    try {
      setLoading(true);
      const result = await register(formData.username, formData.email, formData.password, formData.phone);
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
    { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a unique username' },
    { name: 'email',    label: 'Email Address', type: 'email', placeholder: 'yourname@gmail.com' },
    { name: 'phone',    label: 'Mobile Phone (Optional)', type: 'tel', placeholder: 'e.g. 9876543210' },
  ];

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
            <h2 className="text-2xl font-black font-serif text-[#1A0A0A]">Create Account</h2>
            <p className="text-[#554444] text-xs mt-1">Join the Ladli boutique family today — it's free!</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl mb-5 text-xs font-semibold leading-relaxed shadow-sm"
            >
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" /> <span>{error}</span>
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl mb-5 text-xs font-semibold leading-relaxed shadow-sm"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required={f.name !== 'phone'}
                  className="w-full px-4 py-3.5 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                />
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-[#FAF7F2] border border-[#EADBC8] rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 outline-none transition-all font-medium"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000] p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-[#EADBC8]'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-[#554444]">{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#554444] uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  className={`w-full px-4 py-3.5 pr-12 bg-[#FAF7F2] border rounded-2xl text-[#1A0A0A] text-sm placeholder:text-slate-400 focus:bg-white outline-none transition-all font-medium ${
                    formData.confirmPassword
                      ? formData.password === formData.confirmPassword
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                        : 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-[#EADBC8] focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000] p-1">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle2 size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-600" />
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-[#800000]/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
            <div className="flex-1 h-px bg-[#EADBC8]" />
            <span className="text-xs text-[#554444] font-bold">Already a member?</span>
            <div className="flex-1 h-px bg-[#EADBC8]" />
          </div>

          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 border border-[#EADBC8] text-[#554444] bg-[#FAF7F2] hover:bg-white hover:text-[#800000] hover:border-[#800000] py-3.5 rounded-2xl font-bold text-xs transition-all shadow-sm"
          >
            Sign In Instead
          </Link>

        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs font-semibold text-[#800000]/80">
          <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-[#C9A227]" /> Free to join</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#800000]" /> 100% Encrypted</span>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;