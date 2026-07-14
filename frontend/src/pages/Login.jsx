import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(username, password);
    if (result.success) {
      if (result.role === 'admin' || result.role === 'logistics') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Invalid username or password');
    }
    setLoading(false);
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

          <div className="mb-6">
            <h2 className="text-2xl font-black font-serif text-text-main">Welcome Back</h2>
            <p className="text-text-muted text-sm mt-1">Sign in to your Ladli account</p>
          </div>

          {/* Error */}
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
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
                <><LogIn size={18} /> Sign In</>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-color" />
            <span className="text-xs text-text-muted font-medium">OR</span>
            <div className="flex-1 h-px bg-border-color" />
          </div>

          {/* Guest / Register */}
          <div className="text-center">
            <p className="text-text-muted text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary" /> Secure Login</span>
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-secondary" /> 100% Private</span>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;