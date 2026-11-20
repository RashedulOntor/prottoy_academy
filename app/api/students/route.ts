import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchArchived = searchParams.get('archived');

    let query = 'SELECT * FROM students WHERE is_archived = FALSE OR is_archived IS NULL ORDER BY student_id ASC';

    if (fetchArchived === 'true') {
      query = 'SELECT * FROM students WHERE is_archived = TRUE ORDER BY student_id ASC';
    }

    const [students] = await pool.query(query);

    return NextResponse.json({ success: true, data: students }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    console.error('GET STUDENTS ERROR:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let createdStudentId: number | null = null;
  try {
    const body = await request.json();
    const { studentId, fullName, fathersName, mothersName, className, studentGroup, phone, address, profile_image } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'Student ID (Roll Number) is required!' }, { status: 400 });
    }

    const numericId = Number(studentId);
    const generatedUsername = String(studentId);
    const defaultPassword = "password123";

    // users টেবিলে কাস্টম 9-ডিজিট ID এবং username হিসেবে সেভ করা
    await pool.query(
      'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
      [numericId, generatedUsername, defaultPassword, 'student']
    );

    createdStudentId = numericId;

    // students টেবিলে একই 9-ডিজিট student_id দিয়ে সেভ করা
    await pool.query(
      'INSERT INTO students (student_id, full_name, fathers_name, mothers_name, class_name, student_group, phone_number, address, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [numericId, fullName, fathersName, mothersName, className, studentGroup || null, phone, address, profile_image || null]
    );

    return NextResponse.json({
      success: true,
      message: `Student registered! Login ID: ${generatedUsername} | Default Password: password123`
    }, { status: 201 });

  } catch (error: any) {
    if (createdStudentId) {
      try { await pool.query('DELETE FROM users WHERE id = ?', [createdStudentId]); } catch (e) {}
    }

    console.error('POST STUDENT ERROR:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, message: 'এই ক্লাস ও রোলের (Student ID) স্টুডেন্ট ইতিমধ্যেই আছে!' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: `Failed to register: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required' }, { status: 400 });
    }

    await pool.query('UPDATE students SET is_archived = TRUE WHERE student_id = ?', [id]);

    try {
      await pool.query('UPDATE users SET is_archived = TRUE WHERE id = ?', [id]);
    } catch (e) {
      try { await pool.query('UPDATE users SET is_archived = TRUE WHERE user_id = ?', [id]); } catch (err) {}
    }

    return NextResponse.json({ success: true, message: 'Student moved to archive successfully!' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to remove student' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.type === 'recover') {
      const { id } = body;
      if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

      await pool.query('UPDATE students SET is_archived = FALSE WHERE student_id = ?', [id]);
      try {
        await pool.query('UPDATE users SET is_archived = FALSE WHERE id = ?', [id]);
      } catch (err) {
        try { await pool.query('UPDATE users SET is_archived = FALSE WHERE user_id = ?', [id]); } catch (e) {}
      }

      return NextResponse.json({ success: true, message: 'Student recovered successfully!' }, { status: 200 });
    }

    if (body.type === 'update_password') {
      const { id, newPassword } = body;
      if (!id || !newPassword) return NextResponse.json({ success: false, message: 'Missing data for password update' }, { status: 400 });

      try {
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
      } catch (err) {
        await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [newPassword, id]);
      }
      return NextResponse.json({ success: true, message: 'Password updated successfully!' }, { status: 200 });
    }

    if (body.type === 'update_image') {
      const { id, profile_image } = body;
      if (!id || !profile_image) return NextResponse.json({ success: false, message: 'Missing data for image update' }, { status: 400 });

      await pool.query('UPDATE students SET profile_image = ? WHERE student_id = ?', [profile_image, id]);
      return NextResponse.json({ success: true, message: 'Profile image updated successfully!' }, { status: 200 });
    }

    // প্রোফাইল আপডেট (ফোন নম্বর আপডেট হলেও লগইন ID অপরিবর্তিত থাকবে)
    const { id, fullName, fathersName, mothersName, className, studentGroup, address, phone, profile_image } = body;

    if (!id) return NextResponse.json({ success: false, message: 'Student ID is required for update' }, { status: 400 });

    if (profile_image) {
      await pool.query(
        'UPDATE students SET full_name = ?, fathers_name = ?, mothers_name = ?, class_name = ?, phone_number = ?, address = ?, profile_image = ? WHERE student_id = ?',
        [fullName, fathersName, mothersName, className, phone, address, profile_image, id]
      );
    } else if (studentGroup !== undefined) {
      await pool.query(
        'UPDATE students SET full_name = ?, fathers_name = ?, mothers_name = ?, class_name = ?, student_group = ?, phone_number = ?, address = ? WHERE student_id = ?',
        [fullName, fathersName, mothersName, className, studentGroup, phone, address, id]
      );
    } else {
      await pool.query(
        'UPDATE students SET full_name = ?, fathers_name = ?, mothers_name = ?, class_name = ?, phone_number = ?, address = ? WHERE student_id = ?',
        [fullName, fathersName, mothersName, className, phone, address, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  }
}