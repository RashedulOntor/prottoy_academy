import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db"; 

export async function GET() {
  try {
    const connection = await connectToDatabase();
    // ডাটাবেস থেকে টিচারদের লিস্ট আনা হচ্ছে
    const [faculties] = await connection.execute(
      "SELECT * FROM faculty ORDER BY id DESC"
    );
    await connection.end(); // কাজ শেষে কানেকশন বন্ধ করা

    return NextResponse.json({ success: true, data: faculties });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, designation, education, subjects, experience } = data;

    const connection = await connectToDatabase();
    // ডাটাবেসে নতুন টিচার অ্যাড করা হচ্ছে
    await connection.execute(
      "INSERT INTO faculty (name, designation, education, subjects, experience) VALUES (?, ?, ?, ?, ?)",
      [name, designation, education, subjects, experience]
    );
    await connection.end();

    return NextResponse.json({ success: true, message: "Faculty added successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const connection = await connectToDatabase();
    // ডাটাবেস থেকে টিচার ডিলিট করা হচ্ছে
    await connection.execute(
      "DELETE FROM faculty WHERE id = ?",
      [id]
    );
    await connection.end();

    return NextResponse.json({ success: true, message: "Faculty deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message });
  }
}