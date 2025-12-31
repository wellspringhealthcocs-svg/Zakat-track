
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonStar, ArrowRight, User as UserIcon, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { tursoService } from '../services/tursoService';
import { User } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'welcome' | 'login' | 'signup';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'login') {
        const user = await tursoService.login(formData.username, formData.password);
        onAuthSuccess(user);
      } else {
        const user = await tursoService.startSignup(formData.username, formData.email, formData.password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {mode === 'welcome' ? (
          <motion.div
            key="welcome"
            variants={containerVariants}
            initial="initial" animate="animate" exit="exit"
            className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <MoonStar className="text-emerald-600 dark:text-emerald-400" size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Zakat Track</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed italic">
              Empowering your path to wealth purification through precision and mindfulness.
            </p>
            <div className="space-y-4">
              <button onClick={() => setMode('login')} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group">
                Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setMode('signup')} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                Create Account
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auth-form"
            variants={containerVariants}
            initial="initial" animate="animate" exit="exit"
            className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800"
          >
            <div className="mb-8">
              <button onClick={() => setMode('welcome')} className="text-slate-400 hover:text-emerald-600 text-sm font-bold flex items-center gap-1 transition-colors mb-4">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{mode === 'login' ? 'Welcome Back' : 'Get Started'}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{mode === 'login' ? 'Sign in to your Zakat dashboard' : 'Join us to track and purify your assets'}</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 mb-6">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  required 
                  placeholder="Username" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium" 
                />
              </div>

              {mode === 'signup' && (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    required 
                    placeholder="Email Address" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium" 
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 mt-4">
                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
