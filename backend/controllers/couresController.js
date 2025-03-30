const { Course } = require("../models");
const { CourseMaterial } = require("../models");
const {enrollAllStudentsInGradeLevelCourses } = require("./CourseEnrollmentController")

exports.setCourse = async (req, res) => {
  try {
    const { Coures_name, Coures_code, course_name, course_code, teacher_id ,grade } = req.body;
    
    const finalCourseName = course_name || Coures_name;
    const finalCourseCode = course_code || Coures_code;
    
    if (!finalCourseName || !finalCourseCode) {
      return res.status(400).json({
        success: false,
        message: "Course name and code are required"
      });
    }
    
    const newCourse = await Course.create({
      Course_name: finalCourseName,
      Course_code: finalCourseCode,
      teacher_id: teacher_id || null,
      grade
    });

    enrollAllStudentsInGradeLevelCourses()

    
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const queryOptions = {
      include: [{ association: 'Teacher' }]
    };
    
    if (req.user.role !== "admin") {
      queryOptions.where = { isActive: true };
    }
    
    const courses = await Course.findAll(queryOptions);
    
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOne({
      where: { id, isActive: true },
      include: [{ association: 'Teacher' }]
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: error.message
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      course_name, course_code, 
      Coures_name, Coures_code, 
      teacher_id, isActive ,
      grade
    } = req.body;
    
    const course = await Course.findByPk(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    const finalCourseName = course_name || Coures_name;
    const finalCourseCode = course_code || Coures_code;
    
    await course.update({
      Course_name: finalCourseName || course.Course_name,
      Course_code: finalCourseCode || course.Course_code,
      teacher_id: teacher_id || course.teacher_id,
      isActive: isActive !== undefined ? isActive : course.isActive,
      grade
    });
    
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message
    });
  }
};


exports.permanentlyDeleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can permanently delete courses"
      });
    }
    
    const course = await Course.findByPk(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    await CourseMaterial.destroy({
      where: { course_id: id }
    });
    

    await course.destroy();
    
    return res.status(200).json({
      success: true,
      message: "Course and all associated materials permanently deleted"
    });
  } catch (error) {
    console.error("Error permanently deleting course:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete course",
      error: error.message
    });
  }
};

