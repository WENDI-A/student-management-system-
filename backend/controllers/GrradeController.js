const {
  Assessment,
  Student,
  Course,
  Grade,
  courseEnrollments: CourseEnrollment,
} = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

// Get all published assessments and grades for students in teacher's courses
exports.getPublishedAssessmentsAndGrades = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const teacherCourses = await Course.findAll({
      where: { teacher_id },
    });

    const courseIds = teacherCourses.map((course) => course.id);
    const enrolledStudents = await CourseEnrollment.findAll({
      where: {
        course_id: { [Op.in]: courseIds },
        status: "pending",
      },
      include: [
        {
          model: Student,
          as: "Student",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    const publishedAssessments = await Assessment.findAll({
      where: {
        course_id: { [Op.in]: courseIds },
        is_published: true,
      },
      include: [
        {
          model: Course,
          attributes: ["id", "Course_name", "Course_code"],
        },
      ],
    });

    const grades = await Grade.findAll({
      where: {
        student_id: { [Op.in]: enrolledStudents.map((e) => e.Student.id) },
        assessment_id: { [Op.in]: publishedAssessments.map((a) => a.id) },
      },
      include: [
        {
          model: Student,
          attributes: ["firstName", "lastName"],
        },
        {
          model: Assessment,
          attributes: ["title", "type", "max_score"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: [
        {
          enrolledStudents,
          publishedAssessments,
          grades,
          meta: {
            totalStudents: enrolledStudents.length,
            totalAssessments: publishedAssessments.length,
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching assessments and grades:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assessments and grades",
      error: error.message,
    });
  }
};

// Set or update a student's grade for an assessment
exports.setStudentGrade = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const { student_id, assessment_id, score } = req.body;

    // Validate required fields
    if (!student_id || !assessment_id || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: student_id, assessment_id, or score",
      });
    }

    // Find assessment with its max_score
    const assessment = await Assessment.findOne({
      where: { id: assessment_id },
      include: [
        {
          model: Course,
          where: { teacher_id },
          attributes: ["id"],
        },
      ],
      attributes: ["id", "max_score", "course_id", "title"], // Include max_score in attributes
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found or not associated with your courses",
      });
    }

    // Validate score against assessment's max_score
    if (score < 0 || score > assessment.max_score) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${assessment.max_score} for this assessment`,
      });
    }

    // Verify student enrollment
    const enrollment = await CourseEnrollment.findOne({
      where: {
        course_id: assessment.course_id,
        student_id,
        status: "pending",
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student not enrolled in this course",
      });
    }

    // Create or update grade
    const [grade, created] = await Grade.findOrCreate({
      where: {
        student_id,
        assessment_id,
        course_id: assessment.course_id,
      },
      defaults: {
        score,
        submitted_at: new Date(),
        graded_at: new Date(),
        is_published: true,
      },
    });

    if (!created) {
      await grade.update({
        score,
        graded_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: `Grade ${created ? "created" : "updated"} successfully for ${
        assessment.title
      }`,
      data: {
        grade,
        assessment: {
          title: assessment.title,
          max_score: assessment.max_score,
        },
      },
    });
  } catch (error) {
    console.error("Error setting grade:", error);
    res.status(500).json({
      success: false,
      message: "Error setting grade",
      error: error.message,
    });
  }
};

// Get grades for a specific student
exports.getStudentGrades = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const { student_id } = req.params;

    const teacherCourses = await Course.findAll({
      where: { teacher_id },
    });

    const courseIds = teacherCourses.map((course) => course.id);

    const enrollment = await CourseEnrollment.findOne({
      where: {
        course_id: { [Op.in]: courseIds },
        student_id,
        status: "pending",
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your courses",
      });
    }

    const grades = await Grade.findAll({
      where: {
        student_id,
        course_id: { [Op.in]: courseIds },
      },
      include: [
        {
          model: Assessment,
          attributes: ["title", "type", "max_score", "weight"],
          where: {
            is_published: true,
          },
        },
        {
          model: Course,
          attributes: ["Course_name", "Course_code"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        grades,
        meta: {
          totalGrades: grades.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student grades:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student grades",
      error: error.message,
    });
  }
};

exports.updateStudentGrade = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const grade_id = req.params.id;
    const { score, feedback } = req.body;

    // Validate input
    if (!grade_id || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: grade_id or score",
      });
    }

    // Find the existing grade with related data
    const existingGrade = await Grade.findOne({
      where: { id: grade_id },
      include: [
        {
          model: Assessment,
          attributes: ["id", "title", "max_score", "course_id"],
          include: [
            {
              model: Course,
              where: { teacher_id }, // Verify teacher owns the course
              attributes: ["id", "Course_name"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    // Check if grade exists and belongs to teacher's course
    if (!existingGrade || !existingGrade.Assessment.Course) {
      return res.status(404).json({
        success: false,
        message: "Grade not found or not associated with your courses",
      });
    }

    // Validate score against assessment's max_score
    if (score < 0 || score > existingGrade.Assessment.max_score) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${existingGrade.Assessment.max_score} for this assessment`,
      });
    }

    // Verify student is still enrolled
    const enrollment = await CourseEnrollment.findOne({
      where: {
        course_id: existingGrade.Assessment.course_id,
        student_id: existingGrade.Student.id,
        status: "pending",
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student no longer enrolled in this course",
      });
    }

    // Update the grade
    const updateData = {
      score,
      graded_at: new Date(),
    };

    // Only include feedback if it's provided
    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }

    await existingGrade.update(updateData);

    // Calculate percentage score
    const percentageScore = (score / existingGrade.Assessment.max_score) * 100;

    res.status(200).json({
      success: true,
      message: `Grade updated successfully for ${existingGrade.Assessment.title}`,
      data: {
        ...existingGrade.toJSON(),
        percentageScore: parseFloat(percentageScore.toFixed(2)),
        Studentid: existingGrade.Student.id,
        name: `${existingGrade.Student.firstName} ${existingGrade.Student.lastName}`,
        Assessmentid: existingGrade.Assessment.id,
        title: existingGrade.Assessment.title,
        max_score: existingGrade.Assessment.max_score,
      },
    });
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({
      success: false,
      message: "Error updating grade",
      error: error.message,
    });
  }
};

