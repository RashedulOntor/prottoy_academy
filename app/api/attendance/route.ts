import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');

    if (studentId) {
      const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE student_id = ? ORDER BY attendance_date DESC',
        [studentId]
      );
      return NextResponse.json({ success: true, data: rows }, { status: 200 });
    }

    if (className && date) {
      const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE class_name = ? AND attendance_date = ?',
        [className, date]
      );
      return NextResponse.json({ success: true, data: rows }, { status: 200 });
    }

    const [rows] = await pool.query('SELECT * FROM attendance ORDER BY attendance_date DESC LIMIT 200');
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { records, className, date, markedBy } = await request.json();

    if (!Array.isArray(records) || !className || !date) {
      return NextResponse.json({ success: false, message: 'Invalid attendance data!' }, { status: 400 });
    }

    for (const rec of records) {
      await pool.query(
        `INSERT INTO attendance (student_id, class_name, attendance_date, status, marked_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)`,
        [rec.student_id, className, date, rec.status, markedBy || 'Faculty']
      );
    }

    return NextResponse.json({ success: true, message: 'Attendance saved successfully!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}