import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// ১. পেমেন্ট ডাটা দেখার জন্য (Admin এবং Student দুইজনের জন্যই)
export async function GET(request: Request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId'); // স্টুডেন্ট আইডি দিয়ে ফিল্টার করার জন্য

    db = await connectToDatabase();
    
    let query = "";
    let params: any[] = [];

    if (studentId) {
      // যদি স্টুডেন্ট লগইন করে থাকে, শুধু তার পেমেন্ট দেখাবে
      query = 'SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC';
      params = [studentId];
    } else {
      // অ্যাডমিনের জন্য সব স্টুডেন্টের নামসহ পেমেন্ট লিস্ট (JOIN Query)
      query = `
        SELECT p.*, s.full_name, s.class_name 
        FROM payments p 
        JOIN students s ON p.student_id = s.student_id 
        ORDER BY p.payment_date DESC`;
    }

    const [rows] = await db.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error fetching payments' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

// ২. অ্যাডমিন যখন নতুন পেমেন্ট অ্যাড করবেন
export async function POST(request: Request) {
  let db;
  try {
    const body = await request.json();
    const { student_id, amount, payment_purpose, payment_status } = body;

    db = await connectToDatabase();
    await db.query(
      'INSERT INTO payments (student_id, amount, payment_purpose, payment_status) VALUES (?, ?, ?, ?)',
      [student_id, amount, payment_purpose, payment_status]
    );

    return NextResponse.json({ success: true, message: 'Payment updated successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update payment' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}``