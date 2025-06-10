const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));
const JWT_SECRET = "your_jwt_secret_key";

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Atha7138",
  database: "project1",
  multipleStatements: true,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get("/", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  const email = req.body.username; // Ensure this matches your form's input name
  const password = req.body.password;
  const role = req.body.role;
  const studentFName = req.body.studentFName;
  const studentLName = req.body.studentLName;
  const facultyFName = req.body.facultyFName;
  const facultyLName = req.body.facultyLName;

  console.log(req.body); // Debugging the request body

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error hashing password");
    }

    const sql = "INSERT INTO users(email, password, role) VALUES(?, ?, ?)";
    con.query(sql, [email, hashedPassword, role], function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send("Error inserting into database");
      }
      console.log("1 record inserted");
      res.render("login"); // Move this inside the query callback
    });
  });
});

app.get("/faculty", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;
    const query = "SELECT role FROM users WHERE email =?";
    con.query(query, [email], (err, result) => {
      if (err) {
        return console.log(err);
      }
      if (result[0].role === "Faculty") {
      } else {
        return res.render("error", {
          message: "Unauthorized login : Not a faculty",
        });
      }
    });

    const checkQuery = "SELECT department_id FROM instructor WHERE email = ?";
    con.query(checkQuery, [email], (err, result) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      if (result.length === 0) {
        const insertQuery = "INSERT INTO instructor (email) VALUES (?)";
        con.query(insertQuery, [email], (err, result) => {
          if (err) {
            return res
              .status(500)
              .render("error", { message: "Failed to insert faculty" });
          }
          console.log("Faculty added");
          const recheckQuery =
            "SELECT department_id FROM instructor WHERE email = ?";
          con.query(recheckQuery, [email], (err, result) => {
            if (err) {
              return res
                .status(500)
                .render("error", { message: "Database query failed" });
            }

            if (result.length === 0 || result[0].department_id === null) {
              return res.render("addFacultyInfo", { email: email });
            }

            return res.render("faculty", { email: email });
          });
        });
      } else {
        if (result[0].department_id === null) {
          return res.render("addFacultyInfo", { email: email });
        }

        return res.render("faculty", { email: email });
      }
    });
  });
});

app.post("/faculty", (req, res) => {
  const email = req.body.email;
  const department = req.body.department;
  const fName = req.body.f_name;
  const lName = req.body.l_name;
  console.log(req.body.department);

  const query =
    "UPDATE instructor SET department_id = ?, first_name = ?, last_name = ? WHERE email = ?";
  con.query(query, [department, fName, lName, email], (err, result) => {
    if (err) {
      return console.log(err);
    }
  });
  res.render("faculty", { email: email });
});

app.get("/student", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    const query = "SELECT role FROM users WHERE email =?";
    con.query(query, [email], (err, result) => {
      if (err) {
        return console.log(err);
      }
      if (result[0].role === "Student") {
      } else {
        return res.send({ message: "Unauthorized login : Not a student" });
      }
    });

    const checkQuery =
      "SELECT first_name, last_name FROM student WHERE email = ?";
    con.query(checkQuery, [email], (err, result) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      if (result.length === 0) {
        const insertQuery = "INSERT INTO student (email) VALUES (?)";
        con.query(insertQuery, [email], (err, result) => {
          if (err) {
            return res
              .status(500)
              .render("error", { message: "Failed to insert student" });
          }
          console.log("Student added");
          const recheckQuery =
            "SELECT first_name, last_name FROM student WHERE email = ?";
          con.query(recheckQuery, [email], (err, result) => {
            if (err) {
              return res
                .status(500)
                .render("error", { message: "Database query failed" });
            }

            if (
              result.length === 0 ||
              result[0].first_name === null ||
              result[0].last_name === null
            ) {
              return res.render("addStudentInfo", { email: email });
            }

            return res.render("student", { email: email });
          });
        });
      } else {
        if (result[0].first_name === null || result[0].last_name === null) {
          return res.render("addStudentInfo", { email: email });
        }

        return res.render("student", { email: email });
      }
    });
  });
});

app.post("/student", (req, res) => {
  const email = req.body.email;
  const fName = req.body.f_name;
  const lName = req.body.l_name;

  const query =
    "UPDATE student SET first_name = ?, last_name = ? WHERE email = ?";
  con.query(query, [fName, lName, email], (err, result) => {
    if (err) {
      return console.log(err);
    }
  });
  res.render("student", { email: email });
});

