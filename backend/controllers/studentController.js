
const { Student ,Course } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { enrollStudentInGradeLevelCourses } = require('./CourseEnrollmentController');

exports.registerStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, email, student_id, dateOfBirth, enrollmentDate, grade } = req.body;

    if (!firstName || !lastName || !email || !student_id) {
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

    // Check if there are courses available for the student's grade
    if (grade) {
      const coursesForGrade = await Course.findAll({
        where: { 
          grade: grade,
          isActive: true
        }
      });

      if (coursesForGrade.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `No active courses found for grade ${grade}. Student registration canceled.` 
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("student123", salt);

    const newStudent = await Student.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      student_id,
      dateOfBirth,
      enrollmentDate,
      grade
    });

    // Enroll student in courses for their grade level
    let enrollmentResult = null;
    if (grade) {
      enrollmentResult = await enrollStudentInGradeLevelCourses(newStudent.id);
      if (!enrollmentResult.success || 
          (enrollmentResult.data && 
           enrollmentResult.data.enrollmentSummary.newlyEnrolled === 0 && 
           enrollmentResult.data.enrollmentSummary.alreadyEnrolled === 0)) {
        
        await newStudent.destroy();
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to enroll student in any courses. Student registration canceled.',
          error: enrollmentResult.message
        });
      }
    }

    const token = jwt.sign({ id: newStudent.id, role: newStudent.role }, 'your-secret-key', { expiresIn: '1h' });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully and enrolled in grade-appropriate courses',
      student: newStudent,
      enrollmentResult: enrollmentResult ? enrollmentResult.data : null,
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
