"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  Users,
  GraduationCap,
  Award,
  Bell,
  CreditCard,
  LogOut,
  ArrowLeft,
  Search,
  Settings,
  Trash2,
  RotateCcw,
  Upload,
  KeyRound,
  Tag,
  Printer,
  X,
  Plus,
  Archive,
  ShieldCheck,
  BookOpen,
  Clock,
  Save,
  User,
} from "lucide-react";
import { useUI } from "../components/UIProvider";

const calculateGradeInfo = (obtained: number, fullMarks: number = 100) => {
  if (fullMarks <= 0 || obtained > fullMarks) return { grade: "INVALID", gp: "0.00" };
  const percentage = (obtained / fullMarks) * 100;
  if (percentage >= 80) return { grade: "A+", gp: "5.00" };
  if (percentage >= 70) return { grade: "A", gp: "4.00" };
  if (percentage >= 60) return { grade: "A-", gp: "3.50" };
  if (percentage >= 50) return { grade: "B", gp: "3.00" };
  if (percentage >= 40) return { grade: "C", gp: "2.00" };
  if (percentage >= 33) return { grade: "D", gp: "1.00" };
  return { grade: "F", gp: "0.00" };
};

const EXAM_NAMES = ["Half Yearly Exam", "Annual Exam", "Pre-Test Exam", "Test Exam", "Model Test", "Class Test"];
const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getClassCode = (cls: string) => {
  const map: Record<string, string> = {
    "Class 6": "06",
    "Class 7": "07",
    "Class 8": "08",
    "Class 9": "09",
    "Class 10": "10",
  };
  return map[cls] || "";
};
const GROUPS = ["Science", "Humanities", "Business Studies", "General"];

const ALL_SUBJECTS = [
  "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper",
  "Mathematics", "General Mathematics", "Higher Mathematics", "Science", "General Science",
  "Physics", "Chemistry", "Biology", "ICT", "Bangladesh & Global Studies",
  "Religion", "Religion & Moral Education", "Accounting", "Finance & Banking",
  "Business Entrepreneurship", "History of BD & World Civilization", "Geography & Environment",
  "Civics & Citizenship", "Economics", "Agriculture Studies", "Home Science",
  "Life & Livelihood", "Health & Wellbeing", "Art & Culture"
];