app.get("/marks", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    const enrolledCoursesQuery = `
      SELECT c.course_id, c.course_name
      FROM student_courses sc
      JOIN course c ON sc.course_id = c.course_id
      WHERE sc.email = ?;
    `;

    con.query(enrolledCoursesQuery, [email], (err, enrolledCourses) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      const marksQuery = `
        SELECT c.course_name, m.marks_obtained
        FROM Marks m
        JOIN Course c ON m.course_id = c.course_id
        WHERE m.student_email = ? AND m.course_id IN (?);
      `;

      const courseIds = enrolledCourses.map((course) => course.course_id);
      con.query(marksQuery, [email, courseIds], (err, marks) => {
        if (err) {
          return res
            .status(500)
            .render("error", { message: "Database query failed" });
        }

        res.render("marks", { marks });
      });
    });
  });
});

app.get("/examSchedule", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const examSchedule = [
      {
        course_name: "Introduction to Computer Science",
        exam_date: "2024-10-01",
        exam_time: "09:00 AM",
      },
      {
        course_name: "Data Structures",
        exam_date: "2024-10-05",
        exam_time: "01:00 PM",
      },
      {
        course_name: "Database Systems",
        exam_date: "2024-10-10",
        exam_time: "11:00 AM",
      },
      {
        course_name: "Web Development",
        exam_date: "2024-10-15",
        exam_time: "02:00 PM",
      },
    ];

    res.render("examSchedule", { exams: examSchedule });
  });
});

app.get("/facultyMarks", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    const getCoursesQuery =
      "SELECT course_id FROM instructor_courses WHERE instructor_email = ?";
    con.query(getCoursesQuery, [email], (err, courses) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      const courseIds = courses.map((course) => course.course_id);

      if (courseIds.length === 0) {
        return res.render("facultyMarks", { students: [] });
      }

      const getStudentsQuery = `
        SELECT sc.email AS student_email, c.course_name,c.course_id, m.marks_obtained
        FROM student_courses sc
        JOIN Course c ON sc.course_id = c.course_id
        LEFT JOIN Marks m ON sc.email = m.student_email AND sc.course_id = m.course_id
        WHERE sc.course_id IN (?);
      `;

      con.query(getStudentsQuery, [courseIds], (err, students) => {
        if (err) {
          return res
            .status(500)
            .render("error", { message: "Database query failed" });
        }
        res.render("facultyMarks", { students });
      });
    });
  });
});

app.post("/updateMarks", (req, res) => {
  const student_email = req.body.student_email;
  const course_id = req.body.course_id;
  const marks_obtained = req.body.marks_obtained;
  console.log(req.body);

  const updateMarksQuery = `
    INSERT INTO Marks (student_email, course_id, marks_obtained)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE marks_obtained = ?;
  `;

  con.query(
    updateMarksQuery,
    [student_email, course_id, marks_obtained, marks_obtained],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.redirect("/facultyMarks");
    }
  );
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM users WHERE email = ?";

  con.query(query, [username], (err, rows) => {
    if (err)
      return res
        .status(500)
        .render("error", { message: "Internal Server Error" });
    if (rows.length === 0)
      return res
        .status(401)
        .render("error", { message: "Invalid username or password" });

    const hashedPassword = rows[0].password;
    if (bcrypt.compareSync(password, hashedPassword)) {
      const user = { id: rows[0].id, email: rows[0].email, role: rows[0].role };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

      console.log(rows[0].role);

      if (rows[0].role === "Student") {
        res.redirect("/student");
      } else if (rows[0].role === "Faculty") {
        res.redirect("/faculty");
      } else {
        res.redirect("/admin");
      }
    } else {
      res
        .status(401)
        .render("error", { message: "Invalid username or password" });
    }
  });
});

app.post("/updateMarks", (req, res) => {
  const student_email = req.body.student_email;
  const course_id = req.body.course_id;
  const marks_obtained = req.body.marks_obtained;
  console.log(req.body);

  const updateMarksQuery = `
    INSERT INTO Marks (student_email, course_id, marks_obtained)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE marks_obtained = ?;
  `;

  con.query(
    updateMarksQuery,
    [student_email, course_id, marks_obtained, marks_obtained],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.redirect("/facultyMarks");
    }
  );
});

