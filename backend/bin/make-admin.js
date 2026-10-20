import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config({ path: new URL('../.env', import.meta.url) });
dotenv.config({ path: new URL('../.env.local', import.meta.url), override: true });
const email = String(process.argv[2] || '').trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error('Usage: npm run admin:make -- email@example.com'); process.exit(2); }
const dsn = Object.fromEntries((process.env.DB_DSN || '').replace(/^mysql:/, '').split(';').map(s => s.split('=').map(x => x.trim())).filter(x => x.length === 2));
const db = await mysql.createConnection({ host: dsn.host || '127.0.0.1', port: Number(dsn.port || 3306), database: dsn.dbname || 'unique_write', user: process.env.DB_USER || 'unique_write', password: process.env.DB_PASS || '', charset: 'utf8mb4' });
const [result] = await db.execute("UPDATE users SET role='admin' WHERE email=? AND deleted_at IS NULL", [email]);
await db.end();
if (!result.affectedRows) { console.error('No matching user was updated.'); process.exit(1); }
console.log('Admin role granted.');
