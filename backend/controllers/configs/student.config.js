const { StudentSchema } = require("../../zodSchemas/Student");
const auth = require("../../middleware/authMiddleware");
const bcrypt = require("bcrypt");

const validateStudent = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = StudentSchema.parse(data);
    } else {
      validatedData = StudentSchema.partial().parse(data);
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

const hashPassword = async (data) => {
    const saltRounds = 10;
    data.password = await bcrypt.hash("student123", saltRounds);
};

module.exports = {
  middleware: [auth.protect,auth.authorize("admin","teacher")],
  validation: {
    create: validateStudent,
    update: validateStudent
  },
  beforeActions: {
    create: hashPassword,
    update : hashPassword
  },
  excludeFields : ["password"],
  includeRelations : true
}; 