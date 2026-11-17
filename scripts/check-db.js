// scripts/check-db.js
// Read-only database connection check for FarmiQ (TiDB Cloud / MySQL 8)

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Load .env.local if present, else .env
function loadEnv() {
  const envLocalPath = path.resolve(__dirname, "../.env.local");
  const envPath = path.resolve(__dirname, "../.env");
  const targetPath = fs.existsSync(envLocalPath) ? envLocalPath : (fs.existsSync(envPath) ? envPath : null);

  if (targetPath) {
    const lines = fs.readFileSync(targetPath, "utf-8").split("\n");
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
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

async function checkDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("=========================================");
  console.log("FarmiQ Database Connection Check (Step 1)");
  console.log("=========================================");

  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set in .env.local or .env.");
    console.log("Please create .env.local by copying .env.example and setting your DATABASE_URL.");
    console.log("Example for TiDB Cloud:");
    console.log("DATABASE_URL=\"mysql://<USER>:<PASSWORD>@<HOST>:4000/farmiq?sslaccept=strict\"");
    process.exit(1);
  }

  // Parse DATABASE_URL
  try {
    const url = new URL(dbUrl.replace(/^mysql:\/\//, "http://"));
    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 3306;
    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const database = url.pathname.replace(/^\//, "");
    const sslMode = url.searchParams.get("sslaccept");

    console.log(`Connecting to database at ${host}:${port}/${database} (User: ${user})...`);

    const connectionConfig = {
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000,
    };

    // TiDB Cloud requires TLS/SSL
    if (sslMode || host.includes("tidbcloud.com")) {
      connectionConfig.ssl = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      };
      console.log("🔒 TLS/SSL connection enabled.");
    }

    const connection = await mysql.createConnection(connectionConfig);
    console.log("✅ Successfully connected to MySQL / TiDB Cloud!");

    // Run read-only checks
    const [rows] = await connection.execute("SHOW TABLES;");
    const tableKey = Object.keys(rows[0] || {})[0];
    const tables = rows.map((r) => r[tableKey]);

    console.log(`Found ${tables.length} tables in database '${database}'.`);

    const expectedCoreTables = [
      "users",
      "sessions",
      "farms",
      "plots",
      "crop_master",
      "crops",
      "damage_reports",
      "inventory_items",
      "activities",
      "tasks",
      "notifications",
      "market_prices",
      "listings",
    ];

    const missing = expectedCoreTables.filter((t) => !tables.includes(t));
    if (missing.length === 0) {
      console.log("✅ All core FarmiQ tables are present in the database!");
    } else {
      console.warn(`⚠️ Note: The following expected tables were not found: ${missing.join(", ")}`);
      console.log("Make sure to execute farmiq_schema.sql in MySQL Workbench if you haven't yet.");
    }

    // Check crop_master starter rows
    if (tables.includes("crop_master")) {
      const [crops] = await connection.execute("SELECT COUNT(*) as count FROM crop_master;");
      console.log(`🌾 Starter crops in crop_master: ${crops[0].count} entries.`);
    }

    await connection.end();
    console.log("=========================================");
    console.log("Database connection test completed successfully.");
    console.log("=========================================");
  } catch (err) {
    console.error("❌ Failed to connect to database:");
    console.error(err.message);
    process.exit(1);
  }
}

checkDatabase();
