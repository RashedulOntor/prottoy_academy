import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId');

    let query = 'SELECT * FROM faculty_assignments ORDER BY class_name ASC, subject_name ASC';
    let params: any[] = [];

    if (facultyId) {
      query = 'SELECT * FROM faculty_assignments WHERE faculty_id = ? ORDER BY class_name ASC, subject_name ASC';
      params = [facultyId];
    }

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { facultyId, className, subjectName } = await request.json();

    if (!facultyId || !className || !subjectName) {
      return NextResponse.json({ success: false, message: 'Faculty, Class, and Subject are required!' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO faculty_assignments (faculty_id, class_name, subject_name) VALUES (?, ?, ?)',
      [facultyId, className, subjectName]
    );

    return NextResponse.json({ success: true, message: 'Access assigned successfully!' }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, message: 'এই ফ্যাকাল্টিকে ইতিমধ্যেই এই ক্লাস ও সাবজেক্টের অ্যাক্সেস দেওয়া আছে!' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'Assignment ID required' }, { status: 400 });

    await pool.query('DELETE FROM faculty_assignments WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Access removed!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}