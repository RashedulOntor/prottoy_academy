import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let query = "";
    let params: any[] = [];

    if (studentId) {
      query = 'SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC';
      params = [studentId];
    } else {
      query = `
        SELECT p.*, s.full_name, s.class_name 
        FROM payments p 
        JOIN students s ON p.student_id = s.student_id 
        ORDER BY p.payment_date DESC`;
    }

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error fetching payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, amount, payment_purpose, payment_status, received_by } = body;

    await pool.query(
      'INSERT INTO payments (student_id, amount, payment_purpose, payment_status, received_by) VALUES (?, ?, ?, ?, ?)',
      [student_id, amount, payment_purpose, payment_status, received_by || 'Admin']
    );

    return NextResponse.json({ success: true, message: 'Payment recorded successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update payment' }, { status: 500 });
  }
}