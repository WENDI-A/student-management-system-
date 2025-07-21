const { DirectorSchema } = require("../../zodSchemas/Director");
const auth = require("../../middleware/authMiddleware");
const bcrypt = require("bcrypt");

const validateDirector = (data, req) => {
  try {
    // Defensive: Only validate if data is an object
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        message: 'Invalid input: expected object, received ' + typeof data,
        errors: ['Invalid input: expected object, received ' + typeof data],
      };
    }
    // Set default password if not provided (for admin-created directors)
    if (req.method && req.method.toLowerCase() === "post" && !data.password) {
      data.password = "director123";
    }
    console.log("[Director Registration] Incoming data:", data);
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = DirectorSchema.parse(data);
    } else {
      validatedData = DirectorSchema.partial().parse(data);
    }
    return {
      isValid: true,
      message: "Validation successful",
      data: validatedData,
    };
  } catch (error) {
    console.error("[Director Registration] Validation error:", error);
    if (error.errors) {
      const errors = error.errors.map((err) => JSON.stringify(err));
      return {
        isValid: false,
        message: errors.join(", "),
        errors: errors,
      };
    }
    return {
      isValid: false,
      message: "Validation failed",
      errors: [error.message],
    };
  }
};

const hashPassword = async (data, req) => {
  if (data.password) {
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);
  }
  return data;
};

module.exports = {
  middleware: [auth.protect, auth.authorize("admin")],
  validation: {
    create: validateDirector,
    update: validateDirector,
  },
  beforeActions: {
    create: hashPassword,
    update: hashPassword,
  },
  excludeFields: ["password"],
  afterActions: {
    get: (data) => {
      // Defensive: filter out any undefined/null or malformed entries
      if (Array.isArray(data)) {
        return data.filter((d) => d && d.firstName && d.lastName && d.email);
      }
      return data;
    },
  },
};
