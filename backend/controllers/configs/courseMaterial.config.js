const { CourseMaterialSchema } = require("../../zodSchemas/CourseMaterial");
const auth = require("../../middleware/authMiddleware");
const { file } = require("../../middleware/FileHandler");

const validateCourseMaterial = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = CourseMaterialSchema.parse(data);
    } else {
      validatedData = CourseMaterialSchema.partial().parse(data);
    }
    return {
      isValid: true,
      message: "Validation successful",
      data: validatedData
    };
  } catch (error) {
    if (error.errors) {
      const errors = error.errors.map(err => JSON.stringify(err));
      return {
        isValid: false,
        message: errors.join(", "),
        errors: errors
      };
    }
    return {
      isValid: false,
      message: "Validation failed",
      errors: [error.message]
    };
  }
};

// Before action to fix data structure
const fixDataStructure = (data, req) => {
  // Handle file upload - if a file was uploaded, add its URL to the data
  if (req.file) {
    // Create a proper URL path from the file path
    const relativePath = req.file.path.replace(/\\/g, '/');
    data.url = `/${relativePath}`;
  }
  
  // Ensure teacherId is set from the authenticated user
  if (req.user && req.user.id) {
    data.teacherId = req.user.id;
  }
  
  return data;
};

module.exports = {
  middleware: [auth.protect, file.single("file", { 
    allowedTypes: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFileSize: 20 * 1024 * 1024 // 20MB
  })],
  validation: {
    create: validateCourseMaterial,
    update: validateCourseMaterial
  },
  beforeActions: {
    create: fixDataStructure,
    update: fixDataStructure
  }
}; 