import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

/**
 * Configure Neon serverless to use WebSocket constructor for database connections
 */
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * PostgreSQL connection pool for Holly Transportation database
 * 
 * @description Creates a connection pool to the Neon PostgreSQL database
 * using the DATABASE_URL environment variable for authentication.
 */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Drizzle ORM database instance with schema definitions
 * 
 * @description Main database interface for Holly Transportation with all table schemas
 * and type definitions. Provides type-safe database operations for users, bookings,
 * messages, and contact forms.
 */
export const db = drizzle({ client: pool, schema });