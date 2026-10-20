import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config({ path: new URL('../.env', import.meta.url) });
const dsn = Object.fromEntries((process.env.DB_DSN || '').replace(/^mysql:/, '').split(';').map(s => s.split('=').map(x => x.trim())).filter(x => x.length === 2));
const db = await mysql.createConnection({ host: dsn.host || '127.0.0.1', port: Number(dsn.port || 3306), database: dsn.dbname || 'unique_write', user: process.env.DB_USER || 'unique_write', password: process.env.DB_PASS || '', charset: 'utf8mb4' });
try {
  await db.beginTransaction();
  const [stale] = await db.query("SELECT id,grant_breakdown FROM humanize_requests WHERE status='pending' AND created_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 5 MINUTE) FOR UPDATE");
  for (const row of stale) { const breakdown = JSON.parse(row.grant_breakdown || '{}'); for (const [grantId,count] of Object.entries(breakdown)) await db.execute('UPDATE word_grants SET words_used=GREATEST(0,words_used-?) WHERE id=?',[count,grantId]); await db.execute("UPDATE humanize_requests SET status='failed',input_text=NULL,output_text=NULL,error_code='STALE_REQUEST' WHERE id=?",[row.id]); }
  await db.query('UPDATE humanize_requests SET input_text=NULL,output_text=NULL,deleted_at=COALESCE(deleted_at,UTC_TIMESTAMP()) WHERE expires_at<UTC_TIMESTAMP() AND (input_text IS NOT NULL OR output_text IS NOT NULL)');
  await db.query('DELETE FROM sessions WHERE expires_at<UTC_TIMESTAMP()'); await db.query('DELETE FROM email_tokens WHERE created_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 DAY)'); await db.query('DELETE FROM rate_limits WHERE expires_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 DAY)');
  await db.commit();
} catch (e) { await db.rollback(); console.error('cleanup_failed', e.code || e.name); process.exitCode=1; } finally { await db.end(); }
