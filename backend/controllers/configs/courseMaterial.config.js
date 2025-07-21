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
  if (data && data['data[file]']) {
    data.data.url = data['data[file]'];
    delete data['data[file]'];
    data.data.teacherId = req.user.id
  }
  
  if (data && data['data[file]Details']) {
    delete data['data[file]Details'];
  }
  
  return data.data;
};

module.exports = {
  middleware: [auth.protect, file.single("data[file]", { allowedTypes: ['application/pdf'] })],
  validation: {
    create: validateCourseMaterial,
    update: validateCourseMaterial
  },
  beforeActions: {
    create: fixDataStructure,
    update: fixDataStructure
  }
}; 