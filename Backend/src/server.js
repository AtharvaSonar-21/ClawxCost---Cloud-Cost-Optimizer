import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import { validateEnv } from "./utils/env-validator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Validate critical environment configuration
validateEnv();

const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = String(process.env.JWT_SECRET || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');


async function seedDefaultAdmin() {
  try {
    const adminEmail = "admin@clawxcost.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("ClawxCostAdmin2026!", 10);
      await User.create({
        email: adminEmail,
        name: "ClawxCost Administrator",
        passwordHash,
        role: "admin",
      });
      console.log("🔐 Default Admin user seeded successfully: admin@clawxcost.com / ClawxCostAdmin2026!");
    } else {
      console.log("🔐 Default Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Failed to seed default admin user:", error.message);
  }
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // Seed default admin user
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
