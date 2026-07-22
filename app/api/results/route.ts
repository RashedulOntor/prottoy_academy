import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// শতকরা হিসাব করে গ্রেডিং লজিক
function calculateGrade(obtained: number, fullMarks: number) {
  const percentage = (obtained / fullMarks) * 100;
  
  if (percentage >= 80) return { point: 5.0, grade: 'A+' };
  if (percentage >= 70) return { point: 4.0, grade: 'A' };
  if (percentage >= 60) return { point: 3.5, grade: 'A-' };
  if (percentage >= 50) return { point: 3.0, grade: 'B' };
  if (percentage >= 40) return { point: 2.0, grade: 'C' };
  if (percentage >= 33) return { point: 1.0, grade: 'D' };
  return { point: 0.0, grade: 'F' };
}

// 🔴 Helper function to safely parse incoming JSON strings
const parseIncomingSubjects = (subjectsData: any) => {
  if (typeof subjectsData === 'string') {
    try {
      return JSON.parse(subjectsData);
    } catch (e) {
      console.error("Failed to parse subjects string in API:", e);
      return [];
    }
  }
  return Array.isArray(subjectsData) ? subjectsData : [];
};

export async function GET(request: Request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    db = await connectToDatabase();
    let query = "";
    let params: any[] = [];

    if (studentId) {
      // স্টুডেন্টের জন্য শুধু তার নিজের রেজাল্ট
      query = 'SELECT id, student_id, exam_name, marks_data AS subjects, total_marks, gpa, grade, created_at FROM exam_results WHERE student_id = ? ORDER BY created_at DESC';
      params = [studentId];
    } else {
      // অ্যাডমিনের জন্য সব স্টুডেন্টের নামসহ রেজাল্ট
      query = `
        SELECT r.id, r.student_id, r.exam_name, r.marks_data AS subjects, r.total_marks, r.gpa, r.grade, r.created_at, s.full_name, s.class_name 
        FROM exam_results r 
        JOIN students s ON r.student_id = s.student_id 
        ORDER BY r.created_at DESC`;
    }

    const [rows] = await db.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch results' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function POST(request: Request) {
  let db;
  try {
    const body = await request.json();
    const { student_id, exam_name, subjects } = body; 

    // 🔴 FIX: স্ট্রিং বা অবজেক্ট যাই আসুক, তাকে অ্যারে বানাবে
    const parsedSubjects = parseIncomingSubjects(subjects);

    if (!parsedSubjects || parsedSubjects.length === 0) {
      return NextResponse.json({ success: false, message: 'No subjects provided or bad format!' }, { status: 400 });
    }

    let total_marks = 0;
    let total_points = 0;
    let fail_flag = false;
    
    const processedSubjects = parsedSubjects.map((sub: any) => {
      const fullMarks = Number(sub.fullMarks) || 100;
      const obtained = Number(sub.obtained) || 0;
      
      const { point, grade } = calculateGrade(obtained, fullMarks);
      
      total_marks += obtained;
      total_points += point;
      
      if (point === 0) fail_flag = true; 

      // 🔴 FIX: ফ্রন্টএন্ডে যেন ঠিকমত ডেটা দেখায় তাই properties গুলো match করানো হলো
      return {
        name: sub.name || sub.subject_name || "Unknown", 
        fullMarks: fullMarks,
        obtained: obtained,
        grade: grade,
        point: point
      };
    });

    let gpa = 0.00;
    let final_grade = 'F';

    if (!fail_flag && parsedSubjects.length > 0) {
      gpa = total_points / parsedSubjects.length;
      
      if (gpa === 5.0) final_grade = 'A+';
      else if (gpa >= 4.0) final_grade = 'A';
      else if (gpa >= 3.5) final_grade = 'A-';
      else if (gpa >= 3.0) final_grade = 'B';
      else if (gpa >= 2.0) final_grade = 'C';
      else if (gpa >= 1.0) final_grade = 'D';
    }

    db = await connectToDatabase();
    
    await db.query(
      'INSERT INTO exam_results (student_id, exam_name, marks_data, total_marks, gpa, grade) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, exam_name, JSON.stringify(processedSubjects), total_marks, gpa.toFixed(2), final_grade]
    );

    return NextResponse.json({ success: true, message: 'Result published successfully!' }, { status: 201 });
    
  } catch (error) {
    console.error("Result Entry Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to add result.' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

// DELETE Method for Deleting Results
export async function DELETE(request: Request) {
    let db;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: 'Result ID is required' }, { status: 400 });

        db = await connectToDatabase();
        await db.query('DELETE FROM exam_results WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Result deleted successfully!' });
    } catch (error) {
        console.error("Result Delete Error:", error);
        return NextResponse.json({ success: false, message: 'Failed to delete result' }, { status: 500 });
    } finally {
        if (db) await db.end();
    }
}

// PUT Method for Updating Results
export async function PUT(request: Request) {
    let db;
    try {
      const body = await request.json();
      const { id, student_id, exam_name, subjects } = body; 
  
      const parsedSubjects = parseIncomingSubjects(subjects);

      if (!id || !parsedSubjects || parsedSubjects.length === 0) {
        return NextResponse.json({ success: false, message: 'Invalid update data!' }, { status: 400 });
      }
  
      let total_marks = 0;
      let total_points = 0;
      let fail_flag = false;
      
      const processedSubjects = parsedSubjects.map((sub: any) => {
        const fullMarks = Number(sub.fullMarks || sub.full_marks) || 100;
        const obtained = Number(sub.obtained || sub.obtained_marks) || 0;
        
        const { point, grade } = calculateGrade(obtained, fullMarks);
        
        total_marks += obtained;
        total_points += point;
        
        if (point === 0) fail_flag = true; 
  
        return {
          name: sub.name || sub.subject_name || "Unknown", 
          fullMarks: fullMarks,
          obtained: obtained,
          grade: grade,
          point: point
        };
      });
  
      let gpa = 0.00;
      let final_grade = 'F';
  
      if (!fail_flag && parsedSubjects.length > 0) {
        gpa = total_points / parsedSubjects.length;
        
        if (gpa === 5.0) final_grade = 'A+';
        else if (gpa >= 4.0) final_grade = 'A';
        else if (gpa >= 3.5) final_grade = 'A-';
        else if (gpa >= 3.0) final_grade = 'B';
        else if (gpa >= 2.0) final_grade = 'C';
        else if (gpa >= 1.0) final_grade = 'D';
      }
  
      db = await connectToDatabase();
      
      await db.query(
        'UPDATE exam_results SET exam_name = ?, marks_data = ?, total_marks = ?, gpa = ?, grade = ? WHERE id = ?',
        [exam_name, JSON.stringify(processedSubjects), total_marks, gpa.toFixed(2), final_grade, id]
      );
  
      return NextResponse.json({ success: true, message: 'Result updated successfully!' });
      
    } catch (error) {
      console.error("Result Update Error:", error);
      return NextResponse.json({ success: false, message: 'Failed to update result.' }, { status: 500 });
    } finally {
      if (db) await db.end();
    }
}