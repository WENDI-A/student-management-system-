const { AdminSchema } = require("../../zodSchemas/Admin");
const auth = require("../../middleware/authMiddleware");
const bcrypt = require("bcrypt");

const validateAdmin = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = AdminSchema.omit({ id: true }).parse(data);
    } else {
      validatedData = AdminSchema.omit({ id: true }).partial().parse(data);
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
  if (data.password) {
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);
  }
  return data;
};

module.exports = {
  middleware: [auth.protect],
  validation: {
    create: validateAdmin,
    update: validateAdmin
  },
  beforeActions: {
    create: hashPassword
  },
  excludeRoute : ["get" ,"post" , "put" , "delete"]

}; 