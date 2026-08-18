import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import AcademicYears from './pages/AcademicYears';
import Terms from './pages/Terms'; 
import Classes from './pages/Classes'; 
import Sections from './pages/Sections';
import Subjects from './pages/Subjects'; // <-- NEW IMPORT

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Debugging: log the current auth state
  console.log('🔒 ProtectedRoute - loading:', loading, 'user:', user);

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    console.warn('🔒 No user, redirecting to login');
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
      {/* NEW Terms route */}
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
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;