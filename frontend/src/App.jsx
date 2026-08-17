import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
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
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;