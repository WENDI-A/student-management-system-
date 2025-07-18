const { PrismaClient } = require("../prismaClient");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const seedData = async () => {
  try {
    console.log("🌱 Seeding Admin and Teacher with Prisma...");

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedTeacherPassword = await bcrypt.hash("teacher123", 10);

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

    console.log("✅ Admin and Teacher seeding completed with Prisma.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
