import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { createSessionToken } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'ইউজারনেম এবং পাসওয়ার্ড দিন!' }, { status: 400 });
    }

    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ? AND (is_archived = FALSE OR is_archived IS NULL)',
      [username, password]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'ভুল ইউজারনেম বা পাসওয়ার্ড!' }, { status: 401 });
    }

    const user = users[0];
    let targetId = user.id || user.user_id;

    // যদি ফ্যাকাল্টি হয়, তবে faculty টেবিল থেকে তার আসল faculty id নিয়ে আসা
    if (user.role === 'faculty') {
      const [facRows]: any = await pool.query('SELECT * FROM faculty WHERE user_id = ?', [targetId]);
      if (facRows.length > 0) {
        targetId = facRows[0].id || facRows[0].faculty_id || targetId;
      }
    }

    // সিকিউর সেশন টোকেন তৈরি
    const token = await createSessionToken({
      userId: user.id || user.user_id,
      role: user.role,
      entityId: String(targetId),
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
      id: targetId
    });

    // Session Cookie সেট করা (ব্রাউজার বন্ধ করলেই লগআউট হয়ে যাবে)
    response.cookies.set('prottoy_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার সমস্যা, কিছুক্ষণ পর আবার চেষ্টা করুন।' }, { status: 500 });
  }
}