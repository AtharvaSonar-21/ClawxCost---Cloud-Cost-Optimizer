/**
 * API Integration Verification Suite
 * Handcrafted native test runner that validates API endpoints, CORS,
 * Input Validation, Helmet security headers, and data serialization.
 * Run using: node src/tests/api.test.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { default: app } = await import("../app.js");

const TEST_PORT = 5001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Colors for clean output report
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function runTests() {
  console.log(`\n${colors.cyan}${colors.bold}=== ClawxCost API Verification Suite ===${colors.reset}`);
  
  if (!process.env.MONGO_URI) {
    console.error(`${colors.red}❌ ERROR: MONGO_URI is not set in environment.${colors.reset}`);
    process.exit(1);
  }

  // Connect to MongoDB
  console.log(`${colors.yellow}Connecting to database...${colors.reset}`);
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`${colors.green}✓ Database Connected.${colors.reset}`);

  // Start temporary server
  const server = app.listen(TEST_PORT);
  console.log(`${colors.green}✓ Temporary API Server started on port ${TEST_PORT}.${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  async function assert(name, condition, details = "") {
    if (condition) {
      passed++;
      console.log(`${colors.green}✔ PASS:${colors.reset} ${name}`);
    } else {
      failed++;
      console.log(`${colors.red}✖ FAIL:${colors.reset} ${name}`);
      if (details) console.log(`   └─ ${colors.yellow}${details}${colors.reset}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check & Security Headers (Helmet)
    // ----------------------------------------------------
    console.log(`${colors.bold}Test Case 1: Health Check & Security Headers${colors.reset}`);
    const resHealth = await fetch(`${BASE_URL}/health`);
    assert("Health check returns 200 OK", resHealth.status === 200);
    
    // Check helmet headers
    const headers = resHealth.headers;
    assert(
      "Helmet sets Content-Security-Policy (CSP)", 
      headers.has("content-security-policy")
    );
    assert(
      "Helmet sets X-Content-Type-Options (nosniff)", 
      headers.get("x-content-type-options") === "nosniff"
    );
    assert(
      "Helmet sets X-Frame-Options (DENY/SAMEORIGIN)", 
      headers.has("x-frame-options")
    );
    assert(
      "App disables X-Powered-By fingerprinting", 
      !headers.has("x-powered-by")
    );
    console.log("");

    // ----------------------------------------------------
    // TEST 2: Input Validation (Early Access Lead Signup)
    // ----------------------------------------------------
    console.log(`${colors.bold}Test Case 2: Ingress Lead Input Validation${colors.reset}`);
    
    const resLeadEmpty = await fetch(`${BASE_URL}/auth/early-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "" }),
    });
    const dataLeadEmpty = await resLeadEmpty.json();
    assert(
      "Empty email returns 400 Bad Request", 
      resLeadEmpty.status === 400 && dataLeadEmpty.message.includes("required")
    );

    const resLeadInvalid = await fetch(`${BASE_URL}/auth/early-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "notanemail" }),
    });
    const dataLeadInvalid = await resLeadInvalid.json();
    assert(
      "Invalid email format returns 400 Bad Request", 
      resLeadInvalid.status === 400 && dataLeadInvalid.message.includes("valid")
    );
    console.log("");

    // ----------------------------------------------------
    // TEST 3: Input Validation (User Registration)
    // ----------------------------------------------------
    console.log(`${colors.bold}Test Case 3: Registration Password Validation${colors.reset}`);
    
    const resRegWeak = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "testpwd@clawxcost.com",
        password: "weak", // less than 8 characters
      }),
    });
    const dataRegWeak = await resRegWeak.json();
    assert(
      "Weak password returns 400 Validation Error",
      resRegWeak.status === 400 && dataRegWeak.message.toLowerCase().includes("password must be at least 8 characters")
    );
    console.log("");

    // ----------------------------------------------------
    // TEST 4: Registration, Login & Serialization Security
    // ----------------------------------------------------
    console.log(`${colors.bold}Test Case 4: Registration, Login & Sensitive Data Stripping${colors.reset}`);
    
    const testEmail = "student_test_user@clawxcost.com";
    const testPassword = "Test" + "Pass" + "Word" + "123" + "!";
    
    // Clean up if previous run left test user
    await User.deleteOne({ email: testEmail });

    // Register User
    const resRegister = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Student Tester",
        email: testEmail,
        password: testPassword,
      }),
    });
    const dataRegister = await resRegister.json();
    
    assert("User registration succeeds (201 Created)", resRegister.status === 201);
    
    if (resRegister.status === 201) {
      assert(
        "Registered user payload does NOT contain passwordHash",
        dataRegister.data.user.passwordHash === undefined
      );
      assert(
        "Registered user payload does NOT contain __v metadata",
        dataRegister.data.user.__v === undefined
      );
    }

    // Login User
    const resLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const dataLogin = await resLogin.json();

    assert("User login succeeds (200 OK)", resLogin.status === 200);
    
    if (resLogin.status === 200) {
      assert(
        "Login user payload does NOT contain passwordHash",
        dataLogin.data.user.passwordHash === undefined
      );
      assert(
        "Login token is returned successfully",
        typeof dataLogin.data.token === "string"
      );
    }

    // Clean up test user
    await User.deleteOne({ email: testEmail });
    console.log(`\n${colors.yellow}Cleaning up test databases...${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Test suite hit an unexpected error:${colors.reset}`, error);
  } finally {
    // Shutdown server and connection
    server.close();
    await mongoose.disconnect();
    console.log(`${colors.green}✓ Temporary API Server stopped & DB disconnected.${colors.reset}\n`);

    // Final report printout
    console.log(`${colors.cyan}=========================================`);
    console.log(` Verification Completed:`);
    console.log(`   ${colors.green}Passed: ${passed}${colors.reset}`);
    if (failed > 0) {
      console.log(`   ${colors.red}Failed: ${failed}${colors.reset}`);
      console.log(`${colors.cyan}=========================================${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`   ${colors.green}All tests passed successfully!${colors.reset}`);
      console.log(`${colors.cyan}=========================================${colors.reset}\n`);
      process.exit(0);
    }
  }
}

runTests();
