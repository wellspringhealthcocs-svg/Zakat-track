
import { createClient } from '@libsql/client';

// Configure these in your Vercel/Netlify Environment Variables
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export default async function handler(req, res) {
  // Enable CORS for your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, data } = req.body;

  try {
    switch (action) {
      case 'signup': {
        const { id, username, email, password } = data;
        const existing = await client.execute({
          sql: "SELECT id FROM users WHERE email = ? OR username = ?",
          args: [email, username]
        });
        if (existing.rows.length > 0) throw new Error("User exists");
        
        await client.execute({
          sql: "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)",
          args: [id, username, email, password]
        });
        return res.status(200).json({ success: true });
      }

      case 'login': {
        const { username, password } = data;
        const rs = await client.execute({
          sql: "SELECT id, username FROM users WHERE username = ? AND password = ?",
          args: [username, password]
        });
        if (rs.rows.length === 0) throw new Error("Invalid credentials");
        return res.status(200).json(rs.rows[0]);
      }

      case 'fetchAssets': {
        const rs = await client.execute({
          sql: "SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC",
          args: [data.userId]
        });
        return res.status(200).json(rs.rows);
      }

      case 'addAsset': {
        const { user_id, name, type, weight, currency, value } = data;
        await client.execute({
          sql: "INSERT INTO assets (user_id, name, type, weight, currency, value) VALUES (?, ?, ?, ?, ?, ?)",
          args: [user_id, name, type, weight || null, currency || null, value]
        });
        return res.status(200).json({ success: true });
      }

      case 'deleteAsset': {
        await client.execute({
          sql: "DELETE FROM assets WHERE id = ?",
          args: [data.id]
        });
        return res.status(200).json({ success: true });
      }

      case 'fetchPayments': {
        const rs = await client.execute({
          sql: "SELECT * FROM payments WHERE user_id = ? ORDER BY date DESC",
          args: [data.userId]
        });
        return res.status(200).json(rs.rows);
      }

      case 'addPayment': {
        const { user_id, name, amount, date, method } = data;
        await client.execute({
          sql: "INSERT INTO payments (user_id, name, amount, date, method) VALUES (?, ?, ?, ?, ?)",
          args: [user_id, name, amount, date, method]
        });
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
