import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let db;
  try {
    db = await connectToDatabase();
    // 🔴 UPDATE: ORDER BY id রিমুভ করা হয়েছে, যাতে ডাটাবেস আর ক্র্যাশ না করে!
    const [faculties] = await db.query('SELECT * FROM faculty');
    
    // কলামের নাম faculty_id থাকলেও যেন ফ্রন্টএন্ডে id হিসেবে কাজ করে
    const formattedFaculties = (faculties as any[]).map(f => ({
      ...f,
      id: f.id || f.faculty_id || f.teacher_id 
    }));

    return NextResponse.json({ success: true, data: formattedFaculties }, { status: 200 });
  } catch (error) {
    console.error("GET FACULTY ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch faculty' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function POST(request: Request) {
  let db;
  try {
    const body = await request.json();
    const { name, designation, education, subjects, experience, image } = body;

    if (!name || !designation) {
      return NextResponse.json({ success: false, message: 'Name and Designation are required!' }, { status: 400 });
    }

    db = await connectToDatabase();
    await db.query(
      'INSERT INTO faculty (name, designation, education, subjects, experience, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, designation, education || "", subjects || "", experience || "", image || null]
    );

    return NextResponse.json({ success: true, message: 'Teacher added successfully!' }, { status: 201 });
  } catch (error) {
    console.error("POST FACULTY ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to add teacher.' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function PUT(request: Request) {
  let db;
  try {
    const body = await request.json();
    db = await connectToDatabase();

    const primaryKey = body.faculty_id ? 'faculty_id' : 'id';
    const targetId = body.faculty_id || body.id;

    if (body.type === 'update_image') {
      const { image } = body;
      await db.query(`UPDATE faculty SET image = ? WHERE ${primaryKey} = ?`, [image, targetId]);
      return NextResponse.json({ success: true, message: 'Image updated successfully!' }, { status: 200 });
    }

    if (body.type === 'update_details') {
      const { name, designation, education, subjects, experience } = body;
      await db.query(
        `UPDATE faculty SET name = ?, designation = ?, education = ?, subjects = ?, experience = ? WHERE ${primaryKey} = ?`,
        [name, designation, education, subjects, experience, targetId]
      );
      return NextResponse.json({ success: true, message: 'Details updated successfully!' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Invalid update type' }, { status: 400 });
  } catch (error) {
    console.error("PUT FACULTY ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function DELETE(request: Request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    db = await connectToDatabase();
    
    try {
      await db.query('DELETE FROM faculty WHERE id = ?', [id]);
    } catch (e) {
      await db.query('DELETE FROM faculty WHERE faculty_id = ?', [id]);
    }

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error("DELETE FACULTY ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}