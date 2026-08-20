const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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

    // --- teachers table (extends users) ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL UNIQUE,
        employeeId VARCHAR(50) UNIQUE,
        qualification VARCHAR(255),
        specialization VARCHAR(255),
        hireDate DATE,
        employmentType ENUM('Full-time','Part-time','Contract','Intern') DEFAULT 'Full-time',
        department VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
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

    // --- attendance table ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        studentId INT NOT NULL,
        classId INT NOT NULL,
        sectionId INT NULL,
        date DATE NOT NULL,
        status ENUM('Present','Absent','Late','Excused','Half-day') NOT NULL,
        note TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE SET NULL,
        UNIQUE KEY (studentId, classId, sectionId, date)
      )
    `);

    // ============ EXAM & GRADING TABLES ============

    // --- grade_scale ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grade_scale (
        id INT PRIMARY KEY AUTO_INCREMENT,
        grade VARCHAR(5) NOT NULL UNIQUE,
        minMarks INT NOT NULL,
        maxMarks INT NOT NULL,
        gpa DECIMAL(3,2) NOT NULL,
        description VARCHAR(100)
      )
    `);

    // --- exam_types ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exam_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(100)
      )
    `);

    // --- exams ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        examTypeId INT NOT NULL,
        classId INT NOT NULL,
        subjectId INT NOT NULL,
        name VARCHAR(100),
        date DATE NOT NULL,
        maxMarks INT NOT NULL DEFAULT 100,
        passingMarks INT DEFAULT 40,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (examTypeId) REFERENCES exam_types(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);

    // --- exam_results ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        examId INT NOT NULL,
        studentId INT NOT NULL,
        marksObtained DECIMAL(5,2) NOT NULL,
        grade VARCHAR(5),
        gpa DECIMAL(3,2),
        remarks TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY (examId, studentId)
      )
    `);

    // ============ FEES & PAYMENTS TABLES ============

    // --- fee_categories ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fee_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- fee_structures ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fee_structures (
        id INT PRIMARY KEY AUTO_INCREMENT,
        academicYearId INT NOT NULL,
        classId INT NOT NULL,
        categoryId INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        isOptional BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES fee_categories(id) ON DELETE CASCADE
      )
    `);

    // --- invoices ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
        studentId INT NOT NULL,
        academicYearId INT NOT NULL,
        issueDate DATE NOT NULL,
        dueDate DATE NOT NULL,
        totalAmount DECIMAL(10,2) NOT NULL,
        discountAmount DECIMAL(10,2) DEFAULT 0,
        scholarshipAmount DECIMAL(10,2) DEFAULT 0,
        netAmount DECIMAL(10,2) NOT NULL,
        paidAmount DECIMAL(10,2) DEFAULT 0,
        balance DECIMAL(10,2) NOT NULL,
        status ENUM('Draft','Unpaid','Partially Paid','Paid','Overdue','Cancelled') DEFAULT 'Unpaid',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE
      )
    `);

    // --- invoice_items ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoiceId INT NOT NULL,
        feeStructureId INT NOT NULL,
        description VARCHAR(255),
        quantity INT DEFAULT 1,
        unitPrice DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (feeStructureId) REFERENCES fee_structures(id) ON DELETE CASCADE
      )
    `);

    // --- payments ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        receiptNumber VARCHAR(50) NOT NULL UNIQUE,
        invoiceId INT NOT NULL,
        studentId INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paymentDate DATE NOT NULL,
        method ENUM('Cash','Bank Transfer','Card','Mobile Payment','Other') NOT NULL,
        referenceNumber VARCHAR(100),
        receivedBy INT NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (receivedBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // --- discounts_applied ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS discounts_applied (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoiceId INT NOT NULL,
        discountType VARCHAR(50),
        amount DECIMAL(10,2),
        description VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);

    // ============ TIMETABLE TABLE ============
    await connection.query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INT PRIMARY KEY AUTO_INCREMENT,
        classId INT NOT NULL,
        sectionId INT NULL,
        academicYearId INT NOT NULL,
        termId INT NULL,
        dayOfWeek ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        subjectId INT NOT NULL,
        teacherId INT NOT NULL,
        room VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE,
        FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (termId) REFERENCES terms(id) ON DELETE SET NULL,
        FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_slot (classId, sectionId, dayOfWeek, startTime, endTime, academicYearId)
      )
    `);

    // --- assignments ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        classId INT NOT NULL,
        subjectId INT NOT NULL,
        teacherId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline DATETIME NOT NULL,
        maxScore DECIMAL(5,2) DEFAULT 100,
        attachments TEXT,
        status ENUM('draft','published','closed') DEFAULT 'draft',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // --- assignment_submissions ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignmentId INT NOT NULL,
        studentId INT NOT NULL,
        submissionText TEXT,
        attachment VARCHAR(255),
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        grade DECIMAL(5,2) DEFAULT NULL,
        feedback TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY (assignmentId, studentId)
      )
    `);

    // ============ LIBRARY TABLES ============

    // --- library_categories ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS library_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- library_authors ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS library_authors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        biography TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- library_publishers ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS library_publishers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- library_books ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS library_books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        isbn VARCHAR(20) UNIQUE,
        title VARCHAR(255) NOT NULL,
        authorId INT NOT NULL,
        categoryId INT NOT NULL,
        publisherId INT NULL,
        publicationYear YEAR,
        edition VARCHAR(20),
        pages INT,
        description TEXT,
        shelfLocation VARCHAR(50),
        totalCopies INT DEFAULT 1,
        availableCopies INT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES library_authors(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES library_categories(id) ON DELETE CASCADE,
        FOREIGN KEY (publisherId) REFERENCES library_publishers(id) ON DELETE SET NULL
      )
    `);

    // --- library_copies ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS library_copies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bookId INT NOT NULL,
        copyNumber VARCHAR(20) NOT NULL,
        status ENUM('Available','Issued','Reserved','Lost','Damaged') DEFAULT 'Available',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES library_books(id) ON DELETE CASCADE,
        UNIQUE KEY (bookId, copyNumber)
      )
    `);

    // --- library_transactions ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS library_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        copyId INT NOT NULL,
        studentId INT NOT NULL,
        issueDate DATE NOT NULL,
        dueDate DATE NOT NULL,
        returnDate DATE NULL,
        status ENUM('Issued','Returned','Overdue','Lost') DEFAULT 'Issued',
        fine DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (copyId) REFERENCES library_copies(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    // ============ ANNOUNCEMENTS & NOTIFICATIONS TABLES ============

    // --- announcements ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('normal','important','urgent') DEFAULT 'normal',
        audience ENUM('everyone','teachers','students','parents','staff','specific') DEFAULT 'everyone',
        classId INT NULL,
        sectionId INT NULL,
        publishDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        expirationDate DATETIME NULL,
        attachment VARCHAR(255) NULL,
        createdBy INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE SET NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // --- notifications ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        type ENUM('announcement','assignment','exam','fee','attendance','event','system') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255) NULL,
        isRead BOOLEAN DEFAULT FALSE,
        relatedId INT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // --- notification_preferences ---
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL UNIQUE,
        emailEnabled BOOLEAN DEFAULT TRUE,
        smsEnabled BOOLEAN DEFAULT FALSE,
        pushEnabled BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ============ SYSTEM SETTINGS ============
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        settingKey VARCHAR(100) NOT NULL UNIQUE,
        settingValue TEXT,
        settingType ENUM('string','number','boolean','json','image') DEFAULT 'string',
        description VARCHAR(255),
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- roles & permissions ---
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

    // 2. Insert default permissions (including announcements and settings)
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
      // Academics (also covers library)
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
      // Announcements
      { name: 'announcements.view', description: 'View announcements' },
      { name: 'announcements.create', description: 'Create announcements' },
      { name: 'announcements.update', description: 'Update announcements' },
      { name: 'announcements.delete', description: 'Delete announcements' },
      // Settings
      { name: 'settings.view', description: 'View system settings' },
      { name: 'settings.update', description: 'Update system settings' },
    ];
    for (const perm of permissions) {
      await connection.query(
        'INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)',
        [perm.name, perm.description]
      );
    }

    // --- Insert default grade scale ---
    const gradeScale = [
      { grade: 'A+', min: 90, max: 100, gpa: 4.0 },
      { grade: 'A',  min: 80, max: 89, gpa: 3.7 },
      { grade: 'A-', min: 75, max: 79, gpa: 3.3 },
      { grade: 'B+', min: 70, max: 74, gpa: 3.0 },
      { grade: 'B',  min: 65, max: 69, gpa: 2.7 },
      { grade: 'B-', min: 60, max: 64, gpa: 2.3 },
      { grade: 'C+', min: 55, max: 59, gpa: 2.0 },
      { grade: 'C',  min: 50, max: 54, gpa: 1.7 },
      { grade: 'C-', min: 45, max: 49, gpa: 1.3 },
      { grade: 'D',  min: 40, max: 44, gpa: 1.0 },
      { grade: 'F',  min: 0,  max: 39, gpa: 0.0 },
    ];
    for (const g of gradeScale) {
      await connection.query(
        `INSERT IGNORE INTO grade_scale (grade, minMarks, maxMarks, gpa) VALUES (?, ?, ?, ?)`,
        [g.grade, g.min, g.max, g.gpa]
      );
    }

    // --- Insert default exam types ---
    const examTypes = ['Midterm', 'Final', 'Quiz', 'Monthly Test', 'Mock Exam'];
    for (const type of examTypes) {
      await connection.query(
        `INSERT IGNORE INTO exam_types (name) VALUES (?)`,
        [type]
      );
    }

    // --- Insert default fee categories ---
    const feeCategories = ['Tuition', 'Registration', 'Examination', 'Library', 'Transport', 'Laboratory', 'Uniform', 'Other'];
    for (const cat of feeCategories) {
      await connection.query(
        `INSERT IGNORE INTO fee_categories (name) VALUES (?)`,
        [cat]
      );
    }

    // --- Insert default system settings ---
    const defaultSettings = [
      { key: 'school_name', value: 'My School', type: 'string', description: 'School name' },
      { key: 'school_address', value: '123 Main St, City', type: 'string', description: 'School address' },
      { key: 'school_phone', value: '+1234567890', type: 'string', description: 'School phone number' },
      { key: 'school_email', value: 'info@school.com', type: 'string', description: 'School email' },
      { key: 'school_logo', value: '', type: 'image', description: 'School logo URL' },
      { key: 'currency', value: 'USD', type: 'string', description: 'Currency symbol' },
      { key: 'timezone', value: 'UTC', type: 'string', description: 'Timezone' },
      { key: 'grading_system', value: '{"A+":90,"A":80,"B":70,"C":60,"D":50,"F":0}', type: 'json', description: 'Grading scale' },
    ];
    for (const s of defaultSettings) {
      await connection.query(
        `INSERT IGNORE INTO system_settings (settingKey, settingValue, settingType, description) VALUES (?, ?, ?, ?)`,
        [s.key, s.value, s.type, s.description]
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

    console.log('✅ Database and tables initialized with seed data (including academics, attendance, exams/grading, fees/payments, timetable, assignments, library, announcements/notifications, and system settings).');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, initDatabase };