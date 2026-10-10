import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Compute a readable page title based on path
  const getPageTitle = (pathname) => {
    if (pathname.includes('/student/dashboard')) return 'Student Dashboard';
    if (pathname.includes('/student/tests')) return 'Tuesday & Saturday Test Series';
    if (pathname.includes('/student/results')) return 'Results & Batch Rankings';
    if (pathname.includes('/student/progress')) return 'Performance Improvement Analytics';
    if (pathname.includes('/student/materials')) return 'PCM Study Materials & DPPs';
    if (pathname.includes('/student/planner')) return 'Daily Study Planner';
    if (pathname.includes('/student/fees')) return 'Fee Accounts & Installments';
    if (pathname.includes('/student/announcements')) return 'Academy & Exam Announcements';
    if (pathname.includes('/student/profile')) return 'Student Profile & Settings';

    if (pathname.includes('/teacher/dashboard')) return 'Faculty Academic Dashboard';
    if (pathname.includes('/teacher/batches')) return 'Assigned Batches';
    if (pathname.includes('/teacher/students')) return 'Batch Student Roster';
    if (pathname.includes('/teacher/tests')) return 'Test Series Management';
    if (pathname.includes('/teacher/materials')) return 'Study Materials Upload';
    if (pathname.includes('/teacher/fees')) return 'Batch Fee Statuses (Read-Only)';
    if (pathname.includes('/teacher/announcements')) return 'Faculty Announcements';
    if (pathname.includes('/teacher/profile')) return 'Faculty Profile';

    if (pathname.includes('/admin/dashboard')) return 'Academy Administration Dashboard';
    if (pathname.includes('/admin/enrollments')) return 'Enrollment Application Review';
    if (pathname.includes('/admin/users')) return 'Student & Faculty User Accounts';
    if (pathname.includes('/admin/courses')) return 'Academic Course Programs';
    if (pathname.includes('/admin/batches')) return 'Classroom Batches & Schedules';
    if (pathname.includes('/admin/fees')) return 'Fee Ledger & Payment Collection';
    if (pathname.includes('/admin/announcements')) return 'Notices & Examination Bulletin';
    if (pathname.includes('/admin/inquiries')) return 'Admissions Contact Inquiries';
    if (pathname.includes('/admin/reports')) return 'Academy-Wide Performance Reports';

    return 'JEE Academy Portal';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
