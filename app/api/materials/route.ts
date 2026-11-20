import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');
    const facultyId = searchParams.get('facultyId');

    let query = 'SELECT * FROM materials ORDER BY created_at DESC';
    let params: any[] = [];

    if (className) {
      query = 'SELECT * FROM materials WHERE class_name = ? ORDER BY created_at DESC';
      params = [className];
    } else if (facultyId) {
      query = 'SELECT * FROM materials WHERE faculty_id = ? ORDER BY created_at DESC';
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
    const { facultyId, facultyName, className, subjectName, title, materialType, linkUrl, description } = await request.json();

    if (!facultyId || !className || !subjectName || !title) {
      return NextResponse.json({ success: false, message: 'Class, Subject, and Title are required!' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO materials (faculty_id, faculty_name, class_name, subject_name, title, material_type, link_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [facultyId, facultyName || 'Faculty', className, subjectName, title, materialType || 'Note', linkUrl || '', description || '']
    );

    return NextResponse.json({ success: true, message: 'Material published successfully!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'Material ID required' }, { status: 400 });

    await pool.query('DELETE FROM materials WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Material deleted!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}