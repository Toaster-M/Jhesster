import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
  PORT: parseInt(optional('PORT', '3001'), 10),
  NODE_ENV: optional('NODE_ENV', 'development'),
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:5173'),
} as const;
