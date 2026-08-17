const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    // --- users table ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(50),
        lastName VARCHAR(50),
        role ENUM('super_admin','admin','principal','teacher','accountant','librarian','student','parent') NOT NULL DEFAULT 'student',
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- students table ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NULL,
        studentId VARCHAR(50) UNIQUE NOT NULL,
        admissionNo VARCHAR(50) UNIQUE NOT NULL,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        middleName VARCHAR(50),
        gender ENUM('Male','Female','Other') NOT NULL,
        dateOfBirth DATE NOT NULL,
        placeOfBirth VARCHAR(100),
        nationality VARCHAR(50),
        bloodGroup VARCHAR(10),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        city VARCHAR(50),
        region VARCHAR(50),
        country VARCHAR(50),
        class VARCHAR(50),
        section VARCHAR(50),
        rollNo VARCHAR(20),
        admissionDate DATE NOT NULL,
        status ENUM('Active','Inactive','Graduated','Transferred','Suspended','Withdrawn','Expelled') DEFAULT 'Active',
        previousSchool VARCHAR(100),
        previousStudentId VARCHAR(50),
        medicalNotes TEXT,
        specialRequirements TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // --- parents table ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NULL,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        relationship ENUM('Father','Mother','Guardian','Other') NOT NULL,
        isEmergency BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // --- student_parents junction table ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_parents (
        studentId INT,
        parentId INT,
        PRIMARY KEY (studentId, parentId),
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (parentId) REFERENCES parents(id) ON DELETE CASCADE
      )
    `);

    // ============ ACADEMIC TABLES ============

    // --- academic_years ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        isActive BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- terms ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS terms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        academicYearId INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        isActive BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE,
        UNIQUE KEY (academicYearId, name)
      )
    `);

    // --- classes ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        capacity INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- sections ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        classId INT NOT NULL,
        name VARCHAR(20) NOT NULL,
        teacherId INT NULL,
        capacity INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY (classId, name)
      )
    `);

    // --- subjects ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        classId INT NULL,
        creditHours INT DEFAULT 0,
        maxMarks INT DEFAULT 100,
        passingMarks INT DEFAULT 40,
        isElective BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL
      )
    `);

    // --- enrollments ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        studentId INT NOT NULL,
        academicYearId INT NOT NULL,
        classId INT NOT NULL,
        sectionId INT NULL,
        enrollmentDate DATE NOT NULL,
        status ENUM('Active','Completed','Dropped','Transferred') DEFAULT 'Active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE SET NULL,
        UNIQUE KEY (studentId, academicYearId, classId)
      )
    `);

    // --- roles & permissions (already existed, but we keep them) ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        roleId INT,
        permissionId INT,
        PRIMARY KEY (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    // ---------------- SEED DATA -----------------

    // 1. Insert default roles
    const roles = [
      { name: 'super_admin', description: 'Full system access' },
      { name: 'admin', description: 'School administrator' },
      { name: 'principal', description: 'Principal / Director' },
      { name: 'teacher', description: 'Teacher' },
      { name: 'accountant', description: 'Accountant' },
      { name: 'librarian', description: 'Librarian' },
      { name: 'student', description: 'Student' },
      { name: 'parent', description: 'Parent/Guardian' },
    ];
    for (const role of roles) {
      await connection.query(
        'INSERT IGNORE INTO roles (name, description) VALUES (?, ?)',
        [role.name, role.description]
      );
    }

    // 2. Insert default permissions (including academics)
    const permissions = [
      // Users
      { name: 'users.view', description: 'View users' },
      { name: 'users.create', description: 'Create users' },
      { name: 'users.update', description: 'Update users' },
      { name: 'users.delete', description: 'Delete users' },
      // Students
      { name: 'students.view', description: 'View students' },
      { name: 'students.create', description: 'Create students' },
      { name: 'students.update', description: 'Update students' },
      { name: 'students.delete', description: 'Delete students' },
      // Academics
      { name: 'academics.view', description: 'View academics (years, terms, classes, etc.)' },
      { name: 'academics.create', description: 'Create academic entities' },
      { name: 'academics.update', description: 'Update academic entities' },
      { name: 'academics.delete', description: 'Delete academic entities' },
      // Attendance
      { name: 'attendance.view', description: 'View attendance' },
      { name: 'attendance.create', description: 'Mark attendance' },
      { name: 'attendance.update', description: 'Edit attendance' },
      // Grades
      { name: 'grades.view', description: 'View grades' },
      { name: 'grades.create', description: 'Enter grades' },
      { name: 'grades.update', description: 'Edit grades' },
      { name: 'grades.publish', description: 'Publish grades' },
      // Fees
      { name: 'fees.view', description: 'View fees' },
      { name: 'fees.create', description: 'Create fees' },
      { name: 'fees.update', description: 'Update fees' },
      { name: 'payments.create', description: 'Record payments' },
      { name: 'payments.refund', description: 'Process refunds' },
    ];
    for (const perm of permissions) {
      await connection.query(
        'INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)',
        [perm.name, perm.description]
      );
    }

    // 3. Assign ALL permissions to super_admin and admin
    const [superAdminRole] = await connection.query("SELECT id FROM roles WHERE name = 'super_admin'");
    const [adminRole] = await connection.query("SELECT id FROM roles WHERE name = 'admin'");
    const [allPerms] = await connection.query('SELECT id FROM permissions');

    if (superAdminRole.length > 0 && allPerms.length > 0) {
      for (const perm of allPerms) {
        await connection.query(
          'INSERT IGNORE INTO role_permissions (roleId, permissionId) VALUES (?, ?)',
          [superAdminRole[0].id, perm.id]
        );
      }
    }
    if (adminRole.length > 0 && allPerms.length > 0) {
      for (const perm of allPerms) {
        await connection.query(
          'INSERT IGNORE INTO role_permissions (roleId, permissionId) VALUES (?, ?)',
          [adminRole[0].id, perm.id]
        );
      }
    }

    // 4. Create default super_admin user if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (email, password, firstName, lastName, role, isActive)
      VALUES ('admin@school.com', ?, 'Admin', 'User', 'super_admin', TRUE)
    `, [hashedPassword]);

    console.log('✅ Database and tables initialized with seed data (including academics).');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, initDatabase };