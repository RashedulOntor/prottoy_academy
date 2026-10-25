import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);
    const fetchArchived = searchParams.get('archived'); 

    db = await connectToDatabase();
    
    try { await db.query("ALTER TABLE students ADD COLUMN student_group VARCHAR(100) DEFAULT NULL"); } catch (e) {}
    
    let query = 'SELECT * FROM students WHERE is_archived = FALSE OR is_archived IS NULL ORDER BY student_id ASC';
    
    if (fetchArchived === 'true') {
      query = 'SELECT * FROM students WHERE is_archived = TRUE ORDER BY student_id ASC';
    }

    const [students] = await db.query(query);
    
    return NextResponse.json({ success: true, data: students }, { 
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch students' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function POST(request: Request) {
  let db;
  try {
    const body = await request.json();
    const { fullName, fathersName, mothersName, className, studentGroup, phone, address, profile_image } = body;

    const generatedUsername = phone;
    const defaultPassword = "password123";

    if (!generatedUsername) {
      return NextResponse.json({ success: false, message: 'Phone number is required for login ID!' }, { status: 400 });
    }

    db = await connectToDatabase();

    try { await db.query("ALTER TABLE students ADD COLUMN student_group VARCHAR(100) DEFAULT NULL"); } catch (err) {}

    const [userResult]: any = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [generatedUsername, defaultPassword, 'student']
    );

    const newUserId = userResult.insertId;

    await db.query(
      'INSERT INTO students (student_id, full_name, fathers_name, mothers_name, class_name, student_group, phone_number, address, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newUserId, fullName, fathersName, mothersName, className, studentGroup || null, phone, address, profile_image || null]
    );

    return NextResponse.json({ success: true, message: 'Student registered! Login ID is their phone number.' }, { status: 201 });
    
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, message: 'A student with this phone number already exists!' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to register student.' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function DELETE(request: Request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required' }, { status: 400 });
    }

    db = await connectToDatabase();

    await db.query('UPDATE students SET is_archived = TRUE WHERE student_id = ?', [id]);
    
    try {
        await db.query('UPDATE users SET is_archived = TRUE WHERE id = ?', [id]);
    } catch (e) {
        try {
            await db.query('UPDATE users SET is_archived = TRUE WHERE user_id = ?', [id]);
        } catch (err) {
            console.log("Skipped user login soft delete as table might differ.");
        }
    }

    return NextResponse.json({ success: true, message: 'Student moved to archive successfully!' }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to remove student' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function PUT(request: Request) {
  let db;
  try {
    const body = await request.json();
    
    if (body.type === 'recover') {
      const { id } = body;
      if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

      db = await connectToDatabase();
      
      await db.query('UPDATE students SET is_archived = FALSE WHERE student_id = ?', [id]);
      try {
        await db.query('UPDATE users SET is_archived = FALSE WHERE id = ?', [id]);
      } catch (err) {
        try { await db.query('UPDATE users SET is_archived = FALSE WHERE user_id = ?', [id]); } catch (e) {}
      }

      return NextResponse.json({ success: true, message: 'Student recovered successfully!' }, { status: 200 });
    }

    if (body.type === 'update_password') {
      const { id, newPassword } = body;
      if (!id || !newPassword) return NextResponse.json({ success: false, message: 'Missing data for password update' }, { status: 400 });

      db = await connectToDatabase();
      
      try {
        await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
      } catch (err) {
        try {
          await db.query('UPDATE users SET password = ? WHERE user_id = ?', [newPassword, id]);
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
      return NextResponse.json({ success: true, message: 'Password updated successfully!' }, { status: 200 });
    }

    if (body.type === 'update_image') {
      const { id, profile_image } = body;
      if (!id || !profile_image) return NextResponse.json({ success: false, message: 'Missing data for image update' }, { status: 400 });

      db = await connectToDatabase();
      await db.query('UPDATE students SET profile_image = ? WHERE student_id = ?', [profile_image, id]);
      return NextResponse.json({ success: true, message: 'Profile image updated successfully!' }, { status: 200 });
    }

    // 🔴 UPDATE: Handle Full A-Z Profile Update (Including Phone Number & Users Login ID)
    const { id, fullName, fathersName, mothersName, className, studentGroup, address, phone } = body;

    if (!id) return NextResponse.json({ success: false, message: 'Student ID is required for update' }, { status: 400 });

    db = await connectToDatabase();

    let updateQuery = 'UPDATE students SET full_name = ?, fathers_name = ?, mothers_name = ?, class_name = ?, phone_number = ?, address = ? WHERE student_id = ?';
    let updateParams = [fullName, fathersName, mothersName, className, phone, address, id];

    if (studentGroup !== undefined) {
       updateQuery = 'UPDATE students SET full_name = ?, fathers_name = ?, mothers_name = ?, class_name = ?, student_group = ?, phone_number = ?, address = ? WHERE student_id = ?';
       updateParams = [fullName, fathersName, mothersName, className, studentGroup, phone, address, id];
    }

    await db.query(updateQuery, updateParams);

    // Update login username to match new phone number
    if (phone) {
      try { await db.query('UPDATE users SET username = ? WHERE id = ?', [phone, id]); } 
      catch (err) {
        try { await db.query('UPDATE users SET username = ? WHERE user_id = ?', [phone, id]); } catch (e) {}
      }
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully!' }, { status: 200 });
    
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}