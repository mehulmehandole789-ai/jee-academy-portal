import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Providers & Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CoursesPage } from './pages/public/CoursesPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { EnrollmentStatusPage } from './pages/public/EnrollmentStatusPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentTestsPage } from './pages/student/StudentTestsPage';
import { TestTakingPage } from './pages/student/TestTakingPage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { TestResultDetailPage } from './pages/student/TestResultDetailPage';
import { StudentProgressPage } from './pages/student/StudentProgressPage';
import { StudentMaterialsPage } from './pages/student/StudentMaterialsPage';
import { StudentPlannerPage } from './pages/student/StudentPlannerPage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { StudentAnnouncementsPage } from './pages/student/StudentAnnouncementsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherBatchesPage } from './pages/teacher/TeacherBatchesPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { TeacherTestsPage } from './pages/teacher/TeacherTestsPage';
import { TeacherCreateTestPage } from './pages/teacher/TeacherCreateTestPage';
import { TeacherResultsPage } from './pages/teacher/TeacherResultsPage';
import { TeacherMaterialsPage } from './pages/teacher/TeacherMaterialsPage';
import { TeacherFeesPage } from './pages/teacher/TeacherFeesPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEnrollmentsPage } from './pages/admin/AdminEnrollmentsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminBatchesPage } from './pages/admin/AdminBatchesPage';
import { AdminFeesPage } from './pages/admin/AdminFeesPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

export function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Enrollment Gating Screen for Unapproved Students */}
      <Route
        path="/enrollment-status"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <EnrollmentStatusPage />
          </ProtectedRoute>
        }
      />

      {/* Student Protected Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="tests" element={<StudentTestsPage />} />
        <Route path="tests/:id/take" element={<TestTakingPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="results/:testId" element={<TestResultDetailPage />} />
        <Route path="progress" element={<StudentProgressPage />} />
        <Route path="materials" element={<StudentMaterialsPage />} />
        <Route path="planner" element={<StudentPlannerPage />} />
        <Route path="fees" element={<StudentFeesPage />} />
        <Route path="announcements" element={<StudentAnnouncementsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Teacher Protected Portal */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="batches" element={<TeacherBatchesPage />} />
        <Route path="students" element={<TeacherStudentsPage />} />
        <Route path="tests" element={<TeacherTestsPage />} />
        <Route path="tests/create" element={<TeacherCreateTestPage />} />
        <Route path="results/:testId" element={<TeacherResultsPage />} />
        <Route path="materials" element={<TeacherMaterialsPage />} />
        <Route path="fees" element={<TeacherFeesPage />} />
        <Route path="announcements" element={<StudentAnnouncementsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="enrollments" element={<AdminEnrollmentsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="batches" element={<AdminBatchesPage />} />
        <Route path="fees" element={<AdminFeesPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="inquiries" element={<AdminInquiriesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