app.get("/enrollCoursesFaculty", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    // Get available courses
    const coursesQuery = "SELECT course_id, course_name FROM course";
    con.query(coursesQuery, (err, courses) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      // Render the faculty course enrollment page
      res.render("enrollCoursesFaculty", { email, courses });
    });
  });
});

app.post("/enrollCoursesFaculty", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;
    const courseId = req.body.course; // Single selected course ID

    if (!courseId) {
      return res.status(400).render("error", { message: "No course selected" });
    }

    // Insert instructor's course assignment into the database
    const enrollmentQuery =
      "INSERT INTO instructor_courses (instructor_email, course_id) VALUES (?, ?)";
    con.query(enrollmentQuery, [email, courseId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Failed to assign course" });
      }

      res.redirect("/faculty"); // Redirect to faculty dashboard after successful enrollment
    });
  });
});

app.get("/enrollCourses", (req, res) => {
  const token = req.cookies.token; // Extract token from cookies

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    // Query to get available courses
    const query = "SELECT * FROM course"; // Assuming 'course' is the table name

    con.query(query, (err, courses) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      res.render("enrollCourses", { email: email, courses: courses });
    });
  });
});

app.post("/enrollCourses", (req, res) => {
  const token = req.cookies.token; // Extract token from cookies

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;
    const courseId = req.body.course; // Assuming the course ID is sent in the request body

    // Insert the course enrollment record
    const insertQuery =
      "INSERT INTO student_courses (email, course_id) VALUES (?, ?)";
    con.query(insertQuery, [email, courseId], (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.redirect("/student"); // Redirect to student dashboard or another page
    });
  });
});

app.get("/enrolledCourses", (req, res) => {
  const token = req.cookies.token; // Extract token from cookies

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    // Query to get the enrolled courses
    const query = `
  SELECT c.course_id, c.course_name, d.department_name
  FROM student_courses sc
  JOIN course c ON sc.course_id = c.course_id
  JOIN department d ON c.department_id = d.department_id
  WHERE sc.email = ?
`;

    con.query(query, [email], (err, enrolledCourses) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      res.render("enrolledCourses", {
        email: email,
        enrolledCourses: enrolledCourses,
      });
    });
  });
});

app.get("/updateCourse/:course_id", (req, res) => {
  const courseId = req.params.course_id;

  // Fetch current course details
  const queryCurrent = "SELECT * FROM course WHERE course_id = ?";
  con.query(queryCurrent, [courseId], (err, currentResults) => {
    if (err) return res.status(500).send("Database error");

    if (currentResults.length > 0) {
      const currentCourse = currentResults[0];

      // Fetch list of all courses
      const queryAll = "SELECT * FROM course  ";
      con.query(queryAll, (err, allResults) => {
        if (err) return res.status(500).send("Database error");

        res.render("updateCourse", { currentCourse, courses: allResults });
      });
    } else {
      res.status(404).send("Course not found");
    }
  });
});

app.post("/updateCourse/:course_id", (req, res) => {
  const courseId = req.params.course_id;
  const newCourseId = req.body.course;

  // Update the enrolled course
  const updateQuery =
    "UPDATE student_courses SET course_id = ? WHERE course_id = ?";
  con.query(updateQuery, [newCourseId, courseId], (err, result) => {
    if (err) return res.status(500).send("Database error");

    // Redirect back to enrolled courses
    res.redirect("/enrolledCourses");
  });
});

app.get("/deleteCourses", (req, res) => {
  const courseId = req.query.id;
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    // Delete course from student_courses
    const query =
      "DELETE FROM student_courses WHERE course_id = ? AND email = ?";
    con.query(query, [courseId, email], (err, result) => {
      if (err) return res.status(500).send("Database error");

      res.redirect("/enrolledCourses");
    });
  });
});

app.get("/assignedCourses", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    // Query to get the courses assigned to the faculty
    const getCoursesQuery = `
      SELECT c.course_id, c.course_name, d.department_name
      FROM course c
      JOIN instructor_courses ic ON c.course_id = ic.course_id
      JOIN department d ON c.department_id = d.department_id
      WHERE ic.instructor_email = ?
    `;

    con.query(getCoursesQuery, [email], (err, courses) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      // Render the assignedCourses.ejs with the list of courses
      res.render("assignedCourses", { assignedCourses: courses });
    });
  });
});

