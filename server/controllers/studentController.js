const db = require("../config/db");

// ==========================
// GET ALL STUDENTS
// ==========================
const getStudents = (req, res) => {

    console.log("✅ getStudents() function called");

    const sql = "SELECT * FROM students";

    db.query(sql, (err, result) => {

        if (err) {
            console.log("❌ Database Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: result
        });

    });

};

// ==========================
// ADD NEW STUDENT
// ==========================
const addStudent = (req, res) => {

    console.log("✅ addStudent() function called");
    console.log("📦 Request Body:", req.body);

    const {
        student_id,
        first_name,
        last_name,
        gender,
        email,
        phone,
        date_of_birth,
        department,
        year_level,
        address
    } = req.body;

    const sql = `
        INSERT INTO students
        (
            student_id,
            first_name,
            last_name,
            gender,
            email,
            phone,
            date_of_birth,
            department,
            year_level,
            address
        )
        VALUES (?,?,?,?,?,?,?,?,?,?)
    `;

    db.query(
        sql,
        [
            student_id,
            first_name,
            last_name,
            gender,
            email,
            phone,
            date_of_birth,
            department,
            year_level,
            address
        ],
        (err, result) => {

            if (err) {

                console.log("❌ Insert Error:", err);

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }

            res.status(201).json({
                success: true,
                message: "Student Added Successfully",
                studentId: result.insertId
            });

        }
    );

};

module.exports = {
    getStudents,
    addStudent
};