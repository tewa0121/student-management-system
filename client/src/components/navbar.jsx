function Navbar() {
  return (
    <nav
      style={{
        height: "70px",
        backgroundColor: "#0d6efd",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      <h3>🎓 Student Management System</h3>

      <div>
        <strong>Welcome, Admin</strong>
      </div>
    </nav>
  );
}

export default Navbar;