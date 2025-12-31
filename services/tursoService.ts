
import { db } from '../assets/js/db';
import { Asset, Payment, AssetType, User } from '../types';

export const tursoService = {
  async initializeDatabase(): Promise<void> {
    console.log("Connected directly to Turso via Web SDK.");
  },

  async startSignup(username: string, email: string, password: string): Promise<User> {
    const id = crypto.randomUUID();
    try {
      await db.execute({
        sql: "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)",
        args: [id, username, email, password]
      });
      return { id, username };
    } catch (error: any) {
      if (error.message?.includes('UNIQUE')) {
        throw new Error("Username or email already exists.");
      }
      throw error;
    }
  },

  async login(username: string, password: string): Promise<User> {
    const rs = await db.execute({
      sql: "SELECT id, username FROM users WHERE username = ? AND password = ?",
      args: [username, password]
    });
    
    if (rs.rows.length === 0) {
      throw new Error("Invalid username or password.");
    }
    
    const row = rs.rows[0];
    return { id: row.id as string, username: row.username as string };
  },

  async fetchAssets(userId: string): Promise<Asset[]> {
    const rs = await db.execute({
      sql: "SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC",
      args: [userId]
    });
    
    return rs.rows.map(row => ({
      id: row.id as number,
      user_id: row.user_id as string,
      name: row.name as string,
      type: row.type as AssetType,
      weight: row.weight as number | undefined,
      currency: row.currency as string | undefined,
      value: row.value as number,
      created_at: row.created_at as string
    }));
  },

  async addAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<void> {
    await db.execute({
      sql: "INSERT INTO assets (user_id, name, type, weight, currency, value) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        asset.user_id, 
        asset.name, 
        asset.type, 
        asset.weight ?? null, 
        asset.currency ?? null, 
        asset.value
      ]
    });
  },

  async deleteAsset(id: number): Promise<void> {
    await db.execute({
      sql: "DELETE FROM assets WHERE id = ?",
      args: [id]
    });
  },

  async fetchPayments(userId: string): Promise<Payment[]> {
    const rs = await db.execute({
      sql: "SELECT * FROM payments WHERE user_id = ? ORDER BY date DESC",
      args: [userId]
    });
    
    return rs.rows.map(row => ({
      id: row.id as number,
      user_id: row.user_id as string,
      name: row.name as string,
      amount: row.amount as number,
      date: row.date as string,
      method: row.method as string,
      created_at: row.created_at as string
    }));
  },

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<void> {
    await db.execute({
      sql: "INSERT INTO payments (user_id, name, amount, date, method) VALUES (?, ?, ?, ?, ?)",
      args: [
        payment.user_id, 
        payment.name, 
        payment.amount, 
        payment.date, 
        payment.method
      ]
    });
  }
};
