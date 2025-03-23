const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");
const db = require("../models"); // Ensure correct path to your models

const seedAdmin = async () => {
  try {
    console.log("🌱 Seeding Admin...");

    const hashedPassword = await bcrypt.hash("admin123", 10); // Default password

    await db.Admin.create({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@example.com",
      password: hashedPassword, // Add hashed password
      role: "Admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Admin seeding completed.");
    process.exit(0); // Exit process after completion
  } catch (error) {
    console.error("❌ Error seeding Admin:", error);
    process.exit(1);
  }
};

seedAdmin();
