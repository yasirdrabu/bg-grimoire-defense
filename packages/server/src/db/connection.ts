import Database from 'better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DATABASE_URL = process.env['DATABASE_URL'] ?? './data/grimoire.db';

// Ensure parent directory exists before opening the database
mkdirSync(dirname(DATABASE_URL), { recursive: true });

export const sqlite: BetterSqlite3.Database = new Database(DATABASE_URL);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
