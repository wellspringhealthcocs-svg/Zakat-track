
import React, { useState, useEffect, useCallback } from 'react';
import { User, Asset, Payment, AssetType, BlogPost } from './types';
import { tursoService } from './services/tursoService';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AssetForm } from './components/AssetForm';
import { PaymentForm } from './components/PaymentForm';
import { AuthScreen } from './components/AuthScreen';
import { ZAKAT_RATE, CURRENCIES, BLOG_POSTS } from './constants';
import { 
  Plus, 
  History, 
  LayoutDashboard, 
  FileDown, 
  LogOut, 
  MoonStar, 
  Wallet,
  Calculator,
  AlertCircle,
  Menu,
  X as CloseIcon,
  RefreshCw,
  TrendingUp,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Instagram,
  BookOpen,
  ArrowLeft,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zakat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [view, setView] = useState<'dashboard' | 'history' | 'blog' | 'post'>('dashboard');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    tursoService.initializeDatabase();
  }, []);

  // SEO Management
  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (view === 'dashboard') {
      document.title = 'Dashboard | Zakat Track Calculator 2025';
      metaDescription?.setAttribute('content', 'Access your Zakat dashboard. Calculate nisab thresholds for gold, silver, and business wealth instantly.');
    } else if (view === 'history') {
      document.title = 'Payment History | Zakat Track';
      metaDescription?.setAttribute('content', 'Review your past Zakat payments and financial purification history.');
    } else if (view === 'blog') {
      document.title = 'Islamic Wealth Knowledge Base | Zakat Track Blog';
      metaDescription?.setAttribute('content', 'Expert guides on Zakat nisab, gold Karat calculations, and business asset purification.');
    } else if (view === 'post' && selectedPostId) {
      const post = BLOG_POSTS.find(p => p.id === selectedPostId);
      if (post) {
        document.title = `${post.title} | Zakat Track`;
        metaDescription?.setAttribute('content', post.excerpt);
      }
    }
  }, [view, selectedPostId]);

  // Zakat Calculation State
  const [calculatedZakat, setCalculatedZakat] = useState<{ amount: number; currency: string } | null>(null);
  const [showCalculationPrompt, setShowCalculationPrompt] = useState(false);
  const [calcStep, setCalcStep] = useState<1 | 2>(1);
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [goldRate, setGoldRate] = useState<string>('');
  const [silverRate, setSilverRate] = useState<string>('');
  const [exchangeRates, setExchangeRates] = useState<Record<string, string>>({});

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleAuthSuccess = (userData: User) => {
    localStorage.setItem('zakat_user', JSON.stringify(userData));
    setUser(userData);
    setIsWelcoming(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('zakat_user');
    setUser(null);
    setView('dashboard');
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [assetsData, paymentsData] = await Promise.all([
        tursoService.fetchAssets(user.id),
        tursoService.fetchPayments(user.id)
      ]);
      setAssets(assetsData);
      setPayments(paymentsData);
    } catch (err: any) {
      console.error(err);
      setError(`Database Error: ${err.message || 'Check your internet or Turso credentials.'}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !isWelcoming) {
      fetchData();
    }
  }, [user, isWelcoming, fetchData]);

  const hasGold = assets.some(a => a.type === AssetType.GOLD);
  const hasSilver = assets.some(a => a.type === AssetType.SILVER);
  const otherCurrencies = [...new Set(assets.filter(a => (a.type === AssetType.MONEY || a.type === AssetType.BUSINESS) && a.currency && a.currency !== baseCurrency).map(a => a.currency!))];

  const startCalculation = () => {
    setCalcStep(1);
    setShowCalculationPrompt(true);
  };

  const proceedToRates = () => {
    setCalcStep(2);
  };

  const performFinalCalculation = () => {
    const gRate = parseFloat(goldRate) || 0;
    const sRate = parseFloat(silverRate) || 0;
    
    let totalValueInBase = 0;
    assets.forEach(asset => {
      if (asset.type === AssetType.GOLD) {
        totalValueInBase += (asset.weight || 0) * gRate;
      } else if (asset.type === AssetType.SILVER) {
        totalValueInBase += (asset.weight || 0) * sRate;
      } else if (asset.type === AssetType.MONEY || asset.type === AssetType.BUSINESS) {
        if (!asset.currency || asset.currency === baseCurrency) {
          totalValueInBase += asset.value;
        } else {
          const rate = parseFloat(exchangeRates[asset.currency!] || '1');
          totalValueInBase += asset.value * rate;
        }
      }
    });

    setCalculatedZakat({ amount: totalValueInBase * ZAKAT_RATE, currency: baseCurrency });
    setShowCalculationPrompt(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); 
    doc.text('Zakat Track Portfolio', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text(`User: ${user?.username || 'Guest'}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    autoTable(doc, {
      startY: 50,
      head: [['Name', 'Type', 'Quantity', 'Value']],
      body: assets.map(a => [
        a.name,
        a.type,
        a.weight ? `${a.weight}g` : (a.currency || '-'),
        a.type === AssetType.GOLD || a.type === AssetType.SILVER ? 'Market Based' : `${a.value.toLocaleString()} ${a.currency || ''}`
      ]),
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`Zakat_Report_${user?.username || 'user'}.pdf`);
  };

  const currencyTotals = assets.reduce((acc, a) => {
    if (a.type === AssetType.MONEY || a.type === AssetType.BUSINESS) {
      const cur = a.currency || 'Generic';
      acc[cur] = (acc[cur] || 0) + a.value;
    }
    return acc;
  }, {} as Record<string, number>);

  const metalTotals = assets.reduce((acc, a) => {
    if (a.type === AssetType.GOLD || a.type === AssetType.SILVER) {
      acc[a.type] = (acc[a.type] || 0) + (a.weight || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  const SidebarContent = () => (
    <nav className="h-full flex flex-col p-4">
      <div className={`flex items-center gap-3 mb-10 transition-all duration-300 ${isSidebarMinimized ? 'px-1 justify-center' : 'px-2'}`}>
        <div className="bg-emerald-600 p-2 rounded-lg shrink-0">
          <MoonStar className="text-white" size={20} />
        </div>
        {!isSidebarMinimized && <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100 truncate">Zakat Track</span>}
      </div>

      <div className="flex-1 space-y-2">
        <button onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center transition-all ${isSidebarMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <LayoutDashboard size={20} />
          {!isSidebarMinimized && <span className="font-semibold">Dashboard</span>}
        </button>
        <button onClick={() => { setView('history'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center transition-all ${isSidebarMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl ${view === 'history' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <History size={20} />
          {!isSidebarMinimized && <span className="font-semibold">History</span>}
        </button>
        <button onClick={() => { setView('blog'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center transition-all ${isSidebarMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl ${view === 'blog' || view === 'post' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <BookOpen size={20} />
          {!isSidebarMinimized && <span className="font-semibold">Knowledge Base</span>}
        </button>
        <button onClick={exportPDF} className={`w-full flex items-center transition-all ${isSidebarMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}>
          <FileDown size={20} />
          {!isSidebarMinimized && <span className="font-semibold">Export Report</span>}
        </button>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto space-y-4">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`w-full flex items-center transition-all ${isSidebarMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!isSidebarMinimized && <span className="font-semibold">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <div className={`flex items-center transition-all duration-300 ${isSidebarMinimized ? 'justify-center px-1' : 'gap-3 px-2'} mb-2`}>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 uppercase text-sm shrink-0">
            {user?.username?.charAt(0) || '?'}
          </div>
          {!isSidebarMinimized && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Standard User</p>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <button onClick={handleSignOut} className={`w-full flex items-center transition-all ${isSidebarMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all`}>
            <LogOut size={20} />
            {!isSidebarMinimized && <span className="font-semibold">Sign Out</span>}
          </button>
          {!isSidebarMinimized && (
            <div className="py-2 flex flex-col items-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center font-medium">
                Created by Ahmad yousuf 2025
              </p>
              <a 
                href="https://www.instagram.com/ahmad_v07/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-500 hover:underline font-bold"
              >
                <Instagram size={12} />
                Contact
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  const DashboardContent = () => (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
          <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Recorded Wealth Summary</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {Object.entries(currencyTotals).map(([cur, val]) => (
              <div key={cur} className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{cur}</span>
                <span className="text-xl font-bold dark:text-white">{val.toLocaleString()}</span>
              </div>
            ))}
            {Object.entries(metalTotals).map(([type, weight]) => (
              <div key={type} className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{type}</span>
                <span className="text-xl font-bold dark:text-white">{weight.toLocaleString()}g</span>
              </div>
            ))}
            {Object.keys(currencyTotals).length === 0 && Object.keys(metalTotals).length === 0 && (
              <span className="text-slate-400 italic">No assets recorded</span>
            )}
          </div>
        </motion.div>
        
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-600/20 text-white flex flex-col justify-between">
          <h2 className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Zakat Obligation</h2>
          <div className="mt-4 flex items-center justify-between">
            {calculatedZakat !== null ? (
              <p className="text-2xl font-bold truncate">
                {calculatedZakat.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {calculatedZakat.currency}
              </p>
            ) : (
              <p className="text-xl font-medium italic opacity-70">Awaiting Calculation</p>
            )}
            <button 
              onClick={startCalculation}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors border border-white/10 flex items-center gap-2 group shrink-0"
            >
              <Calculator size={20} />
              <span className="font-bold">Calculate</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Your Assets</h2>
          <button onClick={() => setShowAssetForm(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10">
            <Plus size={20} />
            <span>Add New Asset</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
          {loading ? (
            <div className="p-24 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-600 mb-4" />
              <p className="text-slate-400 dark:text-slate-500 font-medium">Gathering your wealth data...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-24 text-center text-slate-400 dark:text-slate-500">
              <Wallet className="mx-auto mb-4 opacity-20" size={48} />
              <p className="font-medium">No assets recorded yet. Start by adding one above.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assets.map((asset) => (
                <motion.div key={asset.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${
                      asset.type === AssetType.GOLD ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                      asset.type === AssetType.SILVER ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' :
                      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <MoonStar size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{asset.name}</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                        {asset.type} • {asset.weight ? `${asset.weight}g` : `${asset.currency || ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-8">
                    <div>
                      {asset.type === AssetType.GOLD || asset.type === AssetType.SILVER ? (
                        <p className="font-bold text-slate-400 dark:text-slate-500 italic text-sm">Market Rate</p>
                      ) : (
                        <p className="font-bold text-slate-900 dark:text-white text-lg">{asset.value.toLocaleString()} <span className="text-xs text-slate-400">{asset.currency}</span></p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{new Date(asset.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={async () => { await tursoService.deleteAsset(asset.id); fetchData(); }} className="lg:opacity-0 lg:group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <CloseIcon size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const BlogList = () => (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Knowledge Base</h1>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Expert insights into Islamic finance, wealth purification, and the technical side of Zakat calculation in 2025.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {BLOG_POSTS.map(post => (
          <article key={post.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="p-8 h-full flex flex-col">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 inline-block">{post.category}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-emerald-600 transition-colors leading-tight">{post.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">{post.excerpt}</p>
              <button 
                onClick={() => { setSelectedPostId(post.id); setView('post'); window.scrollTo(0, 0); }}
                className="flex items-center gap-2 text-slate-900 dark:text-white font-bold group/btn"
              >
                Read Article <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const BlogPostView = () => {
    const post = BLOG_POSTS.find(p => p.id === selectedPostId);
    if (!post) return null;

    return (
      <article className="max-w-3xl mx-auto">
        <button 
          onClick={() => setView('blog')}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} /> Back to Knowledge Base
        </button>
        
        <header className="mb-12">
          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-widest mb-4 inline-block">{post.category}</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <div className="flex items-center gap-2"><UserIcon size={16} /> {post.author}</div>
            <div className="flex items-center gap-2"><Clock size={16} /> {post.readTime}</div>
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none mb-16 text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Ready to purify your wealth?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Use our real-time calculator to track your gold, silver, and business assets accurately.</p>
          <button 
            onClick={() => setView('dashboard')}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
          >
            Go to Zakat Calculator <TrendingUp size={18} />
          </button>
        </div>
      </article>
    );
  };

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex overflow-x-hidden">
      <AnimatePresence>
        {isWelcoming && user && <WelcomeScreen username={user.username} onComplete={() => setIsWelcoming(false)} />}
      </AnimatePresence>

      <aside className={`hidden lg:block transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen ${isSidebarMinimized ? 'w-20' : 'w-72'}`}>
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 lg:hidden shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <MoonStar className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">Zakat Track</span>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 dark:text-slate-400">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-xl flex items-center justify-between gap-3 text-red-700 dark:text-red-400 mb-8">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button onClick={fetchData} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                <RefreshCw size={18} />
              </button>
            </div>
          )}

          {view === 'dashboard' && <DashboardContent />}
          
          {view === 'history' && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Payment History</h1>
                <button onClick={() => setShowPaymentForm(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10">
                  <Plus size={20} />
                  <span>Record Payment</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                 {loading ? (
                  <div className="p-24 text-center text-slate-400 dark:text-slate-500 font-medium">Loading history...</div>
                ) : payments.length === 0 ? (
                  <div className="p-24 text-center text-slate-400 dark:text-slate-500">
                    <History className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="font-medium">No payment records found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <History size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{payment.name}</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{payment.method} • {new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">+ ${payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Confirmed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {view === 'blog' && <BlogList />}
          {view === 'post' && <BlogPostView />}
        </main>
      </div>

      <AnimatePresence>
        {showCalculationPrompt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors relative">
              <button aria-label="Close calculation modal" onClick={() => setShowCalculationPrompt(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <CloseIcon size={20} />
              </button>
              <div className="mb-8">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Calculator className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Run Zakat Calculator 2025</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {calcStep === 1 ? 'Step 1: Base Currency' : 'Step 2: Market Rates & Karat Value'}
                </p>
              </div>
              <div className="space-y-6">
                {calcStep === 1 ? (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Display Total In:</label>
                    <select 
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={proceedToRates} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">Next Step <ArrowRight size={18} /></button>
                  </div>
                ) : (
                  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {hasGold && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Current Gold Rate (per gram)</label>
                        <input type="number" step="any" value={goldRate} onChange={(e) => setGoldRate(e.target.value)} placeholder="e.g. 65.20" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-2xl dark:text-white" />
                      </div>
                    )}
                    {hasSilver && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Current Silver Rate (per gram)</label>
                        <input type="number" step="any" value={silverRate} onChange={(e) => setSilverRate(e.target.value)} placeholder="e.g. 0.85" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-2xl dark:text-white" />
                      </div>
                    )}
                    <button onClick={performFinalCalculation} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg">Finalize Purification Calculation</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAssetForm && (
          <AssetForm user={user} onClose={() => setShowAssetForm(false)} onSuccess={() => { setShowAssetForm(false); fetchData(); }} onAdd={tursoService.addAsset} />
        )}
        {showPaymentForm && (
          <PaymentForm user={user} onClose={() => setShowPaymentForm(false)} onSuccess={() => { setShowPaymentForm(false); fetchData(); }} onAdd={tursoService.addPayment} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
