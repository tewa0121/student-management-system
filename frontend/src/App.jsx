import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/users/new" element={
        <ProtectedRoute>
          <UserForm />
        </ProtectedRoute>
      } />

      <Route path="/students" element={
        <ProtectedRoute>
          <Students />
        </ProtectedRoute>
      } />
      <Route path="/students/new" element={
        <ProtectedRoute>
          <StudentForm />
        </ProtectedRoute>
      } />
      <Route path="/students/:id/edit" element={
        <ProtectedRoute>
          <StudentForm />
        </ProtectedRoute>
      } />

      <Route path="/academic-years" element={
        <ProtectedRoute>
          <AcademicYears />
        </ProtectedRoute>
      } />
      <Route path="/terms" element={
        <ProtectedRoute>
          <Terms />
        </ProtectedRoute>
      } />
      <Route path="/classes" element={
        <ProtectedRoute>
          <Classes />
        </ProtectedRoute>
      } />
      <Route path="/sections" element={
        <ProtectedRoute>
          <Sections />
        </ProtectedRoute>
      } />
      <Route path="/subjects" element={
        <ProtectedRoute>
          <Subjects />
        </ProtectedRoute>
      } />
      <Route path="/enrollments" element={
        <ProtectedRoute>
          <Enrollments />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <Attendance />
        </ProtectedRoute>
      } />
      <Route path="/exams" element={
        <ProtectedRoute>
          <Exams />
        </ProtectedRoute>
      } />
      <Route path="/fee-structures" element={
        <ProtectedRoute>
          <FeeStructures />
        </ProtectedRoute>
      } />
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Invoices />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      } />
      <Route path="/timetable" element={
        <ProtectedRoute>
          <Timetable />
        </ProtectedRoute>
      } />
      <Route path="/assignments" element={
        <ProtectedRoute>
          <Assignments />
        </ProtectedRoute>
      } />

      {/* Library Routes */}
      <Route path="/library/books" element={
        <ProtectedRoute>
          <LibraryBooks />
        </ProtectedRoute>
      } />
      <Route path="/library/transactions" element={
        <ProtectedRoute>
          <LibraryTransactions />
        </ProtectedRoute>
      } />
      <Route path="/library/categories" element={
        <ProtectedRoute>
          <LibraryCategories />
        </ProtectedRoute>
      } />
      <Route path="/library/authors" element={
        <ProtectedRoute>
          <LibraryAuthors />
        </ProtectedRoute>
      } />
      <Route path="/library/publishers" element={
        <ProtectedRoute>
          <LibraryPublishers />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;