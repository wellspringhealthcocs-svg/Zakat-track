
import React, { useState } from 'react';
import { AssetType, User } from '../types';
import { CURRENCIES } from '../constants';
import { X } from 'lucide-react';

interface AssetFormProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  onAdd: (asset: any) => Promise<void>;
}

export const AssetForm: React.FC<AssetFormProps> = ({ user, onClose, onSuccess, onAdd }) => {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AssetType>(AssetType.MONEY);
  const [weight, setWeight] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [value, setValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const isMetal = type === AssetType.GOLD || type === AssetType.SILVER;
    const hasCurrency = type === AssetType.MONEY || type === AssetType.BUSINESS;
    
    try {
      await onAdd({
        user_id: user.id,
        name: name || (isMetal ? type : 'General Asset'),
        type,
        weight: isMetal ? parseFloat(weight) : undefined,
        currency: hasCurrency ? currency : undefined,
        value: isMetal ? 0 : parseFloat(value),
      });
      onSuccess();
    } catch (err) {
      alert("Failed to save asset. Check your database connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl transition-colors border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Asset Entry</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Name / Description</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. June Profit, Savings"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            >
              <option value={AssetType.MONEY}>Cash / Bank Balance</option>
              <option value={AssetType.GOLD}>Gold</option>
              <option value={AssetType.SILVER}>Silver</option>
              <option value={AssetType.BUSINESS}>Business Investment</option>
            </select>
          </div>

          {(type === AssetType.GOLD || type === AssetType.SILVER) ? (
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Weight (Grams)</label>
              <input
                type="number"
                required
                step="any"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.00"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
              />
            </div>
          ) : (
            <>
              {(type === AssetType.MONEY || type === AssetType.BUSINESS) && (
                <div>
                  <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Amount</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Saving...' : 'Confirm Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};
