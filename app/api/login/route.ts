import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const db = await connectToDatabase();
    
    // Checking user credentials from the database
    const [rows]: any = await db.query(
      'SELECT user_id, username, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      // If user is found, return user details along with success status
      return NextResponse.json({ success: true, user: rows[0] }, { status: 200 });
    } else {
      // If username or password does not match
      return NextResponse.json({ success: false, message: 'Invalid username or password!' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error!' }, { status: 500 });
  }
}