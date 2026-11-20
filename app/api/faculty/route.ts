import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [faculties] = await pool.query(`
      SELECT f.*, u.username 
      FROM faculty f 
      LEFT JOIN users u ON f.user_id = u.id
    `);

    const formattedFaculties = (faculties as any[]).map(f => ({
      ...f,
      id: f.id || f.faculty_id || f.teacher_id
    }));

    return NextResponse.json({ success: true, data: formattedFaculties }, { status: 200 });
  } catch (error) {
    console.error("GET FACULTY ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch faculty' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let createdUserId: number | null = null;
  try {
    const body = await request.json();
    const { name, designation, education, subjects, experience, image, username, password } = body;

    if (!name || !designation || !username) {
      return NextResponse.json({ success: false, message: 'Name, Designation, and Login Username are required!' }, { status: 400 });
    }

    const finalPassword = password || 'faculty123';

    // ১. users টেবিলে ফ্যাকাল্টি অ্যাকাউন্ট তৈরি
    const [userRes]: any = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username.trim(), finalPassword, 'faculty']
    );
    createdUserId = userRes.insertId;

    // ২. faculty টেবিলে তথ্য ও user_id সেভ করা
    await pool.query(
      'INSERT INTO faculty (user_id, name, designation, education, subjects, experience, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [createdUserId, name, designation, education || "", subjects || "", experience || "", image || null]
    );

    return NextResponse.json({
      success: true,
      message: `Teacher added! Login ID: ${username} | Password: ${finalPassword}`
    }, { status: 201 });
  } catch (error: any) {
    if (createdUserId) {
      try { await pool.query('DELETE FROM users WHERE id = ?', [createdUserId]); } catch (e) {}
    }
    console.error("POST FACULTY ERROR:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, message: 'এই ইউজারনেমটি ইতিমধ্যেই ব্যবহৃত হয়েছে! অন্য ইউজারনেম দিন।' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to add teacher.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const primaryKey = body.faculty_id ? 'faculty_id' : 'id';
    const targetId = body.faculty_id || body.id;

    // ফ্যাকাল্টির পাসওয়ার্ড পরিবর্তন
    if (body.type === 'update_password') {
      const { userId, newPassword } = body;
      if (!userId || !newPassword) {
        return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 });
      }
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
      return NextResponse.json({ success: true, message: 'Password updated successfully!' }, { status: 200 });
    }

    if (body.type === 'update_image') {
      const { image } = body;
      await pool.query(`UPDATE faculty SET image = ? WHERE ${primaryKey} = ?`, [image, targetId]);
      return NextResponse.json({ success: true, message: 'Image updated successfully!' }, { status: 200 });
    }

    if (body.type === 'update_details') {
      const { name, designation, education, subjects, experience } = body;
      await pool.query(
        `UPDATE faculty SET name = ?, designation = ?, education = ?, subjects = ?, experience = ? WHERE ${primaryKey} = ?`,
        [name, designation, education, subjects, experience, targetId]
      );
      return NextResponse.json({ success: true, message: 'Details updated successfully!' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Invalid update type' }, { status: 400 });
  } catch (error) {
    console.error("PUT FACULTY ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // আগে user_id বের করে users টেবিল থেকেও ডিলিট করা
    const [rows]: any = await pool.query('SELECT user_id FROM faculty WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].user_id) {
      await pool.query('DELETE FROM users WHERE id = ?', [rows[0].user_id]);
    }

    await pool.query('DELETE FROM faculty_assignments WHERE faculty_id = ?', [id]);
    await pool.query('DELETE FROM faculty WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error("DELETE FACULTY ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
  }
}