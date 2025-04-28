const { Course, CourseMaterial , courseEnrollments } = require("../models");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadDir = 'uploads/course-materials';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `material_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar|txt|mp4|mp3|avi|mov/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only common document, image, and media formats are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
}).single('materialFile');

exports.addCourseMaterial = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "File upload error",
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: "File upload failed",
          error: err.message
        });
      }
      
      try {
        const teacherId = req.user.id;
        const { title, content, course_id } = req.body;
        
        if (!title || (!content && !req.file)) {
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          
          return res.status(400).json({
            success: false,
            message: "Title and either content or file are required"
          });
        }

        let courseId = course_id;
        
        if (!courseId) {
          const courses = await Course.findAll({
            where: { 
              teacher_id: teacherId,
              isActive: true
            },
            attributes: ['id', 'Course_name']
          });

          if (!courses || courses.length === 0) {
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            
            return res.status(404).json({
              success: false,
              message: "No active courses found for this teacher"
            });
          }
          
          courseId = courses[0].id;
        } else {
          const course = await Course.findOne({
            where: { 
              id: courseId,
              teacher_id: teacherId,
              isActive: true
            }
          });
          
          if (!course) {
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            
            return res.status(404).json({
              success: false,
              message: "Course not found or you don't have permission to add materials"
            });
          }
        }
        
        const materialData = {
          title,
          content: content || null,
          course_id: courseId
        };
        
        if (req.file) {
          materialData.fileUrl = uploadDir + "/"+req.file.originalname;
        }
        
        const material = await CourseMaterial.create(materialData);
        
        const responseData = {
          material: material
        };
        
        if (req.file) {
          responseData.file = {
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path,
            size: req.file.size
          };
        }
        
        return res.status(201).json({
          success: true,
          message: req.file 
            ? "Course material added successfully with file" 
            : "Course material added successfully",
          data: responseData
        });
      } catch (error) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error("Error adding course material:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to add course material",
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error("Error in addCourseMaterial:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message
    });
  }
};

exports.editCourseMaterial = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "File upload error",
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: "File upload failed",
          error: err.message
        });
      }
      
      try {
        const { courseId, materialId } = req.params;
        const { title, content } = req.body;
        const teacherId = req.user.id;
        
        if (!title && !content && !req.file) {
          return res.status(400).json({
            success: false,
            message: "At least one field (title, content, or file) is required for update"
          });
        }
        
        const course = await Course.findOne({
          where: { 
            id: courseId, 
            isActive: true,
            teacher_id: teacherId
          }
        });
        
        if (!course) {
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          
          return res.status(404).json({
            success: false,
            message: "Course not found or you don't have permission to edit its materials"
          });
        }
        
        const material = await CourseMaterial.findOne({
          where: { 
            id: materialId,
            course_id: courseId
          }
        });
        
        if (!material) {
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          
          return res.status(404).json({
            success: false,
            message: "Course material not found"
          });
        }
        
        const updateData = {};
        if (title) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        
        if (req.file) {
          // Delete old file if exists
          if (material.file_path && fs.existsSync(material.file_path)) {
            fs.unlinkSync(material.file_path);
          }
          
          updateData.file_name = req.file.originalname;
          updateData.file_path = req.file.path;
          updateData.file_type = req.file.mimetype;
          updateData.file_size = req.file.size;
          updateData.uploaded_by = req.user.id;
        }
        
        await material.update(updateData);
        
        const responseData = {
          material: material
        };
        
        if (req.file) {
          responseData.file = {
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path,
            size: req.file.size
          };
        }
        
        return res.status(200).json({
          success: true,
          message: req.file 
            ? "Course material updated successfully with new file" 
            : "Course material updated successfully",
          data: responseData
        });
      } catch (error) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error("Error updating course material:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to update course material",
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error("Error in editCourseMaterial:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message
    });
  }
};

exports.getAllMaterialsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const courses = await Course.findAll({
      where: { 
        teacher_id: teacherId,
        isActive: true
      },
      attributes: ['id', 'Course_name']
    });
    
    if (!courses.length) {
      return res.status(404).json({
        success: false,
        message: "No active courses found for this teacher"
      });
    }

    const courseIds = courses.map(course => course.id);
    const materials = await CourseMaterial.findAll({
      where: {
        course_id: courseIds
      },
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    console.error("Error fetching teacher's course materials:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course materials",
      error: error.message
    });
  }
};

exports.getCourseMaterials = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const enrollments = await courseEnrollments.findAll({
      where: { student_id: studentId }
    });
    
    const courseIds = enrollments.map(enrollment => enrollment.course_id);
    
    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    const materials = await CourseMaterial.findAll({
      where: { 
        course_id: courseIds 
      },
      include: [{
        model: Course,
        as: 'Course', 
        attributes: ['id', 'Course_name', 'Course_code']
      }]
    });
    
    return res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    console.error("Error fetching course materials:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course materials",
      error: error.message
    });
  }
};

exports.getCourseMaterialsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const materials = await CourseMaterial.findAll({
      where: {  id }
    });
    
    return res.status(200).json({
      success: true,
      count: materials.length,
      data: materials[0].dataValues
    });
  } catch (error) {
    console.error("Error fetching course materials:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course materials",
      error: error.message
    });
  }
};


exports.deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.id;
    
    const material = await CourseMaterial.findByPk(materialId);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Course material not found"
      });
    }
    
    const course = await Course.findOne({
      where: { 
        id: material.course_id,
        teacher_id: teacherId
      }
    });
    
    if (!course && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this material"
      });
    }
    
    if (material.file_path && fs.existsSync(material.file_path)) {
      fs.unlinkSync(material.file_path);
    }
    
    await material.destroy();
    
    return res.status(200).json({
      success: true,
      message: "Course material deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting course material:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course material",
      error: error.message
    });
  }
};