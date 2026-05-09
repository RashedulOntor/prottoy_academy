import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

// ====== এই দুটি লাইন Vercel-এর ক্যাশ (Cache) ধরে রাখা বন্ধ করবে ======
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let db;
  try {
    db = await connectToDatabase();
    
    const [faculties] = await db.query('SELECT * FROM faculty ORDER BY id ASC');
    
    return NextResponse.json({ success: true, data: faculties }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
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

    db = await connectToDatabase();

    await db.query(
      'INSERT INTO faculty (name, designation, education, subjects, experience, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, designation, education, subjects, experience, image]
    );

    return NextResponse.json({ success: true, message: 'Teacher added successfully!' }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to add teacher.' }, { status: 500 });
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
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    db = await connectToDatabase();
    await db.query('DELETE FROM faculty WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully!' }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete teacher' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}