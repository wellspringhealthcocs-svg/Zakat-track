
import { createClient } from "@libsql/client/web";

// Turso Database Credentials
const TURSO_URL = "libsql://zakatdb-wellspringhealthcocs-svg.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjcwMTk4ODYsImlkIjoiMDdmZjMxNDUtODNkZS00NmQ4LWFmOTItMjNlMDMzMGNkNDE5IiwicmlkIjoiNzBjZDkzYzQtZTJkZS00ZjkwLTk5ZTMtYjJkMDc5OWY2YzYxIn0.kcOzgHh_7IVpamgILZBuKwkSs5g3ty31fwP1Qjq_ZQHu2aOTB8vMJASnH2C0GqMTduTPGiFfscBvfQ0f-7KfBQ";

/**
 * Initializes and exports the Turso client for use across the application.
 * This client connects directly to the libSQL backend via WebSockets/HTTP.
 */
export const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});
