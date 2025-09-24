require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ DB connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });

const createTestUsers = async () => {
  try {
    // Create Trainer User
    const trainerExists = await User.findOne({ email: "trainer@example.com" });
    if (!trainerExists) {
      const trainerPassword = await bcrypt.hash("trainer123", 10);
      const trainer = new User({
        name: "Test Trainer",
        email: "trainer@example.com",
        password: trainerPassword,
        phone: "8888888888",
        role: "trainer",
      });
      await trainer.save();
      console.log("✅ Trainer user created: trainer@example.com / trainer123");
    } else {
      console.log("⚠️ Trainer already exists");
    }

    // Create Regular User
    const userExists = await User.findOne({ email: "user@example.com" });
    if (!userExists) {
      const userPassword = await bcrypt.hash("user123", 10);
      const user = new User({
        name: "Test User",
        email: "user@example.com",
        password: userPassword,
        phone: "7777777777",
        role: "user",
      });
      await user.save();
      console.log("✅ Regular user created: user@example.com / user123");
    } else {
      console.log("⚠️ Regular user already exists");
    }

    console.log("\n🎉 Test users created successfully!");
    console.log("📝 Available test accounts:");
    console.log("👑 Admin: admin@example.com / admin123");
    console.log("🏋️ Trainer: trainer@example.com / trainer123");
    console.log("👤 User: user@example.com / user123");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating test users:", err);
    process.exit(1);
  }
};

// Run the script
createTestUsers().catch(err => {
  console.error("❌ Error in createTestUsers:", err);
  process.exit(1);
});