const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../prismaClient");
const auth = require("../middleware/authMiddleware");
const { PrismaCrudRouter ,FileHandler } = require("../CURD/index");

// Import per-model controller configs
const studentConfig = require("../controllers/configs/student.config");
const teacherConfig = require("../controllers/configs/teacher.config");
const parentConfig = require("../controllers/configs/parent.config");
const directorConfig = require("../controllers/configs/director.config");
const guestConfig = require("../controllers/configs/guest.config");
const classConfig = require("../controllers/configs/class.config");
const courseConfig = require("../controllers/configs/course.config");
const courseEnrollmentConfig = require("../controllers/configs/courseEnrollment.config");
const courseTeacherConfig = require("../controllers/configs/courseTeacher.config");
const assessmentConfig = require("../controllers/configs/assessment.config");
const questionConfig = require("../controllers/configs/question.config");
const studentAnswerConfig = require("../controllers/configs/studentAnswer.config");
const gradeConfig = require("../controllers/configs/grade.config");
const gradeSummaryConfig = require("../controllers/configs/gradeSummary.config");
const attendanceConfig = require("../controllers/configs/attendance.config");
const courseMaterialConfig = require("../controllers/configs/courseMaterial.config");
const notificationConfig = require("../controllers/configs/notification.config");
const parentStudentConfig = require("../controllers/configs/parentStudent.config");
const scheduleConfig = require("../controllers/configs/schedule.config");
const adminConfig = require("../controllers/configs/admin.config")

const prisma = new PrismaClient();

// Auth routes
router.use("/auth", require("./authRoutes"));

const curd = new PrismaCrudRouter(router, {
  student: prisma.student,
  teacher: prisma.teacher,
  parent: prisma.parent,
  admin: prisma.admin,
  director: prisma.director,
  guest: prisma.guest,
  class: prisma.class,
  course: prisma.course,
  courseEnrollment: prisma.courseEnrollment,
  courseTeacher: prisma.courseTeacher,
  assessment: prisma.assessment,
  question: prisma.question,
  studentAnswer: prisma.studentAnswer,
  grade: prisma.grade,
  gradeSummary: prisma.gradeSummary,
  attendance: prisma.attendance,
  courseMaterial: prisma.courseMaterial,
  notification: prisma.notification,
  parentStudent: prisma.parentStudent,
  schedule: prisma.schedule
}, {
  version: "1.0.0",
  // defaultMiddleware: [auth.protect],
  powered_by: "student_management_system"
});

// Register CRUD routes for each model with validation and config
// --- user models 
curd.route("/students", prisma.student, studentConfig);
curd.route("/teachers", prisma.teacher, teacherConfig);
curd.route("/parents", prisma.parent, parentConfig);
curd.route("/directors", prisma.director, directorConfig);
curd.route("/guests", prisma.guest, guestConfig);

// --- models
curd.route("/classes", prisma.class, classConfig);
curd.route("/courses", prisma.course, courseConfig);
curd.route("/course-enrollments", prisma.courseEnrollment, courseEnrollmentConfig);
curd.route("/course-teachers", prisma.courseTeacher, courseTeacherConfig);
curd.route("/assessments", prisma.assessment, assessmentConfig);
curd.route("/questions", prisma.question, questionConfig);
curd.route("/student-answers", prisma.studentAnswer, studentAnswerConfig);
curd.route("/grades", prisma.grade, gradeConfig);
curd.route("/grade-summaries", prisma.gradeSummary, gradeSummaryConfig);
curd.route("/attendances", prisma.attendance, attendanceConfig);
curd.route("/course-materials", prisma.courseMaterial, courseMaterialConfig);
curd.route("/notifications", prisma.notification, notificationConfig);
curd.route("/parent-students", prisma.parentStudent, parentStudentConfig);
curd.route("/schedules", prisma.schedule, scheduleConfig);

// -- admin models 
// curd.route("/admin" , prisma.admin , adminConfig)

module.exports = router;