// Get a specific grade by ID
exports.getGradeById = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const grade_id = req.params.id;

    // Validate input
    if (!grade_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: grade_id",
      });
    }

    // Find the grade with related data
    const grade = await Grade.findOne({
      where: { id: grade_id },
      include: [
        {
          model: Assessment,
          attributes: [
            "id",
            "title",
            "type",
            "max_score",
            "weight",
            "course_id",
          ],
          include: [
            {
              model: Course,
              where: { teacher_id }, // Verify teacher owns the course
              attributes: ["id", "Course_name", "Course_code"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Course,
          attributes: ["Course_name", "Course_code"],
        },
      ],
    });

    // Check if grade exists and belongs to teacher's course
    if (!grade || !grade.Assessment.Course) {
      return res.status(404).json({
        success: false,
        message: "Grade not found or not associated with your courses",
      });
    }

    // Calculate percentage score
    const percentageScore = (grade.score / grade.Assessment.max_score) * 100;

    // Format dates for better readability
    const formattedGrade = {
      ...grade.toJSON(),
      percentageScore: parseFloat(percentageScore.toFixed(2)),
      submitted_at: grade.submitted_at
        ? moment(grade.submitted_at).format("YYYY-MM-DD HH:mm:ss")
        : null,
      graded_at: grade.graded_at
        ? moment(grade.graded_at).format("YYYY-MM-DD HH:mm:ss")
        : null,
    };

    res.status(200).json({
      success: true,
      data: {
        grade: formattedGrade,
        id: grade.Student.id,
        name: `${grade.Student.firstName} ${grade.Student.lastName}`,
        email: grade.Student.email,
        Assessmentid: grade.Assessment.id,
        title: grade.Assessment.title,
        type: grade.Assessment.type,
        max_score: grade.Assessment.max_score,
        weight: grade.Assessment.weight,
        Courseid: grade.Course.id,
        name: grade.Course.Course_name,
        code: grade.Course.Course_code,
      },
    });
  } catch (error) {
    console.error("Error fetching grade by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching grade by ID",
      error: error.message,
    });
  }
};

module.exports = exports;
