const { PrismaClient } = require("../prismaClient");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const seedData = async () => {
  try {
    console.log("🌱 Seeding all user types with Prisma...");

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedTeacherPassword = await bcrypt.hash("teacher123", 10);
    const hashedStudentPassword = await bcrypt.hash("student123", 10);
    const hashedParentPassword = await bcrypt.hash("parent123", 10);

    // Create Admin
    await prisma.admin.create({
      data: {
        firstName: "Super",
        lastName: "Admin",
        email: "admin@example.com",
        password: hashedAdminPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create Teacher
    await prisma.teacher.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "teacher@example.com",
        password: hashedTeacherPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create Class
    const createdClass = await prisma.class.create({
      data: {
        name: "Grade 10",
        section: "A",
      },
    });

    // Create Student
    await prisma.student.create({
      data: {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@student.com",
        code: "1378/14",
        password: hashedStudentPassword,
        classId: createdClass.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create Parent
    await prisma.parent.create({
      data: {
        firstName: "Robert",
        lastName: "Johnson",
        email: "parent@example.com",
        password: hashedParentPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("✅ All user types seeding completed with Prisma.");
    console.log("📋 Test Credentials:");
    console.log("  Admin: admin@example.com / admin123");
    console.log("  Teacher: teacher@example.com / teacher123");
    console.log("  Student: alice@student.com / student123 (or use Student ID: 1378/14)");
    console.log("  Parent: parent@example.com / parent123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
