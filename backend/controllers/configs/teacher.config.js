const { TeacherSchema } = require("../../zodSchemas/Teacher");
const auth = require("../../middleware/authMiddleware");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("../../prismaClient");
const prisma = new PrismaClient();

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

// Custom POST (create teacher with courses)
async function customCreateTeacher(req, res, next) {
  try {
    const { firstName, lastName, email, courses } = req.body;
    const value = await hashPassword({})
    const data = { firstName, lastName, email, password : value.password };
    if (courses && Array.isArray(courses)) {
      data.courses = {
        create: courses.map((c) => ({ courseId: c.courseId })),
      };
    }
    const teacher = await prisma.teacher.create({
      data,
      include: { courses: true },
    });
    res.status(201).json(teacher);
  } catch (error) {
    next(error);
  }
}

// Custom PUT (update teacher with courses)
async function customUpdateTeacher(req, res, next) {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, courses } = req.body;
    const data = { firstName, lastName, email, password };
    if (courses && Array.isArray(courses)) {
      data.courses = {
        create: courses.map((c) => ({ courseId: c.courseId })),
      };
    }
    const teacher = await prisma.teacher.update({
      where: { id },
      data,
      include: { courses: true },
    });
    res.status(200).json(teacher);
  } catch (error) {
    next(error);
  }
}

// Custom DELETE (delete teacher)
async function customDeleteTeacher(req, res, next) {
  try {
    const { id } = req.params;
    // Remove all CourseTeacher join records for this teacher
    await prisma.courseTeacher.deleteMany({
      where: { teacherId: id }
    });
    // Now delete the teacher
    const teacher = await prisma.teacher.delete({
      where: { id },
    });
    res.status(200).json(teacher);
  } catch (error) {
    next(error);
  }
}

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
  includeRelations : true,
  customActions: {
    post: customCreateTeacher,
    put: customUpdateTeacher,
    delete: customDeleteTeacher,
  }
}; 