app.get("/updateAssignedCourse/:course_id", (req, res) => {
  const course_id = req.params.course_id;

  // Fetch all courses
  const getCoursesQuery = "SELECT * FROM course";
  con.query(getCoursesQuery, (err, courses) => {
    if (err) {
      return res
        .status(500)
        .render("error", { message: "Database query failed" });
    }

    // Fetch the current course details
    const getCourseQuery = "SELECT * FROM course WHERE course_id = ?";
    con.query(getCourseQuery, [course_id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      if (result.length === 0) {
        return res.status(404).render("error", { message: "Course not found" });
      }

      const currentCourse = result[0];
      res.render("updateAssignedCourse", { courses, currentCourse });
    });
  });
});

app.post("/updateAssignedCourse", (req, res) => {
  const { course_id, old_course_id } = req.body;

  if (!course_id || !old_course_id) {
    return res
      .status(400)
      .render("error", { message: "Course ID is required" });
  }

  // Update the course
  const updateQuery =
    "UPDATE instructor_courses SET course_id = ? WHERE course_id = ?";
  con.query(updateQuery, [course_id, old_course_id], (err) => {
    if (err) {
      return res
        .status(500)
        .render("error", { message: "Failed to update course" });
    }

    res.redirect("/assignedCourses");
  });
});

app.post("/deleteAssignedCourse", (req, res) => {
  const { course_id } = req.body;
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    // Get the faculty ID using the email
    const getFacultyIdQuery = "SELECT email FROM Instructor WHERE email = ?";
    con.query(getFacultyIdQuery, [email], (err, result) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Database query failed" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .render("error", { message: "Faculty not found" });
      }

      const facultyEmail = result[0].email;

      // Delete the course from the instructor_courses table
      const deleteQuery = `
        DELETE FROM instructor_courses 
        WHERE course_id = ? 
        AND instructor_email = ?;
      `;
      con.query(deleteQuery, [course_id, facultyEmail], (err, result) => {
        if (err) {
          return res
            .status(500)
            .render("error", { message: "Failed to delete course" });
        }

        res.redirect("/assignedCourses");
      });
    });
  });
});

app.get("/admin", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).render("error", { message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .render("error", { message: "Failed to authenticate token" });
    }

    const email = decoded.email;

    // Verify the user is an admin
    const query = "SELECT role FROM users WHERE email = ?";
    con.query(query, [email], (err, result) => {
      if (err) return console.log(err);

      if (result[0].role === "Admin") {
        return res.redirect("/viewReports");
      } else {
        return res.render("error", {
          message: "Unauthorized login: Not an admin",
        });
      }
    });
  });
});

// app.get("/manageCourses", (req, res) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(403).render("error",{ message: 'No token provided' });
//   }

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).render("error",{ message: 'Failed to authenticate token' });
//     }

//     const email = decoded.email;

//     // Verify the user is an admin
//     const query = "SELECT role FROM users WHERE email = ?";
//     con.query(query, [email], (err, result) => {
//       if (err) return console.log(err);

//       if (result[0].role === "Admin") {
//         // Fetch all courses from the database
//         const fetchCoursesQuery = "SELECT * FROM course";
//         con.query(fetchCoursesQuery, (err, courses) => {
//           if (err) return res.status(500).render("error",{ message: 'Database query failed' });

//           res.render("manageCourses", { courses: courses });
//         });
//       } else {
//         return res.render("error",{ message: "Unauthorized login: Not an admin" });
//       }
//     });
//   });
// });

app.get("/viewCourses", (req, res) => {
  const query = `
    SELECT c.course_id, c.course_name, d.department_name 
    FROM Course c
    JOIN Department d ON c.department_id = d.department_id
  `;

  con.query(query, (error, results) => {
    if (error) {
      return res.status(500).send("Error retrieving courses");
    }

    res.render("viewCourses", { courses: results });
  });
});

app.get("/addCourse", (req, res) => {
  res.render("addCourse");
});

// Route for adding a course to the database
app.post("/addCourse", (req, res) => {
  const { course_name, department_id, credits } = req.body;
  const query = "INSERT INTO Course (course_name, department_id) VALUES (?, ?)";

  con.query(query, [course_name, department_id], (err) => {
    if (err) {
      // return res.status(500).send('Error adding the course.');
      console.log(err);
    }
    res.redirect("/viewCourses");
  });
});

