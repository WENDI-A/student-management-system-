const { GradeSchema } = require("../../zodSchemas/Grade");
const auth = require("../../middleware/authMiddleware");

const validateGrade = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = GradeSchema.omit({ id: true }).parse(data);
    } else {
      validatedData = GradeSchema.omit({ id: true }).partial().parse(data);
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
    create: validateGrade,
    update: validateGrade
  },
  beforeActions: {},
  afterActions: {}
}; 