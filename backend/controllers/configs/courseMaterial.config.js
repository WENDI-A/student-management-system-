const { CourseMaterialSchema } = require("../../zodSchemas/CourseMaterial");
const auth = require("../../middleware/authMiddleware");
const { file } = require("../../middleware/FileHandler");

const validateCourseMaterial = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = CourseMaterialSchema.omit({ id: true }).parse(data);
    } else {
      validatedData = CourseMaterialSchema.omit({ id: true }).partial().parse(data);
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

module.exports = {
  middleware: [auth.protect , file.single("url" , {allowedTypes :  ['application/pdf']})],
  validation: {
    create: validateCourseMaterial,
    update: validateCourseMaterial
  },
}; 