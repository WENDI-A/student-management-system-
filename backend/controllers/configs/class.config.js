const { ClassSchema } = require("../../zodSchemas/Class");
const auth = require("../../middleware/authMiddleware");

const validateClass = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = ClassSchema.omit({ id: true }).parse(data);
    } else {
      validatedData = ClassSchema.omit({ id: true }).partial().parse(data);
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
  middleware: [auth.protect],
  validation: {
    create: validateClass,
    update: validateClass
  },
  includeRelations : true
}; 