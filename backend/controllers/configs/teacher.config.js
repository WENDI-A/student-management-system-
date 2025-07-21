const { TeacherSchema } = require("../../zodSchemas/Teacher");
const auth = require("../../middleware/authMiddleware");
const bcrypt = require("bcrypt");

const validateTeacher = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = TeacherSchema.parse(data);
    } else {
      validatedData = TeacherSchema.partial().parse(data);
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
    data.password = await bcrypt.hash("teacher123", saltRounds);
    return data;
};

module.exports = {
  middleware: [auth.protect,auth.authorize("admin")],
  validation: {
    create: validateTeacher,
    update: validateTeacher
  },
  beforeActions: {
    create: hashPassword,
    update : hashPassword
  },
  excludeFields : ["password"],
  includeRelations : true
}; 