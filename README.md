<h1 align="center">🎓 Prottoy Academy Management System (PAMS)</h1>
<h3 align="center">An Integrated Web & Mobile Educational ERP Solution</h3>
<p align="center"><i>Powered by the <b>EduCore</b> Architecture</i></p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 📖 About The Project

The **Prottoy Academy Management System (PAMS)** is a robust, cloud-hosted educational ERP software originally developed to digitize the administrative and academic operations of Prottoy Academy (located in Bhabki Bazar). Built as a full-stack university project (SDP-1), PAMS eliminates manual data entry errors, ensures financial transparency, and bridges the communication gap between the administration and students. 

This project serves as the first real-world implementation of the **EduCore Engine**—a foundational architecture designed to be highly scalable and API-driven.

## ✨ Core Features

- 🧮 **Algorithmic Grading Engine:** Automatically calculates subject-wise GPAs and overall grades, rendering dynamic, print-ready PDF transcripts directly from raw marks input.
- 💰 **Financial Ledger & Automated Receipts:** A real-time administrative dashboard for tracking student fee statuses (Paid/Pending/Partial) with an automated system to generate official PDF money receipts.
- 📢 **Real-Time Notice Board:** A centralized broadcasting module that allows the administration to publish instant academic and administrative alerts directly to the students' digital feeds.
- 📱 **Direct Android APK Distribution:** Features a standalone, downloadable Android App (APK) available directly from the portal for seamless, on-the-go accessibility without requiring Play Store installation.
- 🔒 **Advanced Data Security:** Implements Role-Based Access Control (RBAC) via JWT and utilizes strict multi-tier JSON payload sanitization to prevent API injections.

---

## 🏗️ System Architecture & Modules

The platform is strictly divided into two role-isolated modules:

### 1. Admin / Management Panel
- **Dashboard Analytics:** Visual representation (via Chart.js) of total enrollments, revenue collection, and academic pass rates.
- **Attendance & Results Management:** Digital daily attendance logging and end-to-end CRUD operations for processing exam marks.
- **Financial Auditing:** Comprehensive fee tracking with smart search filters to identify pending dues instantly.

### 2. Student Portal (Web & Mobile)
- **Live Feed & Alerts:** A secure hub displaying institutional announcements and personalized payment reminders.
- **Smart Transcript Viewer:** Dynamic merging of identical exam iterations into composite marksheets, exportable as watermarked PDFs.
- **Payment Ledger:** Real-time visibility of historical tuition fee records and receipt downloads.
- **E-Learning Repository:** Centralized access to recorded class lectures and institutional resources.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Chart.js
- **Mobile Wrapper:** CapacitorJS / Progressive Web App (PWA)
- **Backend:** Next.js Route Handlers (Node.js REST API)
- **Database:** MySQL (Hosted on Aiven Cloud)
- **Authentication:** NextAuth.js / JWT Session Management
- **Deployment:** Vercel Global CDN

---

## 🚀 Future Scope (The EduCore SaaS Vision)

While the current repository reflects the "Prottoy Academy Edition," the underlying **EduCore** engine is architected for massive scalability. Future iterations will include:
- **Multi-Tenant SaaS Conversion:** Transitioning the database schema to support isolated `tenant_ids`, enabling multiple independent institutions to subscribe and operate their own branded portals within the same infrastructure.
- **Automated Communication Gateways:** API integration with services like Twilio for real-time SMS and Email progress reports to parents.

---

## 👨‍💻 Developer & Maintainer

**MD. RASHEDUL ISLAM (Ontor)**  
*Computer Science & Engineering Student @ Brahmaputra International University*  
*Founder & Director @ Prottoy Academy*

[![LinkedIn](https://www.linkedin.com/in/rashedul-ontor/) 
[![GitHub](https://github.com/RashedulOntor)

<br>
<p align="center"><i>"Writing code that makes education smarter and lives easier."</i></p>
