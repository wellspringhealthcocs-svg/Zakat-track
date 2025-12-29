
import React, { useState } from 'react';
import { User } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { X } from 'lucide-react';

interface PaymentFormProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  onAdd: (payment: any) => Promise<void>;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ user, onClose, onSuccess, onAdd }) => {
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        user_id: user.id,
        name: name || 'General Zakat Payment',
        amount: parseFloat(amount),
        date,
        method
      });
      onSuccess();
    } catch (err) {
      alert("Failed to save payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl transition-colors border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Record Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Payment Name / Description</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gave to orphans, Mosque donation"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Amount Paid (USD)</label>
            <input
              type="number"
              required
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            >
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all mt-4"
          >
            {isSubmitting ? 'Processing...' : 'Complete Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};
