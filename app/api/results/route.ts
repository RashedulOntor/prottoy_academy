import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const parseSubjectsSafe = (data: any) => {
  if (!data) return [];
  let parsedData = data;
  let attempts = 0;
  while (typeof parsedData === 'string' && attempts < 3) {
    try {
      if (parsedData.trim() === '') break;
      parsedData = JSON.parse(parsedData);
    } catch (e) { break; }
    attempts++;
  }
  if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
    parsedData = Object.values(parsedData);
  }
  return Array.isArray(parsedData) ? parsedData : [];
};

const getGradeAndPoint = (obtained: number, fullMarks: number = 100) => {
  const pct = fullMarks > 0 ? (obtained / fullMarks) * 100 : 0;
  if (pct >= 80) return { grade: 'A+', point: 5.0 };
  if (pct >= 70) return { grade: 'A', point: 4.0 };
  if (pct >= 60) return { grade: 'A-', point: 3.5 };
  if (pct >= 50) return { grade: 'B', point: 3.0 };
  if (pct >= 40) return { grade: 'C', point: 2.0 };
  if (pct >= 33) return { grade: 'D', point: 1.0 };
  return { grade: 'F', point: 0.0 };
};

export async function GET(request: Request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    db = await connectToDatabase();

    let query = `
      SELECT r.*, s.full_name, s.class_name 
      FROM exam_results r 
      LEFT JOIN students s ON r.student_id = s.student_id 
      ORDER BY r.id DESC
    `;
    let params: any[] = [];

    if (studentId) {
      query = `
        SELECT r.*, s.full_name, s.class_name 
        FROM exam_results r 
        LEFT JOIN students s ON r.student_id = s.student_id 
        WHERE r.student_id = ? 
        ORDER BY r.id DESC
      `;
      params = [studentId];
    }

    const [rows]: any = await db.query(query, params);

    const formatted = rows.map((row: any) => ({
      ...row,
      subjects: row.marks_data || row.subjects,
      marks_data: row.marks_data || row.subjects
    }));

    return NextResponse.json({ success: true, data: formatted }, { status: 200 });
  } catch (error) {
    console.error('GET /api/results error:', error);
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

    if (!student_id || !exam_name || !subjects) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const parsedSubs = parseSubjectsSafe(subjects);
    if (parsedSubs.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one subject is required' }, { status: 400 });
    }

    let totalMarks = 0;
    let totalPoints = 0;
    let isFailed = false;

    // 🔴 CQ, MCQ, PR এবং Highest Marks ডাটাবেসে অবিকল সেভ রাখা হচ্ছে
    const processedSubjects = parsedSubs.map((sub: any) => {
      const full = Number(sub.fullMarks ?? sub.full_marks ?? 100);
      const cqVal = sub.cq !== undefined && sub.cq !== "" && sub.cq !== "-" ? Number(sub.cq) : "";
      const mcqVal = sub.mcq !== undefined && sub.mcq !== "" && sub.mcq !== "-" ? Number(sub.mcq) : "";
      const prVal = sub.pr !== undefined && sub.pr !== "" && sub.pr !== "-" ? Number(sub.pr) : "";

      const hasParts = cqVal !== "" || mcqVal !== "" || prVal !== "";
      const obt = hasParts ? (Number(cqVal) || 0) + (Number(mcqVal) || 0) + (Number(prVal) || 0) : Number(sub.obtained ?? sub.obtained_marks ?? 0);
      const highest = sub.highestMarks !== undefined && sub.highestMarks !== "" ? Number(sub.highestMarks) : obt;

      const { grade, point } = getGradeAndPoint(obt, full);

      totalMarks += obt;
      totalPoints += point;
      if (grade === 'F') isFailed = true;

      return {
        name: sub.name || sub.subject_name || 'Subject',
        subject_name: sub.name || sub.subject_name || 'Subject',
        fullMarks: full,
        full_marks: full,
        highestMarks: highest,
        highest_marks: highest,
        cq: cqVal !== "" ? cqVal : "-",
        mcq: mcqVal !== "" ? mcqVal : "-",
        pr: prVal !== "" ? prVal : "-",
        obtained: obt,
        obtained_marks: obt,
        grade,
        gp: point.toFixed(2)
      };
    });

    const rawGpa = isFailed ? 0.0 : totalPoints / processedSubjects.length;
    const finalGpa = Number(rawGpa.toFixed(2));
    let finalGrade = 'F';

    if (!isFailed) {
      if (finalGpa >= 5.0) finalGrade = 'A+';
      else if (finalGpa >= 4.0) finalGrade = 'A';
      else if (finalGpa >= 3.5) finalGrade = 'A-';
      else if (finalGpa >= 3.0) finalGrade = 'B';
      else if (finalGpa >= 2.0) finalGrade = 'C';
      else if (finalGpa >= 1.0) finalGrade = 'D';
    }

    db = await connectToDatabase();

    await db.query(
      'INSERT INTO exam_results (student_id, exam_name, marks_data, total_marks, gpa, grade) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, exam_name, JSON.stringify(processedSubjects), totalMarks, finalGpa, finalGrade]
    );

    return NextResponse.json({ success: true, message: 'Result published successfully!' }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/results error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to publish result' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}

export async function DELETE(request: Request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Result ID required' }, { status: 400 });

    db = await connectToDatabase();
    await db.query('DELETE FROM exam_results WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Result deleted successfully!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete result' }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}