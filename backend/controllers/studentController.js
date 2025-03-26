
const { Student } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, student_id, dateOfBirth , enrollmentDate,grade} = req.body;

    if (!firstName || !lastName || !email || !password || !student_id) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingStudent = await Student.findOne({ where: { student_id } });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: 'Student ID is already in use' });
    }

    const studentIdRegex = /^\d+\/\d{2}$/;
    if (!studentIdRegex.test(student_id)) {
      return res.status(400).json({ success: false, message: 'Student ID must be in format xxxx/xx' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = await Student.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      student_id,
      dateOfBirth,
      enrollmentDate ,
      grade
    });

    const token = jwt.sign({ id: newStudent.id, role: newStudent.role }, 'your-secret-key', { expiresIn: '1h' });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: newStudent,
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.findAll();
    return res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.update(req.body);
    return res.status(200).json({ success: true, message: 'Student updated successfully', data: student });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.destroy();
    return res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};
