
import { BlogPost } from './types';

export const COLORS = {
  primary: 'emerald',
  secondary: 'slate',
};

export const ZAKAT_RATE = 0.025; // 2.5%

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'PKR', 'INR', 'BDT'];

export const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Credit Card', 'Online Wallet'];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'zakat-101',
    title: 'Zakat 101: A Beginner’s Guide to Wealth Purification',
    category: 'Fundamentals',
    excerpt: 'Understand the core principles of Zakat, the 2.5% rule, and why wealth purification is a pillar of Islamic finance.',
    author: 'Ahmad Yousuf',
    date: 'May 15, 2025',
    readTime: '5 min read',
    content: `
      <h2>The Essence of Islamic Wealth Purification</h2>
      <p>Zakat is more than just a charitable donation; it is a mandatory religious obligation for Muslims that acts as a spiritual and financial purification of one's assets. In 2025, as global economic conditions shift, understanding your <strong>Zakat Calculator 2025</strong> responsibilities is more important than ever.</p>
      
      <h2>The 2.5% Rule Explained</h2>
      <p>Most Zakatable assets are subject to a rate of 2.5%. This includes cash, gold, silver, and business merchandise. The calculation is performed on wealth that has been in your possession for one lunar year and exceeds the <strong>Nisab threshold</strong>.</p>
      
      <h2>Why Purification Matters</h2>
      <p>By giving a small portion of surplus wealth, believers fulfill a divine command that supports the socio-economic welfare of the community. It ensures that wealth circulates and reaches those who need it most, preventing hoarding and stagnation.</p>
    `
  },
  {
    id: 'gold-silver-2025',
    title: 'How to Calculate Zakat on Gold and Silver in 2025',
    category: 'Guide',
    excerpt: 'A technical deep dive into calculating Nisab for precious metals using current market rates and karat values.',
    author: 'Ahmad Yousuf',
    date: 'May 18, 2025',
    readTime: '7 min read',
    content: `
      <h2>Determining the Nisab Threshold</h2>
      <p>To calculate Zakat on gold and silver, you first need to know if your holdings meet the <strong>Nisab threshold</strong>. For gold, the threshold is approximately 87.48 grams, and for silver, it is 612.36 grams. Always check current market rates to ensure accuracy in your <strong>Zakat Calculator 2025</strong> inputs.</p>
      
      <h2>Karat Values and Weight</h2>
      <p>Pure gold (24K) is 100% Zakatable. If you own 21K or 18K jewelry, you must calculate the actual gold content. For example, 100g of 18K jewelry contains 75g of pure gold. This precise tracking prevents overpaying or underpaying your obligation.</p>
      
      <h2>Investment vs. Personal Use</h2>
      <p>While scholars differ on jewelry for personal use, many recommend paying Zakat on all precious metal assets to be safe. Investment bars and coins are always Zakatable once they meet the Nisab weight requirements.</p>
    `
  },
  {
    id: 'business-assets',
    title: 'Is Your Business Asset Zakatable? What You Need to Know',
    category: 'Business',
    excerpt: 'Inventory, fixed assets, and liquid capital—learn which parts of your business are subject to Islamic tax.',
    author: 'Ahmad Yousuf',
    date: 'May 20, 2025',
    readTime: '6 min read',
    content: `
      <h2>Inventory vs. Fixed Assets</h2>
      <p>One of the most common questions in <strong>Zakat on business assets</strong> is distinguishing between what is Zakatable and what is not. Fixed assets—like your office building, machinery, and furniture used for operations—are generally exempt from Zakat.</p>
      
      <h2>Calculating on Merchandise</h2>
      <p>Inventory or stock intended for resale is Zakatable. At the end of your Zakat year, you must value your stock at its current market price (selling price) and add it to your cash reserves before applying the 2.5% rate.</p>
      
      <h2>Liquid Capital and Debts</h2>
      <p>Cash on hand and business bank balances must be included. However, you can subtract immediate short-term business liabilities and debts before finalizing your calculation. This ensures your <strong>Islamic wealth purification</strong> is based on your true net surplus.</p>
    `
  }
];
