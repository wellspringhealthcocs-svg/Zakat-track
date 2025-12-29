
import { createClient } from '@libsql/client/web';
import { Asset, Payment, AssetType } from '../types';

// Turso Credentials
const TURSO_DATABASE_URL = "libsql://zakatdb-wellspringhealthcocs-svg.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjcwMTk4ODYsImlkIjoiMDdmZjMxNDUtODNkZS00NmQ4LWFmOTItMjNlMDMzMGNkNDE5IiwicmlkIjoiNzBjZDkzYzQtZTJkZS00ZjkwLTk5ZTMtYjJkMDc5OWY2YzYxIn0.kcOzgHh_7IVpamgILZBuKwkSs5g3ty31fwP1Qjq_ZQHu2aOTB8vMJASnH2C0GqMTduTPGiFfscBvfQ0f-7KfBQ";

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export const tursoService = {
  async initializeDatabase(): Promise<void> {
    try {
      await client.batch([
        `CREATE TABLE IF NOT EXISTS assets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT 'Asset',
          type TEXT NOT NULL,
          weight REAL,
          currency TEXT,
          value REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT 'Payment',
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          method TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ], "write");
      
      // Migration: Check if 'name' columns exist
      try {
        await client.execute("ALTER TABLE assets ADD COLUMN name TEXT NOT NULL DEFAULT 'Asset'");
      } catch (e) {}
      try {
        await client.execute("ALTER TABLE payments ADD COLUMN name TEXT NOT NULL DEFAULT 'Payment'");
      } catch (e) {}
      
      console.log("Database tables verified/created successfully.");
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  },

  async fetchAssets(userId: string): Promise<Asset[]> {
    try {
      const rs = await client.execute({
        sql: "SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC",
        args: [userId]
      });
      return rs.rows.map(row => ({
        id: row.id as number,
        user_id: row.user_id as string,
        name: row.name as string || 'Asset',
        type: row.type as AssetType,
        weight: row.weight as number | undefined,
        currency: row.currency as string | undefined,
        value: row.value as number,
        created_at: row.created_at as string
      }));
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  },

  async addAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<void> {
    try {
      await client.execute({
        sql: "INSERT INTO assets (user_id, name, type, weight, currency, value) VALUES (?, ?, ?, ?, ?, ?)",
        args: [asset.user_id, asset.name, asset.type, asset.weight || null, asset.currency || null, asset.value]
      });
    } catch (error) {
      console.error("Failed to add asset:", error);
      throw error;
    }
  },

  async deleteAsset(id: number): Promise<void> {
    await client.execute({ sql: "DELETE FROM assets WHERE id = ?", args: [id] });
  },

  async fetchPayments(userId: string): Promise<Payment[]> {
    try {
      const rs = await client.execute({
        sql: "SELECT * FROM payments WHERE user_id = ? ORDER BY date DESC",
        args: [userId]
      });
      return rs.rows.map(row => ({
        id: row.id as number,
        user_id: row.user_id as string,
        name: row.name as string || 'Payment',
        amount: row.amount as number,
        date: row.date as string,
        method: row.method as string,
        created_at: row.created_at as string
      }));
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      throw error;
    }
  },

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<void> {
    try {
      await client.execute({
        sql: "INSERT INTO payments (user_id, name, amount, date, method) VALUES (?, ?, ?, ?, ?)",
        args: [payment.user_id, payment.name, payment.amount, payment.date, payment.method]
      });
    } catch (error) {
      console.error("Failed to add payment:", error);
      throw error;
    }
  }
};