const getSubjectsList = (cls: string, grp: string) => {
  if (!cls) return [];
  const juniorSubjects = [
    "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper",
    "Mathematics", "Science", "Bangladesh & Global Studies", "ICT",
    "Life & Livelihood", "Health & Wellbeing", "Religion", "Art & Culture"
  ];
  const commonSenior = [
    "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper",
    "General Mathematics", "Religion & Moral Education", "ICT"
  ];
  if (["Class 6", "Class 7", "Class 8"].includes(cls)) return juniorSubjects;
  if (!grp) return [];
  if (grp === "All") return commonSenior;

  let specific: string[] = [];
  if (grp === "Science") {
    specific = ["Physics", "Chemistry", "Biology", "Bangladesh & Global Studies", "Higher Mathematics", "Agriculture Studies", "Home Science"];
  } else if (grp === "Humanities") {
    specific = ["History of BD & World Civilization", "Geography & Environment", "Civics & Citizenship", "General Science", "Economics", "Agriculture Studies", "Home Science"];
  } else if (grp === "Business Studies") {
    specific = ["Accounting", "Finance & Banking", "Business Entrepreneurship", "General Science", "Agriculture Studies", "Home Science"];
  }
  return [...commonSenior, ...specific];
};

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, showConfirm } = useUI();

  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "dashboard");

  const [students, setStudents] = useState<any[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [noticesList, setNoticesList] = useState<any[]>([]);
  const [loadingMsg, setLoadingMsg] = useState("");

  useEffect(() => { if (urlTab) setActiveTab(urlTab); }, [urlTab]);

  const [fullName, setFullName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [className, setClassName] = useState("");
  const [studentGroup, setStudentGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [studentImage, setStudentImage] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const currentYear = new Date().getFullYear();
  const idPrefix = className ? `${currentYear}${getClassCode(className)}` : `${currentYear}--`;
  const generatedStudentId =
    className && rollNumber ? `${currentYear}${getClassCode(className)}${String(rollNumber).padStart(3, "0")}` : "";
  const [studentListClassFilter, setStudentListClassFilter] = useState("");
  const [studentListSearch, setStudentListSearch] = useState("");

  const [manageStudent, setManageStudent] = useState<any>(null);
  const [adminResetPass, setAdminResetPass] = useState("");
  const [updateStudentImage, setUpdateStudentImage] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);

  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Faculty States
  const [fName, setFName] = useState("");
  const [fDesignation, setFDesignation] = useState("");
  const [fEducation, setFEducation] = useState("");
  const [fSubjects, setFSubjects] = useState("");
  const [fExperience, setFExperience] = useState("");
  const [fUsername, setFUsername] = useState("");
  const [fPassword, setFPassword] = useState("faculty123");
  const [fImage, setFImage] = useState("");
  const [manageFaculty, setManageFaculty] = useState<any>(null);
  const [isUpdatingFaculty, setIsUpdatingFaculty] = useState(false);

  // Faculty Assignments States
  const [facultyAssignments, setFacultyAssignments] = useState<any[]>([]);
  const [assignClass, setAssignClass] = useState("");
  const [assignSubject, setAssignSubject] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Notice Board States
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeTargetClass, setNoticeTargetClass] = useState("All");
  const [noticeSaving, setNoticeSaving] = useState(false);

  // Payment States
  const [payClassFilter, setPayClassFilter] = useState("");
  const [paySearchQuery, setPaySearchQuery] = useState("");
  const [payStudentId, setPayStudentId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payType, setPayType] = useState("Monthly Fee");
  const [payMonth, setPayMonth] = useState(MONTHS[new Date().getMonth()]);
  const [payExamName, setPayExamName] = useState("");
  const [payCustomNote, setPayCustomNote] = useState("");
  const [payStatus, setPayStatus] = useState("Paid");
  const [payReceivedBy, setPayReceivedBy] = useState("Admin");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [payLoading, setPayLoading] = useState("");

  const [resultTab, setResultTab] = useState("publish");
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [batchExamName, setBatchExamName] = useState("");
  const [batchClass, setBatchClass] = useState("");
  const [batchGroup, setBatchGroup] = useState("");
  const [batchSubject, setBatchSubject] = useState("");
  const [batchFullMarks, setBatchFullMarks] = useState(100);
  const [batchMarks, setBatchMarks] = useState<any>({});
  const [resultLoading, setResultLoading] = useState("");
  const [resultSearchQuery, setResultSearchQuery] = useState("");

  const [manageResult, setManageResult] = useState<any>(null);
  const [editResultData, setEditResultData] = useState({ cq: "", mcq: "", pr: "", total: "", grade: "" });
  const [isUpdatingResult, setIsUpdatingResult] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("ছবির সাইজ ৫ মেগাবাইটের (5MB) নিচে দিন।", "warning");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const img = new window.Image();
      img.src = base64String;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
          canvas.width = Math.round(img.width * scaleSize);
          canvas.height = Math.round(img.height * scaleSize);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL("image/jpeg", 0.6));
          } else {
            callback(base64String);
          }
        } catch (err) {
          callback(base64String);
        }
      };
      img.onerror = () => callback(base64String);
    };
    reader.onerror = () => showToast("ছবিটি পড়তে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।", "error");
  };

  const handleBatchMarkChange = (studentId: number, field: string, value: string) => {
    if (value !== "") {
      const numVal = Number(value);
      if (numVal < 0 || numVal > batchFullMarks) {
        showToast(`মার্কস অবশ্যই ০ থেকে ${batchFullMarks}-এর মধ্যে হতে হবে।`, "warning");
        return;
      }
    }
    setBatchMarks((prev: any) => {
      const current = prev[studentId] || { cq: "", mcq: "", pr: "" };
      const updated = { ...current, [field]: value };
      const cq = Number(updated.cq) || 0;
      const mcq = Number(updated.mcq) || 0;
      const pr = Number(updated.pr) || 0;
      const total = cq + mcq + pr;

      if (total > batchFullMarks) {
        showToast(`মোট মার্কস (${total}) Full Marks (${batchFullMarks})-এর বেশি হতে পারবে না।`, "warning");
        return prev;
      }
      updated.total = (updated.cq !== "" || updated.mcq !== "" || updated.pr !== "") ? String(total) : "";
      return { ...prev, [studentId]: updated };
    });
  };

  const handlePublishBatchResult = async () => {
    if (!batchExamName || !batchClass || !batchSubject) {
      return showToast("Exam, Class এবং Subject নির্বাচন করুন।", "warning");
    }

    const studentsInClass = classStudents;
    const payloadMarks: any = {};

    for (let std of studentsInClass) {
      const marks = batchMarks[std.student_id];
      if (marks && marks.total !== "") {
        if (Number(marks.total) > batchFullMarks) {
          return showToast(`${std.full_name}-এর মার্কস Full Marks-এর চেয়ে বেশি।`, "error");
        }
        const { grade } = calculateGradeInfo(Number(marks.total), batchFullMarks);
        payloadMarks[std.student_id] = { ...marks, grade };
      }
    }

    if (Object.keys(payloadMarks).length === 0) {
      return showToast("পাবলিশ করার জন্য কোনো মার্কস দেওয়া হয়নি।", "warning");
    }

    setResultLoading("Publishing...");
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_name: batchExamName,
          class_name: batchClass,
          subject_name: batchSubject,
          full_marks: batchFullMarks,
          highest_marks: calculatedHighestMark,
          marks_data: payloadMarks
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "রেজাল্ট সফলভাবে পাবলিশ হয়েছে!", "success");
        setBatchMarks({});
        fetchResults();
        setResultTab("manage");
      } else showToast(data.message || "রেজাল্ট সেভ করতে সমস্যা হয়েছে।", "error");
    } catch (err) {
      showToast("রেজাল্ট সেভ করতে নেটওয়ার্ক সমস্যা হয়েছে।", "error");
    } finally {
      setResultLoading("");
    }
  };

  const fetchResults = () => {
    fetch(`/api/results?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setResultsList(data.data); });
  };

  const fetchNotices = () => {
    fetch(`/api/notices?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setNoticesList(data.data); });
  };

  const fetchFacultyAssignments = (facultyId: number) => {
    fetch(`/api/faculty-assignments?facultyId=${facultyId}&t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setFacultyAssignments(data.data); });
  };

  const openManageResultModal = (resItem: any) => {
    setManageResult(resItem);
    setEditResultData({
      cq: resItem.cq || "",
      mcq: resItem.mcq || "",
      pr: resItem.pr || "",
      total: resItem.total || "",
      grade: resItem.grade || ""
    });
  };

  const handleEditResultMarkChange = (field: string, value: string) => {
    if (value !== "") {
      const numVal = Number(value);
      if (numVal < 0 || numVal > manageResult.full_marks) {
        showToast(`মার্কস ০ থেকে ${manageResult.full_marks}-এর মধ্যে হতে হবে।`, "warning");
        return;
      }
    }
    setEditResultData((prev: any) => {
      const updated = { ...prev, [field]: value };
      const cq = Number(updated.cq) || 0;
      const mcq = Number(updated.mcq) || 0;
      const pr = Number(updated.pr) || 0;
      const total = cq + mcq + pr;

      if (total > manageResult.full_marks) {
        showToast(`টোটাল মার্কস (${total}) Full Marks-এর বেশি হতে পারবে না।`, "warning");
        return prev;
      }
      updated.total = (updated.cq !== "" || updated.mcq !== "" || updated.pr !== "") ? String(total) : "";
      const { grade } = calculateGradeInfo(total, manageResult.full_marks);
      updated.grade = updated.total ? grade : "";
      return updated;
    });
  };

  const handleUpdateSingleResult = async () => {
    setIsUpdatingResult(true);
    try {
      const res = await fetch('/api/results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: manageResult.id, ...editResultData })
      });
      const data = await res.json();
      if (data.success) {
        showToast("রেজাল্ট সফলভাবে আপডেট হয়েছে!", "success");
        setManageResult(null);
        fetchResults();
      } else showToast("আপডেট ব্যর্থ হয়েছে।", "error");
    } catch (err) {
      showToast("আপডেট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setIsUpdatingResult(false);
    }
  };

  const handleDeleteResult = async (id: number) => {
    const ok = await showConfirm({
      title: "Delete Exam Result?",
      message: "Are you sure you want to permanently delete this exam result? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "রেজাল্ট ডিলিট হয়েছে।", "success");
        if (manageResult?.id === id) setManageResult(null);
        fetchResults();
      }
    } catch (err) {}
  };

  const fetchStudents = () => {
    fetch(`/api/students?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setStudents(data.data); });
  };

  const fetchArchivedStudents = () => {
    fetch(`/api/students?archived=true&t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setArchivedStudents(data.data); });
  };

  const fetchFaculties = () => {
    fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setFaculties(data.data);
        else setFaculties([]);
      })
      .catch(() => setFaculties([]));
  };

  const fetchPayments = () => {
    fetch(`/api/payments?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setPayments(data.data); });
  };

  useEffect(() => {
    fetchStudents();
    fetchArchivedStudents();
    fetchFaculties();
    fetchPayments();
    fetchResults();
    fetchNotices();
  }, []);

  const handleLogout = async () => {
    const ok = await showConfirm({
      title: "Sign Out?",
      message: "Are you sure you want to log out of the Admin Portal?",
      confirmText: "Logout",
      variant: "danger",
    });
    if (ok) window.location.href = "/";
  };

  const handleDeleteStudent = async (student: any) => {
    const ok = await showConfirm({
      title: "Move Student to Archive?",
      message: `${student.full_name} will be moved to the archive. You can restore them anytime later.`,
      confirmText: "Move to Archive",
      variant: "danger",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/students?id=${student.student_id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("স্টুডেন্ট আর্কাইভে সরানো হয়েছে।", "success");
        setManageStudent(null);
        fetchStudents();
        fetchArchivedStudents();
      } else {
        showToast(result.message || "আর্কাইভ করতে সমস্যা হয়েছে।", "error");
      }
    } catch (err) {
      showToast("আর্কাইভ করতে ব্যর্থ হয়েছে।", "error");
    }
  };

  const handleRecoverStudent = async (id: number) => {
    const ok = await showConfirm({
      title: "Restore Student?",
      message: "Do you want to restore this student back to the active student list?",
      confirmText: "Restore",
      variant: "primary",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'recover', id: Number(id) })
      });
      const result = await res.json();
      if (result.success) {
        showToast("স্টুডেন্ট সফলভাবে রিস্টোর হয়েছে!", "success");
        fetchStudents();
        fetchArchivedStudents();
      }
    } catch (err) {}
  };

  const handleRegisterStudent = async () => {
    if (!fullName || !phone || !className || !rollNumber) {
      return showToast("Full Name, Class, Roll Number এবং Phone আবশ্যক।", "warning");
    }
    if (Number(rollNumber) < 1 || Number(rollNumber) > 999) {
      return showToast("Roll number ১ থেকে ৯৯৯-এর মধ্যে হতে হবে।", "warning");
    }
    if (["Class 9", "Class 10"].includes(className) && !studentGroup) {
      return showToast("Class 9 ও 10-এর জন্য Group নির্বাচন করুন।", "warning");
    }

    setLoadingMsg("Registering...");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: generatedStudentId,
          fullName,
          fathersName,
          mothersName,
          className,
          studentGroup,
          phone,
          address,
          profile_image: studentImage,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || "নতুন স্টুডেন্ট রেজিস্ট্রেশন সফল হয়েছে!", "success");
        setFullName("");
        setFathersName("");
        setMothersName("");
        setClassName("");
        setStudentGroup("");
        setRollNumber("");
        setPhone("");
        setAddress("");
        setStudentImage("");
        fetchStudents();
        router.push("/admin?tab=studentsList");
      } else {
        showToast(result.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।", "error");
      }
    } catch (err) {
      showToast("সার্ভারের সাথে সংযোগে সমস্যা হয়েছে।", "error");
    } finally {
      setLoadingMsg("");
    }
  };

  const handleUpdateStudentImageAPI = async () => {
    if (!updateStudentImage || !manageStudent) return showToast("একটি ছবি নির্বাচন করুন।", "warning");
    setIsUpdatingImage(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_image',
          id: Number(manageStudent.student_id),
          profile_image: updateStudentImage
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast("প্রোফাইল ছবি আপডেট হয়েছে!", "success");
        setManageStudent({ ...manageStudent, profile_image: updateStudentImage });
        setUpdateStudentImage("");
        fetchStudents();
      } else {
        showToast(result.message || "ছবি আপডেট ব্যর্থ হয়েছে।", "error");
      }
    } catch (err) {
      showToast("ছবি আপলোডে নেটওয়ার্ক সমস্যা হয়েছে।", "error");
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleAdminPasswordReset = async () => {
    if (!adminResetPass || !manageStudent) return showToast("নতুন পাসওয়ার্ড লিখুন।", "warning");
    setIsResetting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_password',
          id: Number(manageStudent.student_id),
          newPassword: adminResetPass
        })
      });
      if ((await res.json()).success) {
        showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", "success");
        setAdminResetPass("");
      }
    } catch (err) {} finally {
      setIsResetting(false);
    }
  };

  const handleUpdateGroup = async () => {
    setIsUpdatingGroup(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(manageStudent.student_id),
          fullName: manageStudent.full_name,
          fathersName: manageStudent.fathers_name,
          mothersName: manageStudent.mothers_name,
          className: manageStudent.class_name,
          address: manageStudent.address,
          studentGroup: editGroup,
          phone: manageStudent.phone_number || manageStudent.phone
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast("গ্রুপ সফলভাবে আপডেট হয়েছে!", "success");
        setManageStudent({ ...manageStudent, student_group: editGroup });
        fetchStudents();
      } else showToast(result.message || "গ্রুপ আপডেট ব্যর্থ হয়েছে।", "error");
    } catch (err) {} finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleUpdateStudentDetails = async () => {
    setIsUpdatingDetails(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(manageStudent.student_id),
          fullName: manageStudent.full_name,
          fathersName: manageStudent.fathers_name,
          mothersName: manageStudent.mothers_name,
          className: manageStudent.class_name,
          studentGroup: manageStudent.student_group,
          phone: manageStudent.phone_number || manageStudent.phone,
          address: manageStudent.address
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast("স্টুডেন্টের তথ্য সফলভাবে আপডেট হয়েছে!", "success");
        fetchStudents();
      } else showToast(result.message || "আপডেট ব্যর্থ হয়েছে।", "error");
    } catch (err) {} finally {
      setIsUpdatingDetails(false);
    }
  };

  const handleRegisterFaculty = async () => {
    if (!fName || !fDesignation || !fUsername) {
      return showToast("Name, Designation এবং Login Username আবশ্যক।", "warning");
    }
    setLoadingMsg("Adding Teacher...");
    try {
      const res = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fName,
          designation: fDesignation,
          education: fEducation,
          subjects: fSubjects,
          experience: fExperience,
          username: fUsername,
          password: fPassword || "faculty123",
          image: fImage
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || "টিচার সফলভাবে যুক্ত হয়েছে!", "success");
        setFName("");
        setFDesignation("");
        setFEducation("");
        setFSubjects("");
        setFExperience("");
        setFUsername("");
        setFPassword("faculty123");
        setFImage("");
        fetchFaculties();
      } else showToast(result.message || "টিচার যুক্ত করতে সমস্যা হয়েছে।", "error");
    } catch (err) {
      showToast("সার্ভার এরর হয়েছে।", "error");
    } finally {
      setLoadingMsg("");
    }
  };

  const handleAssignClassSubject = async () => {
    if (!manageFaculty || !assignClass || !assignSubject) {
      return showToast("Class এবং Subject নির্বাচন করুন।", "warning");
    }
    setIsAssigning(true);
    try {
      const res = await fetch("/api/faculty-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId: manageFaculty.id,
          className: assignClass,
          subjectName: assignSubject
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("ক্লাস ও সাবজেক্ট অ্যাক্সেস যুক্ত হয়েছে!", "success");
        setAssignClass("");
        setAssignSubject("");
        fetchFacultyAssignments(manageFaculty.id);
      } else showToast(data.message || "অ্যাসাইন ব্যর্থ হয়েছে।", "error");
    } catch (err) {
      showToast("অ্যাসাইন করতে সমস্যা হয়েছে।", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignId: number) => {
    const ok = await showConfirm({
      title: "Remove Subject Access?",
      message: "This teacher will no longer have access to manage this class and subject.",
      confirmText: "Remove",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/faculty-assignments?id=${assignId}`, { method: "DELETE" });
    showToast("অ্যাক্সেস সরানো হয়েছে।", "info");
    if (manageFaculty) fetchFacultyAssignments(manageFaculty.id);
  };

  const handleUpdateFacultyDetails = async () => {
    setIsUpdatingFaculty(true);
    try {
      const res = await fetch('/api/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'update_details', ...manageFaculty })
      });
      if ((await res.json()).success) {
        showToast("ফ্যাকাল্টির তথ্য আপডেট হয়েছে!", "success");
        fetchFaculties();
      }
    } catch (err) {} finally {
      setIsUpdatingFaculty(false);
    }
  };

  const handleUpdateFacultyImageAPI = async (base64String: string) => {
    try {
      const res = await fetch('/api/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'update_image', id: manageFaculty.id, image: base64String })
      });
      const result = await res.json();
      if (result.success) {
        showToast("ফ্যাকাল্টির ছবি আপডেট হয়েছে!", "success");
        setManageFaculty({ ...manageFaculty, image: base64String });
        fetchFaculties();
      } else {
        showToast(result.message || "ছবি আপডেট ব্যর্থ হয়েছে।", "error");
      }
    } catch (err) {
      showToast("নেটওয়ার্ক সমস্যা হয়েছে।", "error");
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    const ok = await showConfirm({
      title: "Delete Teacher Permanently?",
      message: "Are you sure you want to remove this teacher from the portal? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" });
      if ((await res.json()).success) {
        showToast("টিচার ডিলিট হয়েছে।", "success");
        setManageFaculty(null);
        fetchFaculties();
      }
    } catch (err) {}
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return showToast("Title এবং Content আবশ্যক।", "warning");
    setNoticeSaving(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          targetClass: noticeTargetClass,
          postedBy: "Admin"
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("নোটিশ সফলভাবে পাবলিশ হয়েছে!", "success");
        setNoticeTitle("");
        setNoticeContent("");
        setNoticeTargetClass("All");
        fetchNotices();
      } else showToast(data.message || "নোটিশ পাবলিশ ব্যর্থ হয়েছে।", "error");
    } catch (err) {
      showToast("নোটিশ পাবলিশে সমস্যা হয়েছে।", "error");
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    const ok = await showConfirm({
      title: "Delete Notice?",
      message: "This notice will be permanently removed from all student portals.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/notices?id=${id}`, { method: "DELETE" });
    showToast("নোটিশ ডিলিট হয়েছে।", "success");
    fetchNotices();
  };

  const handleRecordPayment = async () => {
    if (!payStudentId || !payAmount) return showToast("Student এবং Amount আবশ্যক।", "warning");

    let finalPurpose = payType;
    if (payType === "Monthly Fee") {
      if (!payMonth) return showToast("মাসের নাম নির্বাচন করুন।", "warning");
      finalPurpose = `Monthly Fee - ${payMonth} ${currentYear}`;
    } else if (payType === "Exam Fee") {
      if (!payExamName) return showToast("পরীক্ষার নাম নির্বাচন করুন।", "warning");
      finalPurpose = `Exam Fee - ${payExamName}`;
    } else if (payType === "Fine") {
      finalPurpose = payCustomNote ? `Fine - ${payCustomNote}` : "Fine (জরিমানা)";
    } else if (payType === "Other") {
      if (!payCustomNote) return showToast("পেমেন্টের কারণ লিখুন।", "warning");
      finalPurpose = payCustomNote;
    }

    setPayLoading("Recording...");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: payStudentId,
          amount: payAmount,
          payment_purpose: finalPurpose,
          payment_status: payStatus,
          received_by: payReceivedBy || "Admin"
        })
      });
      if ((await res.json()).success) {
        showToast("পেমেন্ট সফলভাবে রেকর্ড হয়েছে!", "success");
        setPayStudentId("");
        setPayAmount("");
        setPayExamName("");
        setPayCustomNote("");
        fetchPayments();
      }
    } catch (err) {
      showToast("পেমেন্ট রেকর্ড করতে সমস্যা হয়েছে।", "error");
    } finally {
      setPayLoading("");
    }
  };

  const filteredStudentsForPayment = students.filter(std => {
    const matchClass = payClassFilter ? std.class_name === payClassFilter : true;
    const matchSearch = paySearchQuery
      ? std.full_name.toLowerCase().includes(paySearchQuery.toLowerCase()) || std.student_id.toString().includes(paySearchQuery)
      : true;
    return matchClass && matchSearch;
  });

  const filteredStudentsForList = students.filter(std => {
    const matchClass = studentListClassFilter ? std.class_name === studentListClassFilter : true;
    const matchSearch = studentListSearch
      ? std.full_name.toLowerCase().includes(studentListSearch.toLowerCase()) || std.student_id.toString().includes(studentListSearch)
      : true;
    return matchClass && matchSearch;
  });

  const filteredResults = resultsList.filter(res =>
    resultSearchQuery
      ? res.full_name?.toLowerCase().includes(resultSearchQuery.toLowerCase()) ||
        res.exam_name?.toLowerCase().includes(resultSearchQuery.toLowerCase()) ||
        res.subject_name?.toLowerCase().includes(resultSearchQuery.toLowerCase())
      : true
  );

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all text-slate-800 font-medium text-sm";
  const tableNumberBoxClass =
    "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none text-center font-bold text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const isSeniorClass = ["Class 9", "Class 10", "SSC 2026"].includes(batchClass);
  const availableSubjects = getSubjectsList(batchClass, batchGroup);

  const classStudents = students.filter(s => {
    const matchClass = s.class_name === batchClass;
    const matchGroup = (isSeniorClass && batchGroup && batchGroup !== "All") ? s.student_group === batchGroup : true;
    return matchClass && matchGroup;
  });

  let calculatedHighestMark = 0;
  classStudents.forEach(std => {
    const marks = batchMarks[std.student_id];
    if (marks && marks.total) {
      const totalNum = Number(marks.total);
      if (totalNum > calculatedHighestMark) calculatedHighestMark = totalNum;
    }
  });

  return (
    <div className="max-w-7xl mx-auto w-full font-sans bg-[#f8fafc] print:bg-white min-h-screen text-slate-800">
      {/* TOP BAR */}
      <div className="no-print flex justify-between items-center bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/80 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Portal</h2>
          <p className="text-xs font-medium text-slate-500">Prottoy Academy Management System</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 px-4 rounded-xl transition-colors border border-rose-200/60 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {activeTab !== "dashboard" && (
        <div className="no-print mb-6">
          <button
            onClick={() => router.push("?tab=dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-800 overflow-hidden">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 font-semibold text-xs mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrator Workspace
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Welcome back, Admin</h1>
              <p className="text-slate-400 text-sm md:text-base max-w-xl">
                Monitor students, faculty access, notices, exam results, and fee collections from one unified dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div
              onClick={() => router.push("/admin?tab=studentsList")}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
            </div>

            <div
              onClick={() => router.push("/admin?tab=facultyList")}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Faculty</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{faculties.length}</p>
            </div>

            <div
              onClick={() => router.push("/admin?tab=examResults")}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Results</p>
              <p className="text-base font-bold text-indigo-600 mt-2">Publish &amp; Manage</p>
            </div>

            <div
              onClick={() => router.push("/admin?tab=notices")}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notice Board</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{noticesList.length}</p>
            </div>

            <div
              onClick={() => router.push("/admin?tab=payments")}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payments</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* NOTICE BOARD */}
      {activeTab === "notices" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
              <p className="text-xs text-slate-500 font-medium">Broadcast announcements to all students or specific classes</p>
            </div>
          </div>

          <form onSubmit={handlePublishNotice} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-600" /> Publish New Notice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Notice Title *</label>
                <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="e.g. Exam Routine Published" className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Target Audience</label>
                <select value={noticeTargetClass} onChange={(e) => setNoticeTargetClass(e.target.value)} className={inputClass}>
                  <option value="All">All Students (General)</option>
                  {CLASSES.map((c) => <option key={c} value={c}>{c} Only</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Notice Content *</label>
              <textarea rows={4} value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="Write notice details..." className={inputClass} required />
            </div>
            <button type="submit" disabled={noticeSaving} className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors">
              <Bell className="w-4 h-4" />
              {noticeSaving ? "Publishing..." : "Publish Notice"}
            </button>
          </form>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
            <h3 className="text-base font-bold text-slate-800 mb-4">Published Notices ({noticesList.length})</h3>
            {noticesList.length > 0 ? (
              <div className="space-y-3">
                {noticesList.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl border border-slate-200/80 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                          {n.target_class === "All" ? "All Students" : n.target_class}
                        </span>
                        <span className="text-xs font-medium text-slate-400">By {n.posted_by} • {n.created_at?.substring(0, 10)}</span>
                      </div>
                      <h4 className="font-bold text-slate-900">{n.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{n.content}</p>
                    </div>
                    <button onClick={() => handleDeleteNotice(n.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-semibold text-xs rounded-lg shrink-0 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-sm text-center py-8">No notices published yet.</p>
            )}
          </div>
        </div>
      )}

      {/* STUDENTS LIST & MANAGE STUDENT */}
      {activeTab === "studentsList" && (
        <div className="max-w-6xl mx-auto">
          {manageStudent ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" /> Manage Student
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Student ID: {manageStudent.student_id}</p>
                </div>
                <button onClick={() => { setManageStudent(null); setUpdateStudentImage(""); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 font-semibold text-sm rounded-xl hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" /> Close
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/60 lg:col-span-2">
                  <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-5">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                      <input type="text" value={manageStudent.full_name || ""} onChange={(e) => setManageStudent({ ...manageStudent, full_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                      <input type="text" value={manageStudent.phone_number || manageStudent.phone || ""} onChange={(e) => setManageStudent({ ...manageStudent, phone_number: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Father&apos;s Name</label>
                      <input type="text" value={manageStudent.fathers_name || ""} onChange={(e) => setManageStudent({ ...manageStudent, fathers_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mother&apos;s Name</label>
                      <input type="text" value={manageStudent.mothers_name || ""} onChange={(e) => setManageStudent({ ...manageStudent, mothers_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Class</label>
                      <select
                        value={manageStudent.class_name || ""}
                        onChange={(e) => {
                          const newClass = e.target.value;
                          const isSenior = ["Class 9", "Class 10", "SSC 2026"].includes(newClass);
                          setManageStudent({ ...manageStudent, class_name: newClass, student_group: isSenior ? manageStudent.student_group : "" });
                        }}
                        className={inputClass}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {["Class 9", "Class 10", "SSC 2026"].includes(manageStudent.class_name) && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Group</label>
                        <select value={manageStudent.student_group || ""} onChange={(e) => setManageStudent({ ...manageStudent, student_group: e.target.value })} className={inputClass}>
                          <option value="">Select Group</option>
                          {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    )}

                    <div className={["Class 9", "Class 10", "SSC 2026"].includes(manageStudent.class_name) ? "md:col-span-2" : "md:col-span-1"}>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label>
                      <input type="text" value={manageStudent.address || ""} onChange={(e) => setManageStudent({ ...manageStudent, address: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateStudentDetails}
                    disabled={isUpdatingDetails}
                    className="inline-flex items-center justify-center gap-2 w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdatingDetails ? "Saving Details..." : "Save Profile Changes"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60">
                    <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-blue-600" /> Profile Picture
                    </h3>
                    <div className="flex flex-col items-center gap-3">
                      {updateStudentImage || manageStudent.profile_image ? (
                        <img src={updateStudentImage || manageStudent.profile_image} alt={manageStudent.full_name} className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setUpdateStudentImage)} className="text-xs w-full" />
                      <button
                        onClick={handleUpdateStudentImageAPI}
                        disabled={isUpdatingImage || !updateStudentImage}
                        className="w-full py-2 bg-blue-600 text-white text-xs rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUpdatingImage ? "Uploading..." : "Upload Image"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60">
                    <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-indigo-600" /> Update Group
                    </h3>
                    <div className="flex gap-2">
                      <select value={editGroup} onChange={(e) => setEditGroup(e.target.value)} className={inputClass}>
                        <option value="">No Group</option>
                        {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button onClick={handleUpdateGroup} disabled={isUpdatingGroup} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700">Save</button>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60">
                    <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-600" /> Reset Password
                    </h3>
                    <div className="flex flex-col gap-2">
                      <input type="text" value={adminResetPass} onChange={(e) => setAdminResetPass(e.target.value)} placeholder="New password..." className={inputClass} />
                      <button onClick={handleAdminPasswordReset} disabled={isResetting} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700">Update Password</button>
                    </div>
                  </div>

                  <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-200/60">
                    <h3 className="text-xs font-bold text-rose-700 mb-3 uppercase flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" /> Danger Zone
                    </h3>
                    <button onClick={() => handleDeleteStudent(manageStudent)} className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-sm">
                      Move to Archive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Students Directory</h1>
                  <p className="text-xs text-slate-500 font-medium">Manage active student profiles and credentials</p>
                </div>
                {archivedStudents.length > 0 && (
                  <button onClick={() => setActiveTab("archivedStudents")} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs rounded-xl hover:bg-amber-100">
                    <Archive className="w-4 h-4" /> Archive ({archivedStudents.length})
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Filter by Class</label>
                    <select value={studentListClassFilter} onChange={(e) => setStudentListClassFilter(e.target.value)} className={inputClass}>
                      <option value="">All Classes</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Search Name or ID</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input type="text" value={studentListSearch} onChange={(e) => setStudentListSearch(e.target.value)} placeholder="Type student name or ID..." className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="p-4 font-semibold">ID</th>
                        <th className="p-4 font-semibold">Student</th>
                        <th className="p-4 font-semibold">Class &amp; Group</th>
                        <th className="p-4 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredStudentsForList.map((student) => (
                        <tr key={student.student_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-mono text-xs font-semibold text-slate-600">{student.student_id}</td>
                          <td className="p-4 font-semibold text-slate-900 flex items-center gap-3">
                            {student.profile_image ? (
                              <img src={student.profile_image} alt={student.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            {student.full_name}
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-1 rounded-lg text-xs font-semibold">{student.class_name}</span>
                            {student.student_group && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-lg text-xs font-semibold ml-2">{student.student_group}</span>}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => { setManageStudent(student); setEditGroup(student.student_group || ""); setUpdateStudentImage(""); }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors"
                            >
                              <Settings className="w-3.5 h-3.5" /> Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ARCHIVED STUDENTS */}
      {activeTab === "archivedStudents" && (
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Archive className="w-6 h-6 text-amber-600" /> Student Archive
            </h1>
            <button onClick={() => setActiveTab("studentsList")} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50">
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <table className="min-w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold text-center">Restore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivedStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td className="p-4 font-mono text-xs text-slate-500">{student.student_id}</td>
                    <td className="p-4 font-semibold text-slate-800">{student.full_name}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleRecoverStudent(student.student_id)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs">
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD STUDENT */}
      {activeTab === "addNewStudent" && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Register New Student</h1>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50/70">
                <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Profile Photo</p>
                {studentImage ? (
                  <img src={studentImage} alt="Preview" className="w-28 h-28 object-cover rounded-full shadow-sm mb-4 border-2 border-white" />
                ) : (
                  <div className="w-28 h-28 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setStudentImage)} className="text-xs w-full" />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Student Name" className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Father&apos;s Name</label>
                    <input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mother&apos;s Name</label>
                    <input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={["Class 9", "Class 10"].includes(className) ? "md:col-span-1" : "md:col-span-2"}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Class *</label>
                    <select value={className} onChange={(e) => { setClassName(e.target.value); setStudentGroup(""); }} className={inputClass}>
                      <option value="">Select Class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {["Class 9", "Class 10"].includes(className) && (
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Group *</label>
                      <select value={studentGroup} onChange={(e) => setStudentGroup(e.target.value)} className={inputClass}>
                        <option value="">Select Group</option>
                        {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number *</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXXX" className={inputClass} />
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4">
                  <label className="block text-xs font-bold text-blue-900 uppercase mb-2">
                    Student ID (Auto Prefix + Class Roll) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex items-center rounded-xl border border-blue-200 bg-white overflow-hidden">
                      <span className="px-4 py-2.5 bg-slate-900 text-white font-bold text-sm tracking-wider select-none">
                        {idPrefix}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value.slice(0, 3))}
                        placeholder="Roll (e.g. 1)"
                        disabled={!className}
                        className="w-full px-3 py-2.5 outline-none text-slate-900 font-bold text-sm disabled:bg-slate-100"
                      />
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      Final Login ID:{" "}
                      <span className="text-base font-bold text-blue-700 font-mono">
                        {generatedStudentId || "Select Class & Roll"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address details" className={inputClass} />
                </div>

                <button onClick={handleRegisterStudent} disabled={!!loadingMsg} className="w-full py-3 mt-2 bg-slate-900 text-white font-semibold rounded-xl text-sm shadow-sm hover:bg-slate-800 transition-colors">
                  {loadingMsg ? loadingMsg : "Register Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATCH EXAM RESULTS ENTRY */}
      {activeTab === "examResults" && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-5">Exam Results Management</h1>
          <div className="flex flex-wrap gap-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200/80 inline-flex">
            <button onClick={() => { setResultTab("publish"); setManageResult(null); }} className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${resultTab === "publish" ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>Class Wise Entry</button>
            <button onClick={() => { setResultTab("manage"); setManageResult(null); }} className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${resultTab === "manage" ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>Manage Results</button>
          </div>

          {resultTab === "publish" && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Exam Name *</label>
                  <select value={batchExamName} onChange={(e) => setBatchExamName(e.target.value)} className={inputClass}>
                    <option value="">-- Select Exam --</option>
                    {EXAM_NAMES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Class *</label>
                  <select value={batchClass} onChange={(e) => { setBatchClass(e.target.value); setBatchSubject(""); setBatchGroup(""); }} className={inputClass}>
                    <option value="">-- Select Class --</option>
                    {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                {isSeniorClass && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Group *</label>
                    <select value={batchGroup} onChange={(e) => { setBatchGroup(e.target.value); setBatchSubject(""); }} className={inputClass}>
                      <option value="">-- Select Group --</option>
                      <option value="All">All Groups (Common Subjects)</option>
                      {GROUPS.map(grp => <option key={grp} value={grp}>{grp}</option>)}
                    </select>
                  </div>
                )}

                <div className={isSeniorClass ? "md:col-span-3" : "md:col-span-1"}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Subject *</label>
                  <select value={batchSubject} onChange={(e) => setBatchSubject(e.target.value)} className={inputClass}>
                    <option value="">
                      {!batchClass ? "-- Select Class First --" : (isSeniorClass && !batchGroup) ? "-- Select Group First --" : "-- Select Subject --"}
                    </option>
                    {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-5 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Total Full Marks *</label>
                  <input type="number" value={batchFullMarks} onChange={(e) => { let val = Number(e.target.value); if (val < 0) val = 0; if (val > 1000) val = 1000; setBatchFullMarks(val); }} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-slate-900 font-bold text-lg" />
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
                  <label className="block text-xs font-semibold text-emerald-700 mb-1.5 uppercase">Highest Marks (Auto)</label>
                  <input type="text" readOnly value={calculatedHighestMark > 0 ? calculatedHighestMark : ""} placeholder="Auto Calculated" className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-white/80 outline-none text-emerald-700 font-bold text-lg" />
                </div>
              </div>

              {batchClass && batchSubject && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6 bg-white">
                  <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-base">
                        {batchClass} {batchGroup === "All" ? "(All Groups)" : (batchGroup ? `- ${batchGroup}` : "")}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">Subject: {batchSubject}</p>
                    </div>
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold">Students: {classStudents.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="p-4 font-semibold">Student</th>
                          <th className="p-4 font-semibold w-28 text-center">CQ</th>
                          <th className="p-4 font-semibold w-28 text-center">MCQ</th>
                          <th className="p-4 font-semibold w-28 text-center">PR</th>
                          <th className="p-4 font-semibold w-28 text-center">Total</th>
                          <th className="p-4 font-semibold w-24 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classStudents.map((std) => {
                          const marks = batchMarks[std.student_id] || { cq: "", mcq: "", pr: "", total: "" };
                          const totalNum = Number(marks.total) || 0;
                          const { grade } = calculateGradeInfo(totalNum, batchFullMarks);
                          return (
                            <tr key={std.student_id} className="hover:bg-slate-50/70">
                              <td className="p-4">
                                <div className="font-semibold text-slate-900 text-sm">{std.full_name}</div>
                                <div className="text-xs text-slate-500">ID: {std.student_id} {std.student_group && `• ${std.student_group}`}</div>
                              </td>
                              <td className="p-4"><input type="number" value={marks.cq} onChange={(e) => handleBatchMarkChange(std.student_id, "cq", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4"><input type="number" value={marks.mcq} onChange={(e) => handleBatchMarkChange(std.student_id, "mcq", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4"><input type="number" value={marks.pr} onChange={(e) => handleBatchMarkChange(std.student_id, "pr", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4"><div className="w-full py-2 text-center rounded-lg font-bold text-sm border bg-slate-50 text-slate-700 border-slate-200">{marks.total || "-"}</div></td>
                              <td className="p-4">
                                <div className={`w-full py-2 text-center rounded-lg font-bold text-sm border ${marks.total === "" ? 'text-slate-300 border-transparent' : grade === 'F' ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50'}`}>{marks.total ? grade : "-"}</div>
                              </td>
                            </tr>
                          );
                        })}
                        {classStudents.length === 0 && <tr><td colSpan={6} className="p-10 text-center font-medium text-sm text-slate-400">No students found for this selection.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button onClick={handlePublishBatchResult} disabled={!!resultLoading || classStudents.length === 0} className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm text-sm transition-all disabled:opacity-50">
                <Award className="w-4 h-4" />
                {resultLoading ? resultLoading : "Save & Publish Batch Result"}
              </button>
            </div>
          )}

          {resultTab === "manage" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden p-6">
              {manageResult ? (
                <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">Edit Exam Result</h3>
                    <button onClick={() => setManageResult(null)} className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-100">
                      <X className="w-3.5 h-3.5" /> Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Student</p>
                      <p className="text-base font-bold text-slate-900">{manageResult.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Subject &amp; Exam</p>
                      <p className="text-base font-bold text-slate-900">{manageResult.subject_name} <span className="text-sm font-medium text-slate-500">({manageResult.exam_name})</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">CQ</label><input type="number" value={editResultData.cq} onChange={(e) => handleEditResultMarkChange('cq', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">MCQ</label><input type="number" value={editResultData.mcq} onChange={(e) => handleEditResultMarkChange('mcq', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">PR</label><input type="number" value={editResultData.pr} onChange={(e) => handleEditResultMarkChange('pr', e.target.value)} className={inputClass} /></div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Total / {manageResult.full_marks}</label>
                      <input type="text" readOnly value={editResultData.total} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-bold text-center text-slate-700 outline-none text-sm" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleUpdateSingleResult} disabled={isUpdatingResult} className="inline-flex items-center justify-center gap-2 flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl text-sm hover:bg-slate-800">
                      <Save className="w-4 h-4" /> {isUpdatingResult ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => handleDeleteResult(manageResult.id)} className="inline-flex items-center gap-1.5 px-5 py-3 bg-rose-50 text-rose-600 font-semibold rounded-xl border border-rose-200/60 hover:bg-rose-600 hover:text-white text-sm transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5 relative md:w-1/2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input type="text" value={resultSearchQuery} onChange={(e) => setResultSearchQuery(e.target.value)} placeholder="Search by student name, exam or subject..." className={`${inputClass} pl-10`} />
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="p-4 font-semibold">Student</th>
                          <th className="p-4 font-semibold">Exam Details</th>
                          <th className="p-4 font-semibold text-center">Marks</th>
                          <th className="p-4 font-semibold text-center">Grade</th>
                          <th className="p-4 font-semibold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredResults.map((resItem: any) => (
                          <tr key={resItem.id} className="hover:bg-slate-50/70">
                            <td className="p-4">
                              <div className="font-semibold text-slate-900">{resItem.full_name}</div>
                              <div className="text-xs text-slate-500">ID: {resItem.student_id} • {resItem.class_name}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800">{resItem.subject_name}</div>
                              <div className="text-xs text-blue-600 font-medium">{resItem.exam_name}</div>
                            </td>
                            <td className="p-4 text-center font-bold text-slate-800">{resItem.total} <span className="text-xs text-slate-400 font-normal">/ {resItem.full_marks}</span></td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${resItem.grade === 'F' ? 'bg-rose-50 text-rose-600 border border-rose-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'}`}>
                                {resItem.grade}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => openManageResultModal(resItem)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg font-semibold text-xs hover:bg-slate-800">
                                <Settings className="w-3.5 h-3.5" /> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredResults.length === 0 && <tr><td colSpan={5} className="p-10 text-center font-medium text-slate-400">No results found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* FACULTY MANAGEMENT */}
      {activeTab === "facultyList" && (
        <div className="max-w-6xl mx-auto">
          {manageFaculty ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" /> Manage Faculty
                  </h2>
                  {manageFaculty.username && <p className="text-xs font-semibold text-emerald-600 mt-0.5">Login ID: {manageFaculty.username}</p>}
                </div>
                <button onClick={() => setManageFaculty(null)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold text-sm rounded-xl">
                  <X className="w-4 h-4" /> Close
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200/60">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Profile Photo</h3>
                  {manageFaculty.image ? (
                    <img src={manageFaculty.image} alt={manageFaculty.name} className="w-28 h-28 object-cover rounded-full shadow-sm mb-4 border-2 border-white" />
                  ) : (
                    <div className="w-28 h-28 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
                      <GraduationCap className="w-10 h-10" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, handleUpdateFacultyImageAPI)} className="text-xs w-full" />
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label><input type="text" value={manageFaculty.name} onChange={(e) => setManageFaculty({ ...manageFaculty, name: e.target.value })} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Designation</label><input type="text" value={manageFaculty.designation} onChange={(e) => setManageFaculty({ ...manageFaculty, designation: e.target.value })} className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Education</label><input type="text" value={manageFaculty.education} onChange={(e) => setManageFaculty({ ...manageFaculty, education: e.target.value })} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Subjects</label><input type="text" value={manageFaculty.subjects} onChange={(e) => setManageFaculty({ ...manageFaculty, subjects: e.target.value })} className={inputClass} /></div>
                  </div>
                  <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Experience</label><input type="text" value={manageFaculty.experience} onChange={(e) => setManageFaculty({ ...manageFaculty, experience: e.target.value })} className={inputClass} /></div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button onClick={handleUpdateFacultyDetails} disabled={isUpdatingFaculty} className="inline-flex items-center justify-center gap-2 flex-1 py-3 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800">
                      <Save className="w-4 h-4" /> {isUpdatingFaculty ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => handleDeleteFaculty(manageFaculty.id)} className="inline-flex items-center gap-1.5 px-5 py-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors font-semibold text-sm rounded-xl">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-200/70">
                <h3 className="text-sm font-bold text-blue-950 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Assign Class &amp; Subject Access
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <select value={assignClass} onChange={(e) => setAssignClass(e.target.value)} className={inputClass}>
                    <option value="">Select Class</option>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)} className={inputClass}>
                    <option value="">Select Subject</option>
                    {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={handleAssignClassSubject} disabled={isAssigning} className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm">
                    <Plus className="w-4 h-4" /> {isAssigning ? "Assigning..." : "Assign Access"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {facultyAssignments.length > 0 ? (
                    facultyAssignments.map((a) => (
                      <div key={a.id} className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-semibold text-slate-800">
                        <span>{a.class_name} • {a.subject_name}</span>
                        <button onClick={() => handleRemoveAssignment(a.id)} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-medium text-slate-500">No class-subject assigned yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Faculty Management</h1>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 mb-8 max-w-4xl">
                <h3 className="text-base font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" /> Register New Teacher
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50/70">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Profile Photo</p>
                    {fImage ? (
                      <img src={fImage} alt="Preview" className="w-24 h-24 object-cover rounded-full shadow-sm mb-4 border-2 border-white" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-7 h-7" />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setFImage)} className="text-xs w-full" />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Name *" className={inputClass} />
                      <input type="text" value={fDesignation} onChange={(e) => setFDesignation(e.target.value)} placeholder="Designation *" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" value={fEducation} onChange={(e) => setFEducation(e.target.value)} placeholder="Education" className={inputClass} />
                      <input type="text" value={fSubjects} onChange={(e) => setFSubjects(e.target.value)} placeholder="Subjects" className={inputClass} />
                      <input type="text" value={fExperience} onChange={(e) => setFExperience(e.target.value)} placeholder="Experience" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-800 uppercase mb-1">Login Username *</label>
                        <input type="text" value={fUsername} onChange={(e) => setFUsername(e.target.value)} placeholder="e.g. shohel_sir" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-800 uppercase mb-1">Initial Password</label>
                        <input type="text" value={fPassword} onChange={(e) => setFPassword(e.target.value)} placeholder="faculty123" className={inputClass} />
                      </div>
                    </div>
                    <button onClick={handleRegisterFaculty} disabled={!!loadingMsg} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm">
                      {loadingMsg ? loadingMsg : "Register Teacher"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {faculties.map((teacher) => (
                  <div key={teacher.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
                    <div className="w-full aspect-square bg-slate-50 p-4">
                      <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full h-full object-cover rounded-xl border border-slate-200/60" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-slate-900">{teacher.name}</h3>
                      <p className="text-blue-600 font-semibold text-xs uppercase tracking-wider mt-0.5">{teacher.designation}</p>
                      {teacher.username && <p className="text-[11px] font-mono font-semibold text-emerald-600 mt-1 mb-3">ID: {teacher.username}</p>}
                      <div className="text-xs text-slate-500 space-y-1.5 mb-5">
                        <p className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 shrink-0" /> {teacher.education}</p>
                        <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0" /> {teacher.experience}</p>
                        <p className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 shrink-0" /> <span className="text-slate-700 font-semibold">{teacher.subjects}</span></p>
                      </div>
                      <button
                        onClick={() => { setManageFaculty(teacher); fetchFacultyAssignments(teacher.id); }}
                        className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-200 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" /> Manage &amp; Assign
                      </button>
                    </div>
                  </div>
                ))}
                {faculties.length === 0 && <p className="col-span-full text-center text-slate-400 font-medium p-10 text-sm">No teachers found.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* PAYMENTS SECTION */}
      {activeTab === "payments" && (
        <div className="max-w-6xl mx-auto">
          <div className="no-print space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Student Payments</h1>
              <p className="text-xs text-slate-500 font-medium">Record fees, generate receipts, and track payment history</p>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Record Payment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Student *</label>
                  <select value={payStudentId} onChange={(e) => setPayStudentId(e.target.value)} className={inputClass}>
                    <option value="">-- Choose Student --</option>
                    {filteredStudentsForPayment.map(std => (
                      <option key={std.student_id} value={std.student_id}>{std.full_name} ({std.class_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Payment Type *</label>
                  <select value={payType} onChange={(e) => setPayType(e.target.value)} className={inputClass}>
                    <option value="Monthly Fee">Monthly Fee (মাসিক বেতন)</option>
                    <option value="Exam Fee">Exam Fee (পরীক্ষার ফি)</option>
                    <option value="Admission Fee">Admission Fee (ভর্তি ফি)</option>
                    <option value="Fine">Fine (জরিমানা)</option>
                    <option value="Other">Other (অন্যান্য)</option>
                  </select>
                </div>

                {payType === "Monthly Fee" && (
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 uppercase mb-1.5">Select Month *</label>
                    <select value={payMonth} onChange={(e) => setPayMonth(e.target.value)} className={inputClass}>
                      {MONTHS.map(m => <option key={m} value={m}>{m} {currentYear}</option>)}
                    </select>
                  </div>
                )}

                {payType === "Exam Fee" && (
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 uppercase mb-1.5">Select Exam *</label>
                    <select value={payExamName} onChange={(e) => setPayExamName(e.target.value)} className={inputClass}>
                      <option value="">-- Choose Exam --</option>
                      {EXAM_NAMES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                )}

                {(payType === "Fine" || payType === "Other") && (
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 uppercase mb-1.5">
                      {payType === "Fine" ? "Reason (Optional)" : "Specify Purpose *"}
                    </label>
                    <input
                      type="text"
                      value={payCustomNote}
                      onChange={(e) => setPayCustomNote(e.target.value)}
                      placeholder={payType === "Fine" ? "e.g. Late Fee / Absent" : "e.g. ID Card / Sheet"}
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Amount (৳) *</label>
                  <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Received By *</label>
                  <input type="text" value={payReceivedBy} onChange={(e) => setPayReceivedBy(e.target.value)} placeholder="e.g. Rashedul Sir" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Status *</label>
                  <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className={inputClass}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="lg:col-span-3 mt-2">
                  <button type="button" onClick={handleRecordPayment} disabled={!!payLoading} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors w-full md:w-auto">
                    <Save className="w-4 h-4" />
                    {payLoading ? payLoading : "Record Payment"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">All Payment Records ({payments.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Student</th>
                      <th className="p-4 font-semibold">Purpose</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Received By</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 font-semibold text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p: any, idx: number) => (
                      <tr key={p.id || p.payment_id || idx} className="hover:bg-slate-50/70">
                        <td className="p-4 text-slate-600 text-xs font-medium">{p.payment_date?.substring(0, 10)}</td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">{p.full_name}</div>
                          <div className="text-xs text-slate-500">ID: {p.student_id} • {p.class_name}</div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{p.payment_purpose}</td>
                        <td className="p-4 font-bold text-emerald-600">{p.amount} ৳</td>
                        <td className="p-4 font-medium text-blue-700">{p.received_by || "Admin"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.payment_status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-amber-50 text-amber-700 border border-amber-200/60"}`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SCROLLABLE PRINTABLE MONEY RECEIPT MODAL */}
          {selectedReceipt && (
            <div
              onClick={() => setSelectedReceipt(null)}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm print:bg-white print:static flex items-center justify-center p-4 print:p-0"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-3xl print:rounded-none max-w-lg w-full max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible p-6 shadow-2xl print:shadow-none border-2 border-slate-900"
              >
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="no-print absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center border-b-2 border-slate-900 pb-3 mb-4">
                  <img
                    src="/prottoy academy logo.png"
                    alt="Prottoy Academy Logo"
                    className="w-14 h-14 rounded-full object-cover border border-slate-300 mb-2"
                  />
                  <h2 className="text-xl font-black text-emerald-800 leading-tight">প্রত্যয় একাডেমি</h2>
                  <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">PROTTOY ACADEMY</p>
                  <p className="text-[11px] font-medium text-slate-500">ভাবকী বাজার, মেলান্দহ, জামালপুর</p>
                  <span className="inline-block mt-2 px-4 py-0.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full">
                    Official Money Receipt
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-medium">Receipt No:</span>
                    <span className="font-bold font-mono">PA-{selectedReceipt.id || selectedReceipt.payment_id || "001"}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-medium">Date:</span>
                    <span className="font-semibold">{selectedReceipt.payment_date?.substring(0, 10)}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-medium">Student Name:</span>
                    <span className="font-bold">{selectedReceipt.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-medium">Student ID &amp; Class:</span>
                    <span className="font-semibold">{selectedReceipt.student_id} ({selectedReceipt.class_name})</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-medium">Purpose:</span>
                    <span className="font-semibold text-right">{selectedReceipt.payment_purpose}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-medium">Received By:</span>
                    <span className="font-semibold text-blue-700">{selectedReceipt.received_by || "Admin"}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="font-bold uppercase">{selectedReceipt.payment_status}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-200 mt-2">
                    <span className="font-bold text-slate-800">Total Amount:</span>
                    <span className="text-xl font-black text-emerald-700">{selectedReceipt.amount} ৳</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-8 pt-3 text-xs font-semibold text-slate-700">
                  <div className="border-t border-slate-900 pt-1 w-36 text-center">Student / Guardian</div>
                  <div className="border-t border-slate-900 pt-1 w-40 text-center">
                    {selectedReceipt.received_by || "Admin"}<br />
                    <span className="text-[10px] font-normal">Authorized Signature</span>
                  </div>
                </div>

                <div className="no-print flex gap-3 mt-5 pt-4 border-t">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm"
                  >
                    <Printer className="w-4 h-4" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              .no-print { display: none !important; }
              body { background: #ffffff !important; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-[#f8fafc] text-slate-600 font-semibold text-base">Loading Admin Portal...</div>}>
      <AdminContent />
    </Suspense>
  );
}