// Route for rendering the update course page
app.get("/updateCourse", (req, res) => {
  const courseId = req.query.id;
  const query = "SELECT * FROM Course WHERE course_id = ?";

  con.query(query, [courseId], (err, result) => {
    if (err) {
      return res.status(500).send("Error fetching course details.");
    }
    res.render("updateCourses", { course: result[0] });
  });
});

// Route for updating a course in the database
app.post("/updateCourse", (req, res) => {
  const { course_id, course_name, department_id } = req.body;
  const query =
    "UPDATE Course SET course_name = ?, department_id = ? WHERE course_id = ?";

  con.query(query, [course_name, department_id, course_id], (err) => {
    if (err) {
      return res.status(500).send("Error updating the course.");
    }
    res.redirect("/viewCourses");
  });
});

// Route for deleting a course from the database
app.get("/deleteCourse", (req, res) => {
  const courseId = req.query.id;
  const query = "DELETE FROM Course WHERE course_id = ?";

  con.query(query, [courseId], (err) => {
    if (err) {
      return res.status(500).send("Error deleting the course.");
    }
    res.redirect("/viewCourses");
  });
});

app.get("/updateUser", (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM Users WHERE email = ?";

  con.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).send("Error fetching user details.");
    }
    res.render("updateUser", { user: result[0] });
  });
});

app.post("/updateUser", (req, res) => {
  const { email, first_name, last_name, role } = req.body;

  // Determine which table to update based on the role
  let updateQuery;
  if (role === "Student") {
    updateQuery =
      "UPDATE Student SET first_name = ?, last_name = ? WHERE email = ?";
  } else if (role === "Faculty") {
    updateQuery =
      "UPDATE Instructor SET first_name = ?, last_name = ? WHERE email = ?";
  }

  // Update the corresponding first name and last name in the appropriate table
  if (updateQuery) {
    con.query(updateQuery, [first_name, last_name, email], (err) => {
      if (err) {
        return res
          .status(500)
          .send("Error updating user details: " + err.message);
      }
      res.redirect("/viewUsers");
    });
  } else {
    res.redirect("/viewUsers");
  }
});

app.get("/deleteUser", (req, res) => {
  const userId = req.query.id;
  console.log(userId);

  // First, check the user's role
  const userRoleQuery = "SELECT role FROM Users WHERE email = ?";

  con.query(userRoleQuery, [userId], (err, results) => {
    if (err) {
      return res.status(500).send("Error retrieving user role: " + err);
    }
    if (results.length === 0) {
      return res.status(404).send("User not found");
    }

    const role = results[0].role;
    console.log(role);

    // Define queries based on the user role
    let deleteAssociatedRecordsQuery;
    if (role === "Student") {
      deleteAssociatedRecordsQuery = "DELETE FROM Student WHERE email = ?";
    } else if (role === "Faculty") {
      deleteAssociatedRecordsQuery = "DELETE FROM Instructor WHERE email = ?";
    }

    // Delete associated records if applicable
    if (deleteAssociatedRecordsQuery) {
      con.query(deleteAssociatedRecordsQuery, [userId], (err) => {
        if (err) {
          return res
            .status(500)
            .send("Error deleting associated records: " + err);
        }

        // Now delete the user
        const deleteUserQuery = "DELETE FROM Users WHERE email = ?";
        con.query(deleteUserQuery, [userId], (err) => {
          if (err) {
            return res.status(500).send("Error deleting user: " + err);
          }
          res.redirect("/viewUsers");
        });
      });
    } else {
      // For admin, directly delete the user
      const deleteUserQuery = "DELETE FROM Users WHERE email = ?";
      con.query(deleteUserQuery, [userId], (err) => {
        if (err) {
          return res.status(500).send("Error deleting user: " + err);
        }
        res.redirect("/viewUsers");
      });
    }
  });
});

// Update Department Route
app.get("/updateDepartment", (req, res) => {
  const departmentId = req.query.id;
  const query = "SELECT * FROM Department WHERE department_id = ?";
  con.query(query, [departmentId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.render("updateDepartment", { department: results[0] });
    } else {
      res.status(404).send("Department not found");
    }
  });
});

