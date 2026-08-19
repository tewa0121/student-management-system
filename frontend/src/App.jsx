import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/common/Navbar';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import AcademicYears from './pages/AcademicYears';
import Terms from './pages/Terms';
import Classes from './pages/Classes';
import Sections from './pages/Sections';
import Subjects from './pages/Subjects';
import Enrollments from './pages/Enrollments';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import FeeStructures from './pages/FeeStructures';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import LibraryBooks from './pages/LibraryBooks';
import LibraryTransactions from './pages/LibraryTransactions';
import LibraryCategories from './pages/LibraryCategories';
import LibraryAuthors from './pages/LibraryAuthors';
import LibraryPublishers from './pages/LibraryPublishers';
import Announcements from './pages/Announcements';
import Notifications from './pages/Notifications';
import Teachers from './pages/Teachers';
import ExamMarks from './pages/ExamMarks';
import ReportCard from './pages/ReportCard';
import ParentDashboard from './pages/ParentDashboard';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes with Navbar */}
      <Route path="/dashboard" element={
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      } />

      <Route path="/users" element={
        <ProtectedLayout>
          <Users />
        </ProtectedLayout>
      } />
      <Route path="/users/new" element={
        <ProtectedLayout>
          <UserForm />
        </ProtectedLayout>
      } />
      <Route path="/users/:id/edit" element={
        <ProtectedLayout>
          <UserForm />
        </ProtectedLayout>
      } />

      <Route path="/students" element={
        <ProtectedLayout>
          <Students />
        </ProtectedLayout>
      } />
      <Route path="/students/new" element={
        <ProtectedLayout>
          <StudentForm />
        </ProtectedLayout>
      } />
      <Route path="/students/:id/edit" element={
        <ProtectedLayout>
          <StudentForm />
        </ProtectedLayout>
      } />

      <Route path="/academic-years" element={
        <ProtectedLayout>
          <AcademicYears />
        </ProtectedLayout>
      } />
      <Route path="/terms" element={
        <ProtectedLayout>
          <Terms />
        </ProtectedLayout>
      } />
      <Route path="/classes" element={
        <ProtectedLayout>
          <Classes />
        </ProtectedLayout>
      } />
      <Route path="/sections" element={
        <ProtectedLayout>
          <Sections />
        </ProtectedLayout>
      } />
      <Route path="/subjects" element={
        <ProtectedLayout>
          <Subjects />
        </ProtectedLayout>
      } />
      <Route path="/enrollments" element={
        <ProtectedLayout>
          <Enrollments />
        </ProtectedLayout>
      } />
      <Route path="/attendance" element={
        <ProtectedLayout>
          <Attendance />
        </ProtectedLayout>
      } />
      <Route path="/exams" element={
        <ProtectedLayout>
          <Exams />
        </ProtectedLayout>
      } />
      <Route path="/fee-structures" element={
        <ProtectedLayout>
          <FeeStructures />
        </ProtectedLayout>
      } />
      <Route path="/invoices" element={
        <ProtectedLayout>
          <Invoices />
        </ProtectedLayout>
      } />
      <Route path="/payments" element={
        <ProtectedLayout>
          <Payments />
        </ProtectedLayout>
      } />
      <Route path="/timetable" element={
        <ProtectedLayout>
          <Timetable />
        </ProtectedLayout>
      } />
      <Route path="/assignments" element={
        <ProtectedLayout>
          <Assignments />
        </ProtectedLayout>
      } />

      {/* Library Routes */}
      <Route path="/library/books" element={
        <ProtectedLayout>
          <LibraryBooks />
        </ProtectedLayout>
      } />
      <Route path="/library/transactions" element={
        <ProtectedLayout>
          <LibraryTransactions />
        </ProtectedLayout>
      } />
      <Route path="/library/categories" element={
        <ProtectedLayout>
          <LibraryCategories />
        </ProtectedLayout>
      } />
      <Route path="/library/authors" element={
        <ProtectedLayout>
          <LibraryAuthors />
        </ProtectedLayout>
      } />
      <Route path="/library/publishers" element={
        <ProtectedLayout>
          <LibraryPublishers />
        </ProtectedLayout>
      } />

      {/* Announcements & Notifications */}
      <Route path="/announcements" element={
        <ProtectedLayout>
          <Announcements />
        </ProtectedLayout>
      } />
      <Route path="/notifications" element={
        <ProtectedLayout>
          <Notifications />
        </ProtectedLayout>
      } />

      {/* Teachers */}
      <Route path="/teachers" element={
        <ProtectedLayout>
          <Teachers />
        </ProtectedLayout>
      } />
      <Route path="/exam-marks" element={
  <ProtectedLayout>
    <ExamMarks />
  </ProtectedLayout>
} />

<Route path="/report-card" element={
  <ProtectedLayout>
    <ReportCard />
  </ProtectedLayout>
} />
<Route path="/parent-dashboard" element={
  <ProtectedLayout>
    <ParentDashboard />
  </ProtectedLayout>
} />

      {/* Redirects */}
      <Route path="/fees" element={<Navigate to="/fee-structures" />} />

      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;