"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      alert("⚠️ ছবির সাইজ ৫ মেগাবাইটের (5MB) নিচে দিন।");
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
    reader.onerror = () => alert("❌ ছবিটি পড়তে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।");
  };

  const handleBatchMarkChange = (studentId: number, field: string, value: string) => {
    if (value !== "") {
      const numVal = Number(value);
      if (numVal < 0 || numVal > batchFullMarks) {
        alert(`⚠️ মার্কস অবশ্যই ০ থেকে ${batchFullMarks} এর মধ্যে হতে হবে!`);
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
        alert(`⚠️ মোট মার্কস (${total}) কোনোভাবেই Full Marks (${batchFullMarks}) এর বেশি হতে পারবে না!`);
        return prev;
      }
      updated.total = (updated.cq !== "" || updated.mcq !== "" || updated.pr !== "") ? String(total) : "";
      return { ...prev, [studentId]: updated };
    });
  };

  const handlePublishBatchResult = async () => {
    if (!batchExamName || !batchClass || !batchSubject) return alert("❌ Exam, Class and Subject are required!");

    const studentsInClass = classStudents;
    const payloadMarks: any = {};

    for (let std of studentsInClass) {
      const marks = batchMarks[std.student_id];
      if (marks && marks.total !== "") {
        if (Number(marks.total) > batchFullMarks) return alert(`❌ Marks for ${std.full_name} exceeds Full Marks!`);
        const { grade } = calculateGradeInfo(Number(marks.total), batchFullMarks);
        payloadMarks[std.student_id] = { ...marks, grade };
      }
    }

    if (Object.keys(payloadMarks).length === 0) return alert("⚠️ No marks entered to publish!");

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
        alert("✅ " + data.message);
        setBatchMarks({});
        fetchResults();
        setResultTab("manage");
      } else alert("❌ Error: " + data.message);
    } catch (err) {
      alert("❌ Failed to save results!");
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
        alert(`⚠️ মার্কস ০ থেকে ${manageResult.full_marks} এর মধ্যে হতে হবে!`);
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
        alert(`⚠️ টোটাল মার্কস (${total}) Full Marks এর বেশি হতে পারবে না!`);
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
        alert("✅ Result updated successfully!");
        setManageResult(null);
        fetchResults();
      } else alert("❌ Update failed.");
    } catch (err) {
      alert("❌ Update error");
    } finally {
      setIsUpdatingResult(false);
    }
  };

  const handleDeleteResult = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this result?")) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
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

  const handleLogout = () => { window.location.href = "/"; };

  const handleDeleteStudent = async (id: number) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        alert("✅ Moved to archive.");
        setManageStudent(null);
        setShowDeleteModal(false);
        fetchStudents();
        fetchArchivedStudents();
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Failed to archive student.");
    }
  };

  const handleRecoverStudent = async (id: number) => {
    if (!window.confirm("Restore this student?")) return;
    try {
      const res = await fetch(`/api/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'recover', id: Number(id) })
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Restored!");
        fetchStudents();
        fetchArchivedStudents();
      }
    } catch (err) {}
  };

  const handleRegisterStudent = async () => {
    if (!fullName || !phone || !className || !rollNumber) {
      return alert("❌ Required: Full Name, Class, Roll Number, and Phone!");
    }
    if (Number(rollNumber) < 1 || Number(rollNumber) > 999) {
      return alert("❌ Roll number must be between 1 and 999!");
    }
    if (["Class 9", "Class 10"].includes(className) && !studentGroup) {
      return alert("❌ Required: Group must be selected for Class 9 & 10!");
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
        alert("✅ " + result.message);
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
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Server connection error while registering student!");
    } finally {
      setLoadingMsg("");
    }
  };

  const handleUpdateStudentImageAPI = async () => {
    if (!updateStudentImage || !manageStudent) return alert("⚠️ Please select an image!");
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
        alert("✅ Image updated!");
        setManageStudent({ ...manageStudent, profile_image: updateStudentImage });
        setUpdateStudentImage("");
        fetchStudents();
      } else {
        alert("❌ Image update failed: " + result.message);
      }
    } catch (err) {
      alert("❌ Network error while uploading image!");
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleAdminPasswordReset = async () => {
    if (!adminResetPass || !manageStudent) return;
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
        alert("✅ Password changed!");
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
        alert("✅ Group updated successfully!");
        setManageStudent({ ...manageStudent, student_group: editGroup });
        fetchStudents();
      } else alert("❌ Error: " + result.message);
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
        alert("✅ Student details updated successfully!");
        fetchStudents();
      } else alert("❌ Error: " + result.message);
    } catch (err) {} finally {
      setIsUpdatingDetails(false);
    }
  };

  const handleRegisterFaculty = async () => {
    if (!fName || !fDesignation || !fUsername) {
      return alert("❌ Required: Name, Designation, and Login Username!");
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
        alert("✅ " + result.message);
        setFName("");
        setFDesignation("");
        setFEducation("");
        setFSubjects("");
        setFExperience("");
        setFUsername("");
        setFPassword("faculty123");
        setFImage("");
        fetchFaculties();
      } else alert("❌ Error: " + result.message);
    } catch (err) {
      alert("❌ Failed to add teacher!");
    } finally {
      setLoadingMsg("");
    }
  };

  const handleAssignClassSubject = async () => {
    if (!manageFaculty || !assignClass || !assignSubject) {
      return alert("⚠️ Select Class and Subject!");
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
        alert("✅ Access assigned!");
        setAssignClass("");
        setAssignSubject("");
        fetchFacultyAssignments(manageFaculty.id);
      } else alert("❌ " + data.message);
    } catch (err) {
      alert("❌ Failed to assign.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignId: number) => {
    if (!window.confirm("Remove this class-subject access?")) return;
    await fetch(`/api/faculty-assignments?id=${assignId}`, { method: "DELETE" });
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
        alert("✅ Faculty details updated!");
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
        alert("✅ Image updated!");
        setManageFaculty({ ...manageFaculty, image: base64String });
        fetchFaculties();
      } else {
        alert("❌ Image update failed: " + result.message);
      }
    } catch (err) {
      alert("❌ Network error while updating faculty image!");
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    if (!window.confirm("Delete this teacher permanently?")) return;
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" });
      if ((await res.json()).success) {
        alert("✅ Deleted.");
        setManageFaculty(null);
        fetchFaculties();
      }
    } catch (err) {}
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return alert("⚠️ Title and Content are required!");
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
        alert("✅ Notice published!");
        setNoticeTitle("");
        setNoticeContent("");
        setNoticeTargetClass("All");
        fetchNotices();
      } else alert("❌ " + data.message);
    } catch (err) {
      alert("❌ Error publishing notice.");
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!window.confirm("Delete this notice?")) return;
    await fetch(`/api/notices?id=${id}`, { method: "DELETE" });
    fetchNotices();
  };

  const handleRecordPayment = async () => {
    if (!payStudentId || !payAmount) return alert("❌ Student and Amount are required!");

    let finalPurpose = payType;
    if (payType === "Monthly Fee") {
      if (!payMonth) return alert("⚠️ Please select a month!");
      finalPurpose = `Monthly Fee - ${payMonth} ${currentYear}`;
    } else if (payType === "Exam Fee") {
      if (!payExamName) return alert("⚠️ Please select an exam!");
      finalPurpose = `Exam Fee - ${payExamName}`;
    } else if (payType === "Fine") {
      finalPurpose = payCustomNote ? `Fine - ${payCustomNote}` : "Fine (জরিমানা)";
    } else if (payType === "Other") {
      if (!payCustomNote) return alert("⚠️ Please specify the purpose!");
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
        alert("✅ Payment Recorded!");
        setPayStudentId("");
        setPayAmount("");
        setPayExamName("");
        setPayCustomNote("");
        fetchPayments();
      }
    } catch (err) {} finally {
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

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium shadow-sm text-sm";
  const tableNumberBoxClass = "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-sm transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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
    <div className="max-w-7xl mx-auto w-full font-sans bg-[#f4f7fc] print:bg-white min-h-screen text-slate-800">
      <div className="no-print flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Admin Portal</h2>
          <p className="text-sm font-medium text-slate-500">Manage Prottoy Academy System</p>
        </div>
        <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-6 rounded-xl transition-colors flex items-center gap-2 border border-red-100 shadow-sm active:scale-95 text-sm">
          🚪 <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      {activeTab !== "dashboard" && (
        <div className="no-print mb-6">
          <button onClick={() => router.push("?tab=dashboard")} className="px-5 py-2 bg-slate-800 text-white hover:bg-slate-900 font-bold text-sm rounded-xl shadow-sm active:scale-95 transition-all">
            ⬅ Back to Dashboard
          </button>
        </div>
      )}

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="animate-fade-in">
          <div className="relative bg-[#0f172a] text-white rounded-[2rem] p-8 md:p-12 mb-8 shadow-xl border border-slate-800">
            <div className="relative z-10">
              <p className="text-blue-400 font-bold tracking-widest mb-2 text-xs uppercase">Overview</p>
              <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-white">Welcome, Admin!</h1>
              <p className="text-slate-400 text-sm md:text-base max-w-xl font-medium">Manage students, faculties, notices, payments, and exam results securely from this portal.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <div onClick={() => router.push("/admin?tab=studentsList")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Total Students</h3>
              <p className="text-3xl font-black text-slate-800">{students.length}</p>
            </div>
            <div onClick={() => router.push("/admin?tab=facultyList")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Total Faculty</h3>
              <p className="text-3xl font-black text-slate-800">{faculties.length}</p>
            </div>
            <div onClick={() => router.push("/admin?tab=examResults")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Exam Results</h3>
              <p className="text-lg font-black text-indigo-600 mt-1">Publish &amp; View</p>
            </div>
            <div onClick={() => router.push("/admin?tab=notices")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Notice Board</h3>
              <p className="text-lg font-black text-rose-600 mt-1">{noticesList.length} Notices</p>
            </div>
            <div onClick={() => router.push("/admin?tab=payments")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Payments</h3>
              <p className="text-lg font-black text-amber-600 mt-1">{payments.length} Records</p>
            </div>
          </div>
        </div>
      )}

      {/* NOTICE BOARD */}
      {activeTab === "notices" && (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
          <h1 className="text-2xl font-black text-slate-800">📢 Notice Board Management</h1>

          <form onSubmit={handlePublishNotice} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-700 border-b border-slate-100 pb-3">+ Publish New Notice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Title *</label>
                <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="e.g. Exam Routine Published" className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Audience</label>
                <select value={noticeTargetClass} onChange={(e) => setNoticeTargetClass(e.target.value)} className={inputClass}>
                  <option value="All">All Students (General)</option>
                  {CLASSES.map((c) => <option key={c} value={c}>{c} Only</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Content *</label>
              <textarea rows={4} value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="Write notice details..." className={inputClass} required />
            </div>
            <button type="submit" disabled={noticeSaving} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-sm shadow-sm">
              {noticeSaving ? "Publishing..." : "📢 Publish Notice"}
            </button>
          </form>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-700 mb-4">Published Notices ({noticesList.length})</h3>
            {noticesList.length > 0 ? (
              <div className="space-y-3">
                {noticesList.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 mr-2">
                        {n.target_class === "All" ? "All Students" : n.target_class}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">By {n.posted_by} • {n.created_at?.substring(0, 10)}</span>
                      <h4 className="font-black text-slate-900 mt-1">{n.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{n.content}</p>
                    </div>
                    <button onClick={() => handleDeleteNotice(n.id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs rounded-lg shrink-0 transition-colors">
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-bold text-sm text-center py-6">No notices published yet.</p>
            )}
          </div>
        </div>
      )}

      {/* STUDENTS LIST & MANAGE STUDENT */}
      {activeTab === "studentsList" && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          {manageStudent ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800">⚙️ Manage Student</h2>
                  <p className="text-xs text-slate-500 font-bold">ID: {manageStudent.student_id}</p>
                </div>
                <button onClick={() => { setManageStudent(null); setUpdateStudentImage(""); }} className="px-5 py-2 bg-slate-100 font-bold text-sm rounded-lg hover:bg-slate-200">Close</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 lg:col-span-2">
                  <h3 className="text-sm font-black tracking-wider text-slate-500 uppercase mb-6">A-Z Edit Profile Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                      <input type="text" value={manageStudent.full_name || ""} onChange={(e) => setManageStudent({ ...manageStudent, full_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                      <input type="text" value={manageStudent.phone_number || manageStudent.phone || ""} onChange={(e) => setManageStudent({ ...manageStudent, phone_number: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father&apos;s Name</label>
                      <input type="text" value={manageStudent.fathers_name || ""} onChange={(e) => setManageStudent({ ...manageStudent, fathers_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mother&apos;s Name</label>
                      <input type="text" value={manageStudent.mothers_name || ""} onChange={(e) => setManageStudent({ ...manageStudent, mothers_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class</label>
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
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Group</label>
                        <select value={manageStudent.student_group || ""} onChange={(e) => setManageStudent({ ...manageStudent, student_group: e.target.value })} className={inputClass}>
                          <option value="">Select Group</option>
                          {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    )}

                    <div className={["Class 9", "Class 10", "SSC 2026"].includes(manageStudent.class_name) ? "md:col-span-2" : "md:col-span-1"}>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                      <input type="text" value={manageStudent.address || ""} onChange={(e) => setManageStudent({ ...manageStudent, address: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateStudentDetails}
                    disabled={isUpdatingDetails}
                    className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    {isUpdatingDetails ? "Saving Details..." : "💾 Save Profile Changes"}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-sm font-black text-blue-800 mb-3 uppercase">📷 Update Picture</h3>
                    <div className="flex flex-col items-center gap-3">
                      {updateStudentImage ? (
                        <img src={updateStudentImage} alt="Preview" className="w-20 h-20 rounded-full object-cover shadow-sm border border-white" />
                      ) : manageStudent.profile_image ? (
                        <img src={manageStudent.profile_image} alt={manageStudent.full_name} className="w-20 h-20 rounded-full object-cover shadow-sm border border-white" />
                      ) : (
                        <div className="w-20 h-20 bg-blue-100 text-blue-400 rounded-full flex items-center justify-center text-3xl">👤</div>
                      )}
                      <div className="w-full">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setUpdateStudentImage)} className="text-xs w-full mb-2" />
                        <button
                          onClick={handleUpdateStudentImageAPI}
                          disabled={isUpdatingImage || !updateStudentImage}
                          className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isUpdatingImage ? "Uploading..." : "Upload Image"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-sm font-black text-purple-800 mb-3 uppercase">🏷️ Update Group</h3>
                    <div className="flex gap-3">
                      <select value={editGroup} onChange={(e) => setEditGroup(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-purple-200 text-sm font-medium outline-none bg-white">
                        <option value="">No Group</option>
                        {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button onClick={handleUpdateGroup} disabled={isUpdatingGroup} className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors">Update</button>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                    <h3 className="text-sm font-black text-emerald-800 mb-3 uppercase">🔑 Reset Password</h3>
                    <div className="flex flex-col gap-3">
                      <input type="text" value={adminResetPass} onChange={(e) => setAdminResetPass(e.target.value)} placeholder="New password..." className="w-full px-4 py-2 rounded-lg border border-emerald-200 text-sm font-medium outline-none" />
                      <button onClick={handleAdminPasswordReset} disabled={isResetting} className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">Update Password</button>
                    </div>
                  </div>

                  <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                    <h3 className="text-sm font-black text-red-800 mb-3 uppercase">🗑️ Danger Zone</h3>
                    <button onClick={() => setShowDeleteModal(true)} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-sm">Remove Student</button>
                  </div>
                </div>
              </div>

              {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                    <h3 className="text-lg font-black text-slate-800 mb-2">Move Student to Archive?</h3>
                    <p className="text-sm text-slate-500 mb-6">You can restore {manageStudent.full_name} later from the Archive list.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm">Cancel</button>
                      <button onClick={() => handleDeleteStudent(manageStudent.student_id)} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg text-sm">Confirm</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-slate-800">Students List</h1>
                {archivedStudents.length > 0 && (
                  <button onClick={() => setActiveTab("archivedStudents")} className="px-4 py-2 bg-amber-500 text-white font-bold text-sm rounded-lg shadow-sm">♻️ Archive ({archivedStudents.length})</button>
                )}
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filter by Class</label>
                    <select value={studentListClassFilter} onChange={(e) => setStudentListClassFilter(e.target.value)} className={inputClass}>
                      <option value="">All Classes</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Name / ID</label>
                    <input type="text" value={studentListSearch} onChange={(e) => setStudentListSearch(e.target.value)} placeholder="Type name or ID..." className={inputClass} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold text-slate-500 text-sm">ID</th>
                      <th className="p-4 font-bold text-slate-500 text-sm">Name</th>
                      <th className="p-4 font-bold text-slate-500 text-sm">Class &amp; Group</th>
                      <th className="p-4 font-bold text-slate-500 text-sm text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredStudentsForList.map((student) => (
                      <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-600">{student.student_id}</td>
                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                          {student.profile_image ? (
                            <img src={student.profile_image} alt={student.full_name} className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">👤</div>
                          )}
                          {student.full_name}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">{student.class_name}</span>
                          {student.student_group && <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold ml-2">{student.student_group}</span>}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => { setManageStudent(student); setEditGroup(student.student_group || ""); setUpdateStudentImage(""); }} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs active:scale-95 transition-transform">⚙️ Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ARCHIVED STUDENTS */}
      {activeTab === "archivedStudents" && (
        <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-slate-800 mb-1">♻️ Student Archive</h1>
            <button onClick={() => setActiveTab("studentsList")} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-300">⬅ Back to List</button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-500">ID</th>
                  <th className="p-4 font-bold text-slate-500">Name</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Restore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivedStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td className="p-4 font-medium text-slate-500">{student.student_id}</td>
                    <td className="p-4 font-bold text-slate-700">{student.full_name}</td>
                    <td className="p-4 text-center"><button onClick={() => handleRecoverStudent(student.student_id)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs">♻️ Recover</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD STUDENT */}
      {activeTab === "addNewStudent" && (
        <div className="animate-fade-in">
          <h1 className="text-2xl font-black text-slate-800 mb-6">Register New Student</h1>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50">
                <p className="text-xs font-bold text-slate-500 mb-4 text-center uppercase tracking-wider">Profile Image</p>
                {studentImage ? (
                  <img src={studentImage} alt="Preview" className="w-28 h-28 object-cover rounded-full shadow-sm mb-4 border-2 border-white" />
                ) : (
                  <div className="w-28 h-28 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">📷</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setStudentImage)} className="text-xs w-full" />
              </div>

              <div className="md:col-span-2 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Student Name" className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father&apos;s Name</label>
                    <input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mother&apos;s Name</label>
                    <input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={["Class 9", "Class 10"].includes(className) ? "md:col-span-1" : "md:col-span-2"}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class *</label>
                    <select value={className} onChange={(e) => { setClassName(e.target.value); setStudentGroup(""); }} className={inputClass}>
                      <option value="">Select Class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {["Class 9", "Class 10"].includes(className) && (
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Group *</label>
                      <select value={studentGroup} onChange={(e) => setStudentGroup(e.target.value)} className={inputClass}>
                        <option value="">Select Group</option>
                        {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number *</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXXX" className={inputClass} />
                  </div>
                </div>

                {/* Auto Student ID & Roll Number */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
                  <label className="block text-xs font-black text-blue-800 uppercase mb-2">
                    Student ID (Auto Prefix + Class Roll) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex items-center rounded-xl border border-blue-300 bg-white overflow-hidden shadow-sm">
                      <span className="px-4 py-2.5 bg-slate-800 text-white font-black text-sm tracking-wider select-none">
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
                        className="w-full px-3 py-2.5 outline-none text-slate-900 font-black text-sm disabled:bg-slate-100"
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      Final Login ID:{" "}
                      <span className="text-base font-black text-blue-700 tracking-wider">
                        {generatedStudentId || "Select Class & Roll"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address details" className={inputClass} />
                </div>

                <button onClick={handleRegisterStudent} disabled={!!loadingMsg} className="w-full py-3 mt-2 bg-slate-800 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-slate-900 transition-colors">
                  {loadingMsg ? loadingMsg : "Register Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATCH EXAM RESULTS ENTRY */}
      {activeTab === "examResults" && (
        <div className="animate-fade-in">
          <h1 className="text-2xl font-black text-slate-800 mb-6">Exam Results Management</h1>
          <div className="flex flex-wrap gap-3 mb-6 bg-white p-2 rounded-xl shadow-sm border border-slate-200 inline-flex">
            <button onClick={() => { setResultTab("publish"); setManageResult(null); }} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${resultTab === "publish" ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>📝 Class Wise Entry</button>
            <button onClick={() => { setResultTab("manage"); setManageResult(null); }} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${resultTab === "manage" ? 'bg-slate-800 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>📋 Manage Results</button>
          </div>

          {resultTab === "publish" && (
            <div className="bg-[#f8fafc] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Exam Name *</label>
                  <select value={batchExamName} onChange={(e) => setBatchExamName(e.target.value)} className={inputClass}>
                    <option value="">-- Select Exam --</option>
                    {EXAM_NAMES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Class *</label>
                  <select value={batchClass} onChange={(e) => { setBatchClass(e.target.value); setBatchSubject(""); setBatchGroup(""); }} className={inputClass}>
                    <option value="">-- Select Class --</option>
                    {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                {isSeniorClass && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Group *</label>
                    <select value={batchGroup} onChange={(e) => { setBatchGroup(e.target.value); setBatchSubject(""); }} className={inputClass}>
                      <option value="">-- Select Group --</option>
                      <option value="All">All Groups (Common Subjects)</option>
                      {GROUPS.map(grp => <option key={grp} value={grp}>{grp}</option>)}
                    </select>
                  </div>
                )}

                <div className={isSeniorClass ? "md:col-span-3 lg:col-span-3" : "md:col-span-1"}>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Subject *</label>
                  <select value={batchSubject} onChange={(e) => setBatchSubject(e.target.value)} className={inputClass}>
                    <option value="">
                      {!batchClass
                        ? "-- Select Class First --"
                        : (isSeniorClass && !batchGroup)
                          ? "-- Select Group First --"
                          : "-- Select Subject --"}
                    </option>
                    {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-slate-200">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                  <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wider">Total Full Marks *</label>
                  <input type="number" value={batchFullMarks} onChange={(e) => { let val = Number(e.target.value); if (val < 0) val = 0; if (val > 1000) val = 1000; setBatchFullMarks(val); }} className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-blue-700 font-bold text-xl shadow-inner" />
                </div>
                <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                  <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider">Highest Marks (Auto)</label>
                  <input type="text" readOnly value={calculatedHighestMark > 0 ? calculatedHighestMark : ""} placeholder="Auto Calculated" className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-100/30 outline-none text-emerald-700 font-bold text-xl shadow-inner placeholder:text-emerald-400" />
                </div>
              </div>

              {batchClass && batchSubject && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm bg-white">
                  <div className="bg-slate-800 text-white p-5 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg tracking-wide">
                        {batchClass} {batchGroup === "All" ? "(All Groups)" : (batchGroup ? `- ${batchGroup}` : "")}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium mt-1">Provide marks for {batchSubject}</p>
                    </div>
                    <div className="bg-slate-700/50 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-600">
                      Students: {classStudents.length}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Student Info</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">CQ</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">MCQ</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">PR</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">Total</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-24 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classStudents.map((std) => {
                          const marks = batchMarks[std.student_id] || { cq: "", mcq: "", pr: "", total: "" };
                          const totalNum = Number(marks.total) || 0;
                          const { grade } = calculateGradeInfo(totalNum, batchFullMarks);

                          return (
                            <tr key={std.student_id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-800 text-sm">{std.full_name}</div>
                                <div className="text-xs font-medium text-slate-500 mt-0.5">
                                  ID: {std.student_id} {std.student_group && `| ${std.student_group}`}
                                </div>
                              </td>
                              <td className="p-4"><input type="number" value={marks.cq} onChange={(e) => handleBatchMarkChange(std.student_id, "cq", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4"><input type="number" value={marks.mcq} onChange={(e) => handleBatchMarkChange(std.student_id, "mcq", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4"><input type="number" value={marks.pr} onChange={(e) => handleBatchMarkChange(std.student_id, "pr", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4">
                                <div className="w-full py-2 text-center rounded-lg font-bold text-sm border bg-slate-50 text-slate-700 border-slate-200">{marks.total || "-"}</div>
                              </td>
                              <td className="p-4">
                                <div className={`w-full py-2 text-center rounded-lg font-bold text-sm border ${marks.total === "" ? 'bg-transparent text-slate-300 border-transparent' : grade === 'F' ? 'text-red-600 border-red-100 bg-red-50/50' : 'text-emerald-600 border-emerald-100 bg-emerald-50/50'}`}>{marks.total ? grade : "-"}</div>
                              </td>
                            </tr>
                          );
                        })}
                        {classStudents.length === 0 && <tr><td colSpan={6} className="p-12 text-center font-bold text-sm text-slate-400">No students found for this selection.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button onClick={handlePublishBatchResult} disabled={!!resultLoading || classStudents.length === 0} className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md text-base transition-all disabled:opacity-50">
                {resultLoading ? resultLoading : "🏆 Save & Publish Batch Result"}
              </button>
            </div>
          )}

          {resultTab === "manage" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6">
              {manageResult ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h3 className="text-xl font-black text-slate-800">⚙️ Edit Result</h3>
                    <button onClick={() => setManageResult(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-sm hover:bg-slate-300">Close</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Student</p>
                      <p className="text-lg font-black text-slate-800">{manageResult.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Subject &amp; Exam</p>
                      <p className="text-lg font-black text-slate-800">{manageResult.subject_name} <span className="text-sm font-medium text-slate-500">({manageResult.exam_name})</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">CQ</label><input type="number" value={editResultData.cq} onChange={(e) => handleEditResultMarkChange('cq', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">MCQ</label><input type="number" value={editResultData.mcq} onChange={(e) => handleEditResultMarkChange('mcq', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">PR</label><input type="number" value={editResultData.pr} onChange={(e) => handleEditResultMarkChange('pr', e.target.value)} className={inputClass} /></div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Total / {manageResult.full_marks}</label>
                      <input type="text" readOnly value={editResultData.total} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-center text-slate-700 outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleUpdateSingleResult} disabled={isUpdatingResult} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700">{isUpdatingResult ? "Saving..." : "💾 Save Changes"}</button>
                    <button onClick={() => handleDeleteResult(manageResult.id)} className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-colors">🗑️ Delete</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <input type="text" value={resultSearchQuery} onChange={(e) => setResultSearchQuery(e.target.value)} placeholder="🔍 Search by student name, exam or subject..." className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" />
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Student</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Exam Details</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Marks</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Grade</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredResults.map((resItem: any) => (
                          <tr key={resItem.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{resItem.full_name}</div>
                              <div className="text-xs text-slate-500 mt-1">ID: {resItem.student_id} | {resItem.class_name}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-700">{resItem.subject_name}</div>
                              <div className="text-xs text-blue-600 font-medium mt-1">{resItem.exam_name}</div>
                            </td>
                            <td className="p-4 text-center font-black text-slate-700">{resItem.total} <span className="text-xs text-slate-400 font-normal">/ {resItem.full_marks}</span></td>
                            <td className="p-4 text-center"><span className={`px-3 py-1 rounded-md text-xs font-bold ${resItem.grade === 'F' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{resItem.grade}</span></td>
                            <td className="p-4 text-center">
                              <button onClick={() => openManageResultModal(resItem)} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-900 active:scale-95 transition-transform">⚙️ Manage</button>
                            </td>
                          </tr>
                        ))}
                        {filteredResults.length === 0 && <tr><td colSpan={5} className="p-10 text-center font-bold text-slate-400">No results found!</td></tr>}
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
        <div className="animate-fade-in max-w-6xl mx-auto">
          {manageFaculty ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative space-y-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800">⚙️ Manage Faculty</h2>
                  {manageFaculty.username && <p className="text-xs font-bold text-emerald-600 mt-1">Login Username: {manageFaculty.username}</p>}
                </div>
                <button onClick={() => setManageFaculty(null)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-sm rounded-lg">Close</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">Profile Image</h3>
                  {manageFaculty.image ? <img src={manageFaculty.image} alt={manageFaculty.name} className="w-32 h-32 object-cover rounded-full shadow-sm mb-4 border-2 border-white" /> : <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">👨‍🏫</div>}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, handleUpdateFacultyImageAPI)} className="text-xs w-full text-center" />
                </div>

                <div className="lg:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label><input type="text" value={manageFaculty.name} onChange={(e) => setManageFaculty({ ...manageFaculty, name: e.target.value })} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label><input type="text" value={manageFaculty.designation} onChange={(e) => setManageFaculty({ ...manageFaculty, designation: e.target.value })} className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Education</label><input type="text" value={manageFaculty.education} onChange={(e) => setManageFaculty({ ...manageFaculty, education: e.target.value })} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subjects</label><input type="text" value={manageFaculty.subjects} onChange={(e) => setManageFaculty({ ...manageFaculty, subjects: e.target.value })} className={inputClass} /></div>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Experience</label><input type="text" value={manageFaculty.experience} onChange={(e) => setManageFaculty({ ...manageFaculty, experience: e.target.value })} className={inputClass} /></div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100 mt-2">
                    <button onClick={handleUpdateFacultyDetails} disabled={isUpdatingFaculty} className="flex-1 py-3 bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm hover:bg-slate-900">{isUpdatingFaculty ? "Saving..." : "💾 Save Changes"}</button>
                    <button onClick={() => handleDeleteFaculty(manageFaculty.id)} className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors font-bold text-sm rounded-xl">🗑️ Remove</button>
                  </div>
                </div>
              </div>

              {/* CLASS & SUBJECT PERMISSION ASSIGNMENT */}
              <div className="bg-blue-50/60 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-base font-black text-blue-900 mb-4">🔐 Assign Class &amp; Subject Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <select value={assignClass} onChange={(e) => setAssignClass(e.target.value)} className={inputClass}>
                    <option value="">Select Class</option>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)} className={inputClass}>
                    <option value="">Select Subject</option>
                    {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={handleAssignClassSubject}
                    disabled={isAssigning}
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm"
                  >
                    {isAssigning ? "Assigning..." : "+ Assign Access"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {facultyAssignments.length > 0 ? (
                    facultyAssignments.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-sm text-xs font-bold text-slate-800">
                        <span>{a.class_name} • {a.subject_name}</span>
                        <button
                          onClick={() => handleRemoveAssignment(a.id)}
                          className="text-red-500 hover:text-red-700 font-black ml-1"
                          title="Remove Access"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-bold text-slate-500">No class-subject assigned yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-slate-800 mb-6">Faculty Management</h1>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 max-w-4xl">
                <h3 className="text-lg font-black text-slate-700 mb-6 border-b border-slate-100 pb-4">+ Register New Teacher (With Login)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Profile Image</p>
                    {fImage ? <img src={fImage} alt="Preview" className="w-24 h-24 object-cover rounded-full shadow-sm mb-4 border-2 border-white" /> : <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">👨‍🏫</div>}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                      <div>
                        <label className="block text-[11px] font-black text-emerald-800 uppercase mb-1">Login Username *</label>
                        <input type="text" value={fUsername} onChange={(e) => setFUsername(e.target.value)} placeholder="e.g. shohel_sir" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-emerald-800 uppercase mb-1">Initial Password</label>
                        <input type="text" value={fPassword} onChange={(e) => setFPassword(e.target.value)} placeholder="faculty123" className={inputClass} />
                      </div>
                    </div>
                    <button onClick={handleRegisterFaculty} disabled={!!loadingMsg} className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm">{loadingMsg ? loadingMsg : "Register Teacher"}</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {faculties.map((teacher) => (
                  <div key={teacher.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                    <div className="w-full aspect-square bg-slate-50 relative p-4">
                      <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-200" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col bg-white">
                      <h3 className="text-lg font-black text-slate-800 mb-1">{teacher.name}</h3>
                      <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">{teacher.designation}</p>
                      {teacher.username && <p className="text-[11px] font-bold text-emerald-600 mb-3">ID: {teacher.username}</p>}
                      <div className="text-xs text-slate-500 space-y-2 mb-6 font-medium">
                        <p>🎓 {teacher.education}</p>
                        <p>⏳ {teacher.experience}</p>
                        <p>📚 <span className="text-slate-700 font-bold">{teacher.subjects}</span></p>
                      </div>
                      <button
                        onClick={() => { setManageFaculty(teacher); fetchFacultyAssignments(teacher.id); }}
                        className="mt-auto w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                      >
                        ⚙️ Manage &amp; Assign
                      </button>
                    </div>
                  </div>
                ))}
                {faculties.length === 0 && <p className="col-span-full text-center text-slate-400 font-bold p-10 text-sm">No teachers found in the database.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* PAYMENTS SECTION */}
      {activeTab === "payments" && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          <div className="no-print">
            <h1 className="text-2xl font-black text-slate-800 mb-6">Student Payments Management</h1>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
              <h3 className="text-lg font-black text-slate-700 border-b border-slate-100 pb-4 mb-5">+ Record Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Student *</label>
                  <select value={payStudentId} onChange={(e) => setPayStudentId(e.target.value)} className={inputClass}>
                    <option value="">-- Choose Student --</option>
                    {filteredStudentsForPayment.map(std => (
                      <option key={std.student_id} value={std.student_id}>{std.full_name} ({std.class_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Payment Type *</label>
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
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">Select Month *</label>
                    <select value={payMonth} onChange={(e) => setPayMonth(e.target.value)} className={inputClass}>
                      {MONTHS.map(m => <option key={m} value={m}>{m} {currentYear}</option>)}
                    </select>
                  </div>
                )}

                {payType === "Exam Fee" && (
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">Select Exam *</label>
                    <select value={payExamName} onChange={(e) => setPayExamName(e.target.value)} className={inputClass}>
                      <option value="">-- Choose Exam --</option>
                      {EXAM_NAMES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                )}

                {(payType === "Fine" || payType === "Other") && (
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount (৳) *</label>
                  <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Received By *</label>
                  <input type="text" value={payReceivedBy} onChange={(e) => setPayReceivedBy(e.target.value)} placeholder="e.g. Rashedul Sir" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status *</label>
                  <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className={inputClass}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="lg:col-span-3 mt-2">
                  <button type="button" onClick={handleRecordPayment} disabled={!!payLoading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors w-full md:w-auto">
                    {payLoading ? payLoading : "💾 Record Payment"}
                  </button>
                </div>
              </div>
            </div>

            {/* PAYMENT HISTORY TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">All Payment Records ({payments.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Purpose</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Received By</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p: any, idx: number) => (
                      <tr key={p.id || p.payment_id || idx} className="hover:bg-slate-50">
                        <td className="p-4 text-slate-600 font-medium">{p.payment_date?.substring(0, 10)}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{p.full_name}</div>
                          <div className="text-xs text-slate-500">ID: {p.student_id} • {p.class_name}</div>
                        </td>
                        <td className="p-4 font-bold text-slate-700">{p.payment_purpose}</td>
                        <td className="p-4 font-black text-emerald-600">{p.amount} ৳</td>
                        <td className="p-4 font-semibold text-blue-700">{p.received_by || "Admin"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${p.payment_status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="px-3.5 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                          >
                            🖨️ Print Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-bold">No payment records found.</td></tr>
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
              className="fixed inset-0 z-50 bg-black/60 print:bg-white print:static flex items-center justify-center p-4 print:p-0"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-2xl print:rounded-none max-w-lg w-full max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible p-6 shadow-2xl print:shadow-none border-2 border-slate-900"
              >
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="no-print absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 font-black flex items-center justify-center"
                  title="Close"
                >
                  ✕
                </button>

                <div className="flex flex-col items-center text-center border-b-2 border-slate-900 pb-3 mb-4">
                  <img
                    src="/prottoy academy logo.png"
                    alt="Prottoy Academy Logo"
                    className="w-14 h-14 rounded-full object-cover border border-slate-300 mb-2"
                  />
                  <h2 className="text-xl font-black text-emerald-800 leading-tight">প্রত্যয় একাডেমি</h2>
                  <p className="text-xs font-black text-slate-700 tracking-wider uppercase">PROTTOY ACADEMY</p>
                  <p className="text-[11px] font-semibold text-slate-500">ভাবকী বাজার, মেলান্দহ, জামালপুর</p>
                  <span className="inline-block mt-2 px-4 py-0.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-full">
                    Official Money Receipt
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-bold">Receipt No:</span>
                    <span className="font-black">PA-{selectedReceipt.id || selectedReceipt.payment_id || "001"}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-bold">Date:</span>
                    <span className="font-bold">{selectedReceipt.payment_date?.substring(0, 10)}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-bold">Student Name:</span>
                    <span className="font-black">{selectedReceipt.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-bold">Student ID &amp; Class:</span>
                    <span className="font-bold">{selectedReceipt.student_id} ({selectedReceipt.class_name})</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-bold">Purpose:</span>
                    <span className="font-bold text-right">{selectedReceipt.payment_purpose}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-bold">Received By:</span>
                    <span className="font-bold text-blue-700">{selectedReceipt.received_by || "Admin"}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1.5">
                    <span className="text-slate-500 font-bold">Status:</span>
                    <span className="font-black uppercase">{selectedReceipt.payment_status}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-200 mt-2">
                    <span className="font-black text-slate-800">Total Amount:</span>
                    <span className="text-xl font-black text-emerald-700">{selectedReceipt.amount} ৳</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-8 pt-3 text-xs font-bold text-slate-700">
                  <div className="border-t border-slate-900 pt-1 w-36 text-center">Student / Guardian</div>
                  <div className="border-t border-slate-900 pt-1 w-40 text-center">
                    {selectedReceipt.received_by || "Admin"}<br />
                    <span className="text-[10px] font-normal">Authorized Signature</span>
                  </div>
                </div>

                <div className="no-print flex gap-3 mt-5 pt-4 border-t">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm"
                  >
                    🖨️ Print / Save PDF
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-sm"
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
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-[#f4f7fc] text-blue-600 font-bold text-lg animate-pulse">Loading Admin Portal...</div>}>
      <AdminContent />
    </Suspense>
  );
}