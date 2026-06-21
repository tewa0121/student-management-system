import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Teachers from "../pages/Teachers";
import Departments from "../pages/Departments";
import Courses from "../pages/Courses";
import Attendance from "../pages/Attendance";
import Grades from "../pages/Grades";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/grades" element={<Grades />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default AppRoutes;