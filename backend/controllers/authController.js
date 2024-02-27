require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../models/studentModel");
const Faculty = require("../models/facultyModel");

const facultySignUp = async (req, res) => {
  const { name, email, empId, password } = req.body;
  try {
    const existingFaculty = await Faculty.findOne({ empId });
    if (existingFaculty) {
      return res.status(400).json({ error: "Faculty with same empId exists." });
    }
    if (empId.length < 6) {
      return res.status(400).json({ error: "empId must be 6 digits long." });
    }
    if (password.length !== 8) {
      return res.status(400).json({ error: "Password must be 8 digits long." });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newFaculty = new Faculty({
      name,
      email,
      empId,
      password: hashedPassword,
    });
    const savedFaculty = await newFaculty.save();
    res.status(201).json({ savedFaculty });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const facultySignIn = async (req, res) => {
  const { empId, password } = req.body;
  try {
    const faculty = await Faculty.findOne({ empId });
    if (!faculty) {
      return res.status(401).json({ error: "Invalid empId." });
    }
    const passwordMatch = await bcrypt.compare(password, faculty.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password." });
    }

    const token = jwt.sign({ empId: faculty.empId, _id: faculty._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Sign in successful", token, empId: faculty.empId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const studentSignUp = async (req, res) => {
  const { name, email, password, collegeId, courses } = req.body;
  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res
        .status(400)
        .json({ error: "Student with the same email already exists." });
    }
    if (password.length !== 8) {
      return res.status(400).json({ error: "Password must be 8 digits long." });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({
      name,
      email,
      collegeId,
      password: hashedPassword,
      courses,
    });
    const savedStudent = await newStudent.save();
    res.status(201).json({ savedStudent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const studentSignIn = async (req, res) => {
  const { collegeId, password } = req.body;
  try {
    const student = await Student.findOne({ collegeId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const token = jwt.sign({ collegeId: student.collegeId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Sign in successful", token, collegeId: student.collegeId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  facultySignUp,
  facultySignIn,
  studentSignUp,
  studentSignIn,
};