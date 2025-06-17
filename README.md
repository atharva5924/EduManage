# 🚀 EduManage

A Node.js and Express.js web application using MySQL that provides role-based access to students, admins, and faculty members. It allows students to enroll in courses and view their grades, while administrators and faculty manage departments, courses, and student performance.

---

## 🚀 Features

### 👨‍🎓 Student
- Login
- View Enrolled Courses
- View Exam Schedule
- View Marks/Grades
- Enroll in Courses

### 🧑‍💼 Admin
- Manage Users (CRUD)
- Manage Courses (CRUD)
- Manage Departments (CRUD)
- View & Update Student Marks
- View Reports

### 👨‍🏫 Faculty
- Assign Courses
- Manage Marks of Enrolled Students
- Manage Departments (Add/Update)

---

## ✨ Features

- 🔐 **JWT Authentication** with cookie-based sessions
- 🧾 **Login/Register Pages** using EJS templates
- 🔄 **Session Persistence** using cookies
- 🧠 **Password Hashing** with Bcrypt
- 💾 **MySQL Integration** for storing user data
- 📦 Modular Routes and Middleware for scalability

---

## 🛠️ Tech Stack

| Category      | Technology                     |
|---------------|--------------------------------|
| Language      | JavaScript (Node.js)           |
| Runtime       | Node.js                        |
| Framework     | [Express.js](https://expressjs.com/) |
| Templating    | [EJS](https://ejs.co/)         |
| Styling       | [Bootstrap 5](https://getbootstrap.com/) |
| Auth & Tokens | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), [cookie-parser](https://www.npmjs.com/package/cookie-parser) |
| Encryption    | [bcrypt](https://www.npmjs.com/package/bcrypt) |
| DB Layer      | [mysql2](https://www.npmjs.com/package/mysql2) |
| Dev Tools     | [nodemon](https://www.npmjs.com/package/nodemon) |
| Middleware    | body-parser, cookie-parser     |

---

## 📁 Project Structure

```text
project1/
├── app.js # Main entry point
├── views/ # EJS templates (login, register, dashboard, etc.)
├── public/ # Static assets (Bootstrap, CSS, images)
├── data.sql # database schema SQL
├── package.json # Dependencies and scripts
```

## 🚀 Local Setup Instructions

1. **Clone the Repo**

```bash
git git clone https://github.com/atharva5924/EduManage.git
```

2. **Install Dependencies**

```bash
npm install
```

3. **Run the Dev Server**

```bash
node app.js
```

---


## 📋 Route Overview

### 👨‍🎓 Student Routes

| Route                  | Functionality                                                             |
|------------------------|---------------------------------------------------------------------------|
| `/login`              | Authenticates the student and provides access to their dashboard          |
| `/student`            | Displays the student dashboard with quick access to their actions         |
| `/enrollCourses`      | Allows student to enroll in available courses                             |
| `/examSchedule`       | Shows the upcoming exam schedule for the student                          |
| `/marks`              | Displays the grades/marks obtained by the student                         |
| `/enrolledCourses`    | Lists all the courses in which the student is currently enrolled          |

---

### 🧑‍💼 Admin Routes

| Route                    | Functionality                                                             |
|--------------------------|---------------------------------------------------------------------------|
| `/viewReports`          | Displays analytics and reports on student performance and course data     |
| `/viewUsers`            | Lists all registered users with options to edit or delete them            |
| `/viewCourses`          | Lists all courses in the system with CRUD management options              |
| `/manageDepartments`    | Allows admin to add, edit, or delete academic departments                 |
| `/viewMarks`            | Displays all student marks; admin can review and update if necessary      |

---

### 👨‍🏫 Faculty Routes

| Route                       | Functionality                                                            |
|-----------------------------|---------------------------------------------------------------------------|
| `/facultyMarks`            | Allows faculty to enter or update marks for students                     |
| `/enrollCoursesFaculty`    | Faculty can enroll or assign themselves to available courses             |
| `/assignedCourses`         | Lists all the courses assigned to the currently logged-in faculty member |

---

## 🧑‍🔒 Authentication & Authorization

- JWT tokens are used for session management and stored in cookies.
- Middleware functions are used to verify the role (`student` / `admin` / `faculty`) before accessing protected routes.

---

## 🧑‍💻 Authors

- **Atharva Nile** — [GitHub](https://github.com/atharva5924)

---

## 📜 License

This project is licensed under the **ISC License**.

---

## 📌 Notes

- ✅ Ensure **MySQL server** is running before starting the project.
- 🛠️ Use `mysql2` package to leverage **Promises and async/await** for clean database interactions.
- 🔐 Admin panel features are accessible only by **authenticated admins**.
- ⚠️ Proper **error handling** and user feedback using **flash messages** are implemented (or should be).
- 📝 Feel free to **customize this README** as the project evolves.

---

>💻 Built with passion using Node.js, Express, EJS, and MySQL – A scalable foundation for full-stack web applications.

