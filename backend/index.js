require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "hall_management",
});

db.connect((err) => {
  console.log("Connected to MySQL Database");
});

// --- AUTH ROUTES ---
app.post("/register", (req, res) => {
  const { username, password, role } = req.body;
  db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, role || "student"],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Username may already exist." });
      res.json({ message: "Registration successful" });
    },
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) res.json(results[0]);
      else res.status(401).json({ error: "Invalid credentials" });
    },
  );
});

// --- STUDENT ROUTES ---
app.post("/apply", (req, res) => {
  const {
    user_id,
    student_id,
    edu_email,
    full_name,
    department,
    semester,
    mobile_number,
    blood_group,
  } = req.body;
  db.query(
    `INSERT INTO applications (user_id, student_id, edu_email, full_name, department, semester, mobile_number, blood_group) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      student_id,
      edu_email,
      full_name,
      department,
      semester,
      mobile_number,
      blood_group,
    ],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "Application submitted successfully" });
    },
  );
});

app.get("/profile/:userId", (req, res) => {
  const query = `
        SELECT a.*, s.room_number, s.hall_name 
        FROM applications a 
        LEFT JOIN students s ON a.id = s.application_id 
        WHERE a.user_id = ? ORDER BY a.id DESC LIMIT 1`;
  db.query(query, [req.params.userId], (err, results) => {
    if (err) throw err;
    res.json(results[0] || null);
  });
});

app.post("/complain", (req, res) => {
  const { user_id, complaint_text } = req.body;
  db.query(
    "INSERT INTO complaints (user_id, complaint_text) VALUES (?, ?)",
    [user_id, complaint_text],
    (err) => {
      if (err) throw err;
      res.json({ message: "Complaint registered" });
    },
  );
});

app.get("/complaints/:userId", (req, res) => {
  db.query(
    "SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC",
    [req.params.userId],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    },
  );
});

// --- ADMIN ROUTES ---
app.get("/admin/applications", (req, res) => {
  db.query(
    "SELECT * FROM applications WHERE status = 'pending'",
    (err, results) => {
      if (err) throw err;
      res.json(results);
    },
  );
});

app.post("/admin/approve", (req, res) => {
  const { application_id, user_id } = req.body;
  // Generate Room: 1-1000, A or B
  const roomNum = Math.floor(Math.random() * 1000) + 1;
  const block = Math.random() > 0.5 ? "A" : "B";
  const roomString = `${roomNum}-${block}`;

  db.query(
    "UPDATE applications SET status = 'approved' WHERE id = ?",
    [application_id],
    (err) => {
      if (err) throw err;
      db.query(
        "INSERT INTO students (user_id, application_id, room_number) VALUES (?, ?, ?)",
        [user_id, application_id, roomString],
        (err2) => {
          if (err2) throw err2;
          res.json({ message: "Approved and allocated room " + roomString });
        },
      );
    },
  );
});

app.post("/admin/reject", (req, res) => {
  db.query(
    "UPDATE applications SET status = 'rejected' WHERE id = ?",
    [req.body.application_id],
    (err) => {
      if (err) throw err;
      res.json({ message: "Application rejected" });
    },
  );
});

app.get("/admin/students", (req, res) => {
  const query = `
        SELECT s.id as allocation_id, a.full_name, a.student_id, a.department, s.room_number, s.hall_name 
        FROM students s JOIN applications a ON s.application_id = a.id`;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post("/admin/deallocate", (req, res) => {
  const allocationId = req.body.allocation_id;

  // Step 1: Find the application_id associated with this room allocation
  db.query(
    "SELECT application_id FROM students WHERE id = ?", 
    [allocationId], 
    (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).json({ error: "Allocation not found" });
      }

      const appId = results[0].application_id;

      // Step 2: Delete the student record to free up the physical room
      db.query(
        "DELETE FROM students WHERE id = ?", 
        [allocationId], 
        (err) => {
          if (err) throw err;

          // Step 3: Update the application status to 'Cancelled'
          db.query(
            "UPDATE applications SET status = 'Cancelled' WHERE id = ?", 
            [appId], 
            (err) => {
              if (err) throw err;
              res.json({ message: "Student deallocated and application status updated to Cancelled" });
            }
          );
        }
      );
    }
  );
});

app.get("/admin/complaints", (req, res) => {
  const query = `SELECT c.*, u.username FROM complaints c JOIN users u ON c.user_id = u.id ORDER BY created_at DESC`;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
