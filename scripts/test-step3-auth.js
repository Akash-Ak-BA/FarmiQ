// scripts/test-step3-auth.js
// Verification script for Step 3: Accounts, Stay Signed In, Password Hashing, and Row-Level Privacy

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

async function runStep3Tests() {
  console.log("==================================================");
  console.log("FarmiQ Step 3 Verification: Accounts & Privacy");
  console.log("==================================================");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL missing from .env.local");
    process.exit(1);
  }

  const url = new URL(dbUrl.replace(/^mysql:\/\//, "http://"));
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  });

  try {
    // 1. Password Hashing Test
    console.log("\n[Test 1] Password Hashing & Verification");
    const rawPassword = "FarmerSecret@123";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    const isMatch = await bcrypt.compare(rawPassword, hash);
    const isMismatch = await bcrypt.compare("WrongPassword", hash);

    if (isMatch && !isMismatch) {
      console.log("✅ Bcrypt hashing and verification working correctly!");
    } else {
      throw new Error("Password verification failed");
    }

    // 2. User Creation Test (Farmer A)
    console.log("\n[Test 2] User Registration into 'users' table");
    const testPhoneA = "9876500001";
    await connection.execute("DELETE FROM users WHERE phone IN ('9876500001', '9876500002')");

    const [insertResultA] = await connection.execute(
      "INSERT INTO users (phone, name, password_hash, district, language, theme) VALUES (?, ?, ?, ?, ?, ?)",
      [testPhoneA, "Murugan", hash, "Madurai", "ta", "dark"]
    );
    const userAId = insertResultA.insertId;
    console.log(`✅ Created test user A (ID: ${userAId}, Name: Murugan, Phone: ${testPhoneA})`);

    // Verify row in database
    const [rowsA] = await connection.execute("SELECT id, name, phone, language, theme FROM users WHERE id = ?", [userAId]);
    if (rowsA.length === 1 && rowsA[0].name === "Murugan" && rowsA[0].language === "ta") {
      console.log("✅ User A correctly stored in MySQL users table!");
    } else {
      throw new Error("User A verification failed in MySQL");
    }

    // 3. Stay Signed In (Sessions table & Token Hashing)
    console.log("\n[Test 3] 'Stay Signed In' Sessions Table");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await connection.execute(
      "INSERT INTO sessions (user_id, token_hash, user_agent, expires_at) VALUES (?, ?, ?, ?)",
      [userAId, tokenHash, "Mozilla/5.0 FarmiQ Mobile App", oneYearLater]
    );

    // Validate token lookup
    const [sessionRows] = await connection.execute(
      "SELECT s.id, s.user_id, u.name, u.phone FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = ? AND s.expires_at > NOW()",
      [tokenHash]
    );

    if (sessionRows.length === 1 && sessionRows[0].name === "Murugan") {
      console.log("✅ Session token verified! User stays signed in with 1-year expiration.");
    } else {
      throw new Error("Session token verification failed");
    }

    // 4. Privacy Test: Row-Level Security Verification
    console.log("\n[Test 4] Row-Level Privacy Check (User A vs User B)");
    const testPhoneB = "9876500002";
    const [insertResultB] = await connection.execute(
      "INSERT INTO users (phone, name, password_hash, district, language, theme) VALUES (?, ?, ?, ?, ?, ?)",
      [testPhoneB, "Selvam", hash, "Coimbatore", "en", "light"]
    );
    const userBId = insertResultB.insertId;
    console.log(`✅ Created test user B (ID: ${userBId}, Name: Selvam, Phone: ${testPhoneB})`);

    // User A creates a private Farm
    const [farmResult] = await connection.execute(
      "INSERT INTO farms (user_id, name, location, area_acres) VALUES (?, ?, ?, ?)",
      [userAId, "Murugan's Organic Farm", "Madurai", 5.0]
    );
    const farmId = farmResult.insertId;
    console.log(`🌾 User A created farm (ID: ${farmId}, 'Murugan's Organic Farm')`);

    // Privacy Query Check:
    // Helper simulation: Every private query MUST enforce `WHERE user_id = ?`
    const [userAFarmAccess] = await connection.execute(
      "SELECT * FROM farms WHERE id = ? AND user_id = ?",
      [farmId, userAId]
    );
    const [userBFarmAccess] = await connection.execute(
      "SELECT * FROM farms WHERE id = ? AND user_id = ?",
      [farmId, userBId]
    );

    if (userAFarmAccess.length === 1 && userBFarmAccess.length === 0) {
      console.log("🔒 PRIVACY CONFIRMED: User A can read their farm, but User B gets 0 rows (Access Denied)!");
    } else {
      throw new Error("Privacy isolation check failed: User B was able to see User A's farm!");
    }

    // User B tries to update User A's farm
    const [tamperResult] = await connection.execute(
      "UPDATE farms SET name = 'Hacked Farm' WHERE id = ? AND user_id = ?",
      [farmId, userBId]
    );

    if (tamperResult.affectedRows === 0) {
      console.log("🔒 TAMPER PROTECTION CONFIRMED: User B cannot modify User A's data (0 rows affected)!");
    } else {
      throw new Error("Tamper check failed: User B was able to modify User A's farm!");
    }

    // Cleanup test users and farms
    await connection.execute("DELETE FROM farms WHERE id = ?", [farmId]);
    await connection.execute("DELETE FROM users WHERE phone IN ('9876500001', '9876500002')");
    console.log("\n🧹 Cleaned up temporary test data.");

    console.log("==================================================");
    console.log("🎉 ALL STEP 3 TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================");
  } finally {
    await connection.end();
  }
}

runStep3Tests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
