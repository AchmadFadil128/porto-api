import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

// For production, use environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure the pool with additional options for better connection handling
// Including authentication options
const pool = new Pool({
  connectionString,
  ssl: false, // Set to true if connecting to a remote database with SSL
  // Additional pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
  // Authentication options
  application_name: 'Portfolio API', // Helps identify connections from this app
});

export const db = drizzle(pool, { schema });