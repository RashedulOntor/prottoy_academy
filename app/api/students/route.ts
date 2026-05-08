import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let db;
  try {
    db = await connectToDatabase();
    const [students] = await db.query('SELECT * FROM students ORDER BY student_id ASC');
    
    return NextResponse.json({ success: true, data: students }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
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
    const { fullName, fathersName, mothersName, className, phone, address } = body;

    // Auto-generate username (using phone number) and default password
    const generatedUsername = phone;
    const defaultPassword = "password123";

    if (!generatedUsername) {
      return NextResponse.json({ success: false, message: 'Phone number is required for login ID!' }, { status: 400 });
    }

    db = await connectToDatabase();

    // 1. Insert credentials into users table
    const [userResult]: any = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [generatedUsername, defaultPassword, 'student']
    );

    const newUserId = userResult.insertId;

    // 2. Insert detailed profile into students table including parents' names
    await db.query(
      'INSERT INTO students (student_id, full_name, fathers_name, mothers_name, class_name, phone_number, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newUserId, fullName, fathersName, mothersName, className, phone, address]
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

    await db.query('DELETE FROM students WHERE student_id = ?', [id]);
    
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
    } catch (e) {
        try {
            await db.query('DELETE FROM users WHERE user_id = ?', [id]);
        } catch (err) {
            console.log("Skipped user login deletion as table might differ.");
        }
    }

    return NextResponse.json({ success: true, message: 'Student deleted successfully!' }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete student' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

// PUT: Update student profile details OR Security password
export async function PUT(request: Request) {
  let db;
  try {
    const body = await request.json();
    
    // Check if the request is specifically for password update
    if (body.type === 'update_password') {
      const { id, newPassword } = body;
      
      if (!id || !newPassword) {
        return NextResponse.json({ success: false, message: 'Missing data for password update' }, { status: 400 });
      }

      db = await connectToDatabase();
      
      // Update password in the users table
      // Note: Depending on your table structure, the column might be 'id' or 'user_id'
      await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);

      return NextResponse.json({ success: true, message: 'Password updated successfully!' }, { status: 200 });
    }

    // Default: Handle General Profile Update
    const { id, fullName, fathersName, mothersName, className, address } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required for update' }, { status: 400 });
    }

    db = await connectToDatabase();

    // Update detailed info in students table
    await db.query(
      'UPDATE students SET full_name = ?, fathers_name = ?, mothers_name = ?, class_name = ?, address = ? WHERE student_id = ?',
      [fullName, fathersName, mothersName, className, address, id]
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully!' }, { status: 200 });
    
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}