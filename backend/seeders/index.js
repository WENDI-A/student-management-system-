const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");
const db = require("../models"); // Ensure correct path to your models

const seedData = async () => {
  try {
    console.log("🌱 Seeding Admin and Teacher...");

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedTeacherPassword = await bcrypt.hash("teacher123", 10);

    // Create Admin
    await db.Admin.create({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@example.com",
      password: hashedAdminPassword,
      role: "Admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create Teacher
    await db.Teacher.create({
      firstName: "John",
      lastName: "Doe",
      email: "teacher@example.com",
      password: hashedTeacherPassword,
      grade: "Grade 5",
      specialization: "Mathematics",
      joinDate: new Date(),
      position: "Senior Teacher",
      phone: "123456789",
      isActive: true,
      role: "teacher",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Admin and Teacher seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
