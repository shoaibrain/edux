// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { sharedDb } from '@/lib/db';
import { Pool } from 'pg';

export async function GET() {
  try {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    const result = await pool.query('SELECT 1 AS test');
    await pool.end();
    console.log('[DB] Connection test successful:', result.rows);
    return NextResponse.json({ success: true, result: result.rows });
  } catch (error) {
    console.error('[DB] Connection test failed:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}