app.post("/updateDepartment", (req, res) => {
  const { department_id, department_name } = req.body;
  const query =
    "UPDATE Department SET department_name = ? WHERE department_id = ?";
  con.query(query, [department_name, department_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/manageDepartments");
  });
});

// Delete Department Route
app.get("/deleteDepartment", (req, res) => {
  const departmentId = req.query.id;
  const query = "DELETE FROM Department WHERE department_id = ?";
  con.query(query, [departmentId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/manageDepartments");
  });
});

app.get("/viewReports", (req, res) => {
  const studentQuery = "SELECT COUNT(*) AS studentCount FROM Student";
  const facultyQuery = "SELECT COUNT(*) AS facultyCount FROM Instructor";
  const courseQuery = "SELECT COUNT(*) AS courseCount FROM Course";
  const departmentQuery = "SELECT COUNT(*) AS departmentCount FROM Department";

  // Use a multi-query to fetch all counts in one request
  con.query(
    `${studentQuery}; ${facultyQuery}; ${courseQuery}; ${departmentQuery}`,
    (err, results) => {
      if (err) {
        return res.status(500).send("Database query failed: " + err.message);
      }

      // Passing the counts to the EJS template
      res.render("report", {
        studentCount: results[0][0].studentCount,
        facultyCount: results[1][0].facultyCount,
        courseCount: results[2][0].courseCount,
        departmentCount: results[3][0].departmentCount,
      });
    }
  );
});

app.get("/manageDepartments", (req, res) => {
  const query = "SELECT * FROM Department";
  con.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.render("manageDepartment", { departments: results });
  });
});

app.get("/addDepartment", (req, res) => {
  res.render("addDepartment");
});

app.post("/addDepartment", (req, res) => {
  const { department_name } = req.body;
  const query = "INSERT INTO Department (department_name) VALUES (?)";
  con.query(query, [department_name], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/manageDepartments");
  });
});
app.get("/viewUsers", (req, res) => {
  const query = `
    SELECT u.email, u.role, 
           COALESCE(i.first_name, s.first_name) AS first_name, 
           COALESCE(i.last_name, s.last_name) AS last_name
    FROM Users u
    LEFT JOIN Instructor i ON u.email = i.email
    LEFT JOIN Student s ON u.email = s.email
  `;

  con.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Error retrieving users.");
    }
    res.render("viewUsers", { users: results });
  });
});

// Get all marks
app.get("/viewMarks", (req, res) => {
  const query = `
      SELECT Marks.marks_id, Marks.student_email, Student.first_name, Student.last_name, 
             Course.course_name, Marks.marks_obtained
      FROM Marks 
      JOIN Student ON Marks.student_email = Student.email 
      JOIN Course ON Marks.course_id = Course.course_id
  `;

  con.query(query, (err, results) => {
    if (err) throw err;
    res.render("viewMarks", { marks: results });
  });
});

// Edit Marks (GET - show form)
app.get("/editMarks/:id", (req, res) => {
  const marksId = req.params.id;

  // Query to join Marks with Student and Course tables
  const query = `
    SELECT m.marks_id, m.marks_obtained, s.first_name, s.last_name, c.course_name
    FROM Marks m
    JOIN Student s ON m.student_email = s.email
    JOIN Course c ON m.course_id = c.course_id
    WHERE m.marks_id = ?
  `;

  con.query(query, [marksId], (err, result) => {
    if (err) throw err;

    // Render the editMarks view with the retrieved data (including student name and course)
    res.render("editMarks", { mark: result[0] });
  });
});

// Delete Marks
app.post("/deleteMarks/:id", (req, res) => {
  const marksId = req.params.id;
  const query = `DELETE FROM Marks WHERE marks_id = ?`;

  con.query(query, [marksId], (err, result) => {
    if (err) throw err;
    res.redirect("/viewMarks");
  });
});

app.post("/updateMarks/:id", (req, res) => {
  const marksId = req.params.id;
  const { marks_obtained } = req.body;

  const query = `UPDATE Marks SET marks_obtained = ? WHERE marks_id = ?`;

  con.query(query, [marks_obtained, marksId], (err, result) => {
    if (err) throw err;
    // Redirect back to the marks view page after updating
    res.redirect("/viewMarks");
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
