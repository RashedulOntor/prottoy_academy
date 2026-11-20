import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; // সঠিক ইমপোর্ট

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'ইউজারনেম এবং পাসওয়ার্ড দিন!' }, { status: 400 });
    }

    // Pool ব্যবহার করে সরাসরি কোয়েরি রান করা হচ্ছে
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ? AND (is_archived = FALSE OR is_archived IS NULL)', 
      [username, password]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'ভুল ইউজারনেম বা পাসওয়ার্ড!' }, { status: 401 });
    }

    const user = users[0];
    const userId = user.id || user.user_id;

    return NextResponse.json({ 
      success: true, 
      role: user.role, 
      id: userId 
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার সমস্যা, কিছুক্ষণ পর আবার চেষ্টা করুন।' }, { status: 500 });
  }
}