-- Create the Users Table (common for all roles)
CREATE TABLE Users (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    -- Store hashed password
    role ENUM(
        'Admin',
        'Faculty',
        'Student',
        'Account Personnel'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Create the Department Table
CREATE TABLE Department (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    head_email VARCHAR(100)
);
-- Create the Instructor Table
CREATE TABLE Instructor (
    email VARCHAR(100) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department_id INT,
    FOREIGN KEY (email) REFERENCES Users(email),
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);
-- Update Department Table to reference Instructor
ALTER TABLE Department
ADD CONSTRAINT fk_head_email FOREIGN KEY (head_email) REFERENCES Instructor(email);
-- Create the Course Table
CREATE TABLE Course (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(100) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);
-- Create the Exam Table
CREATE TABLE Exam (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    exam_date DATE NOT NULL,
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);
-- Create the Student Table
CREATE TABLE Student (
    email VARCHAR(100) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    FOREIGN KEY (email) REFERENCES Users(email)
);
-- Create the Marks Table
CREATE TABLE Marks (
    marks_id INT PRIMARY KEY AUTO_INCREMENT,
    student_email VARCHAR(100),
    course_id INT,
    -- exam_id INT,
    marks_obtained INT NOT NULL,
    FOREIGN KEY (student_email) REFERENCES Student(email),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_email VARCHAR(255),
    course_id INT,
    FOREIGN KEY (student_email) REFERENCES student(email),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
CREATE TABLE instructor_courses(
    instructor_courses_id INT,
    instructor_email VARCHAR(255),
    course_id INT,
    FOREIGN KEY (instructor_email) REFERENCES Instructor(email),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
CREATE TABLE student_courses(
    email VARCHAR(255),
    course_id INT,
    FOREIGN KEY (email) REFERENCES student(email),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
INSERT INTO Department (department_name)
VALUES ('Computer Science'),
    ('Electrical Engineering'),
    ('Mechanical Engineering'),
    ('Civil Engineering');

    -- Computer Science (department_id = 1)
INSERT INTO Course (course_name, department_id) VALUES 
('Data Structures', 1),
('Operating Systems', 1),
('Computer Networks', 1),
('Database Systems', 1);

-- Electrical Engineering (department_id = 2)
INSERT INTO Course (course_name, department_id) VALUES 
('Circuit Theory', 2),
('Signals and Systems', 2),
('Digital Electronics', 2),
('Power Systems', 2);

-- Mechanical Engineering (department_id = 3)
INSERT INTO Course (course_name, department_id) VALUES 
('Thermodynamics', 3),
('Fluid Mechanics', 3),
('Machine Design', 3),
('Heat Transfer', 3);

-- Civil Engineering (department_id = 4)
INSERT INTO Course (course_name, department_id) VALUES 
('Structural Analysis', 4),
('Geotechnical Engineering', 4),
('Transportation Engineering', 4),
('Construction Management', 4);
