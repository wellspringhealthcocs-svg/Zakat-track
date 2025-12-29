
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoonStar } from 'lucide-react';

interface WelcomeScreenProps {
  username: string;
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ username, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center text-white"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
          <MoonStar className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Zakat Track</h1>
        <p className="text-slate-400 mt-2 font-light">Loading dashboard...</p>
      </motion.div>
    </motion.div>
  );
};
