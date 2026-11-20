import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');

    let query = 'SELECT * FROM notices ORDER BY created_at DESC';
    let params: any[] = [];

    if (className && className !== 'All') {
      query = 'SELECT * FROM notices WHERE target_class = ? OR target_class = "All" ORDER BY created_at DESC';
      params = [className];
    }

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, targetClass, postedBy } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Title and content are required!' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO notices (title, content, target_class, posted_by) VALUES (?, ?, ?, ?)',
      [title, content, targetClass || 'All', postedBy || 'Admin']
    );

    return NextResponse.json({ success: true, message: 'Notice published successfully!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'Notice ID required' }, { status: 400 });

    await pool.query('DELETE FROM notices WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Notice deleted!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}