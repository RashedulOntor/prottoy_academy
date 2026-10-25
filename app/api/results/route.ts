import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// অটোমেটিক টেবিল তৈরি করার ফাংশন
async function ensureTableExists(db: any) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS batch_exam_results (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      exam_name VARCHAR(255),
      class_name VARCHAR(255),
      subject_name VARCHAR(255),
      full_marks INT,
      highest_marks INT,
      cq FLOAT,
      mcq FLOAT,
      pr FLOAT,
      total FLOAT,
      grade VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  let db;
  try {
    db = await connectToDatabase();
    await ensureTableExists(db);
    
    // স্টুডেন্টের নামের সাথে রেজাল্ট জয়েন করে আনা হচ্ছে
    const [results] = await db.query(`
      SELECT r.*, s.full_name 
      FROM batch_exam_results r
      JOIN students s ON r.student_id = s.student_id
      ORDER BY r.id DESC
    `);
    
    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    console.error("GET RESULTS ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch results' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function POST(request: Request) {
  let db;
  try {
    const body = await request.json();
    const { exam_name, class_name, subject_name, full_marks, highest_marks, marks_data } = body;
    
    db = await connectToDatabase();
    await ensureTableExists(db);

    // লুপ চালিয়ে প্রত্যেক স্টুডেন্টের রেজাল্ট সেভ বা আপডেট করা
    for (const student_id of Object.keys(marks_data)) {
      const m = marks_data[student_id];
      if (m.total !== "" && m.total !== null) {
        
        // আগে থেকে এই পরীক্ষার রেজাল্ট আছে কি না চেক করা
        const [existing] = await db.query(
          'SELECT id FROM batch_exam_results WHERE student_id=? AND exam_name=? AND subject_name=?',
          [student_id, exam_name, subject_name]
        );

        if ((existing as any[]).length > 0) {
          // থাকলে আপডেট
          await db.query(
            'UPDATE batch_exam_results SET cq=?, mcq=?, pr=?, total=?, grade=?, full_marks=?, highest_marks=? WHERE id=?',
            [m.cq || 0, m.mcq || 0, m.pr || 0, m.total, m.grade, full_marks, highest_marks || 0, (existing as any[])[0].id]
          );
        } else {
          // না থাকলে ইনসার্ট
          await db.query(
            'INSERT INTO batch_exam_results (student_id, exam_name, class_name, subject_name, full_marks, highest_marks, cq, mcq, pr, total, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [student_id, exam_name, class_name, subject_name, full_marks, highest_marks || 0, m.cq || 0, m.mcq || 0, m.pr || 0, m.total, m.grade]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Batch Results Published Successfully!' }, { status: 201 });
  } catch (error) {
    console.error("POST RESULTS ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to save results.' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function PUT(request: Request) {
  let db;
  try {
    const body = await request.json();
    const { id, cq, mcq, pr, total, grade } = body;
    
    db = await connectToDatabase();
    await db.query(
      'UPDATE batch_exam_results SET cq=?, mcq=?, pr=?, total=?, grade=? WHERE id=?',
      [cq || 0, mcq || 0, pr || 0, total, grade, id]
    );

    return NextResponse.json({ success: true, message: 'Result updated successfully!' }, { status: 200 });
  } catch (error) {
    console.error("PUT RESULTS ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to update result' }, { status: 500 });
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
    await db.query('DELETE FROM batch_exam_results WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Result deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error("DELETE RESULTS ERROR:", error);
    return NextResponse.json({ success: false, message: 'Failed to delete result' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}