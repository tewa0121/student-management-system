import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuStyle = {
    display: "block",
    color: "white",
    textDecoration: "none",
    padding: "10px",
    marginBottom: "5px",
    borderRadius: "5px",
  };

  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#343a40",
        color: "white",
        padding: "20px",
      }}
    >
      <h3>SMS</h3>

      <hr />

      <NavLink
        to="/"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        🏠 Dashboard
      </NavLink>

      <NavLink
        to="/students"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        🎓 Students
      </NavLink>

      <NavLink
        to="/teachers"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        👨‍🏫 Teachers
      </NavLink>

      <NavLink
        to="/departments"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        🏢 Departments
      </NavLink>

      <NavLink
        to="/courses"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        📚 Courses
      </NavLink>

      <NavLink
        to="/attendance"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        📅 Attendance
      </NavLink>

      <NavLink
        to="/grades"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        📝 Grades
      </NavLink>

      <NavLink
        to="/reports"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        📊 Reports
      </NavLink>

      <NavLink
        to="/settings"
        style={({ isActive }) => ({
          ...menuStyle,
          backgroundColor: isActive ? "#0d6efd" : "transparent",
        })}
      >
        ⚙ Settings
      </NavLink>
    </div>
  );
}

export default Sidebar;