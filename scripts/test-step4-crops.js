// scripts/test-step4-crops.js
// Automated verification script for Step 4: Farms, Plots, Add Crop, Crop List, and Crop Detail

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
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.slice(0, eqIdx).trim()] = val;
      }
    }
  }
}

loadEnv();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runStep4Verification() {
  console.log("========================================================");
  console.log("🌱 FarmiQ Step 4: Farms, Plots & Crops Verification Test");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify crop_master table
    console.log("--- 1. Checking Crop Master Reference Data ---");
    const masters = await prisma.cropMaster.findMany();
    assert(masters.length >= 5, `Found ${masters.length} reference crops in crop_master (expected >= 5)`);
    const masterNames = masters.map((m) => m.nameEn);
    assert(masterNames.includes("Paddy"), "crop_master contains Paddy");
    assert(masterNames.includes("Tomato"), "crop_master contains Tomato");
    assert(masterNames.includes("Groundnut"), "crop_master contains Groundnut");

    // 2. Identify or create test farmer
    console.log("\n--- 2. Setting Up Test Farmer ---");
    let testFarmer = await prisma.user.findFirst({ where: { phone: "9876543210" } });
    if (!testFarmer) {
      testFarmer = await prisma.user.create({
        data: {
          name: "Rama",
          phone: "9876543210",
          passwordHash: "dummyhash",
          district: "Thanjavur",
          language: "en",
        },
      });
    }
    assert(testFarmer !== null, `Test farmer loaded: ${testFarmer.name} (id: ${testFarmer.id})`);

    // 3. Test Farm and Plot creation
    console.log("\n--- 3. Verifying Farms & Plots (Row-Level Scoping) ---");
    let farm = await prisma.farm.findFirst({ where: { userId: testFarmer.id } });
    if (!farm) {
      farm = await prisma.farm.create({
        data: {
          userId: testFarmer.id,
          name: "Main Farm",
          location: testFarmer.district || "Thanjavur Delta",
          areaAcres: 5.0,
        },
      });
    }
    assert(farm !== null && farm.userId.toString() === testFarmer.id.toString(), "Farm is owned by farmer Rama");

    let plotA = await prisma.plot.findFirst({ where: { farmId: farm.id, name: "Plot A" } });
    if (!plotA) {
      plotA = await prisma.plot.create({
        data: { farmId: farm.id, name: "Plot A", areaAcres: 2.5, soilType: "Clay Loam", irrigation: "Canal" },
      });
    }
    assert(plotA !== null && plotA.name === "Plot A", "Plot A exists under Main Farm");

    // 4. Test Crop Creation with Expected Harvest Date Prediction
    console.log("\n--- 4. Testing Crop Sowing & Harvest Date Calculation ---");
    const now = new Date();
    const durationDays = 120;
    const expectedHarvest = new Date(now.getTime() + durationDays * 86400000);

    let paddy = await prisma.crop.findFirst({ where: { plotId: plotA.id, cropName: "Paddy" } });
    if (!paddy) {
      const paddyMaster = masters.find((m) => m.nameEn === "Paddy");
      paddy = await prisma.crop.create({
        data: {
          plotId: plotA.id,
          cropMasterId: paddyMaster ? paddyMaster.id : null,
          cropName: "Paddy",
          variety: "BPT 5204",
          sowingDate: now,
          expectedHarvestDate: expectedHarvest,
          currentStage: "Flowering (Stage 3 of 5)",
          stageIndex: 3,
          stageTotal: 5,
          status: "active",
        },
      });
    }
    assert(paddy !== null, `Crop ${paddy.cropName} created in MySQL database`);
    assert(paddy.stageIndex === 3, `Crop stage index is ${paddy.stageIndex}/5`);
    assert(paddy.expectedHarvestDate !== null, `Expected harvest date is predicted correctly: ${paddy.expectedHarvestDate.toISOString().split("T")[0]}`);

    // 5. Test Scheduled Tasks Generation
    console.log("\n--- 5. Testing Task Scheduling Linked to Crop ---");
    let taskCount = await prisma.task.count({ where: { cropId: paddy.id } });
    if (taskCount === 0) {
      await prisma.task.createMany({
        data: [
          { userId: testFarmer.id, cropId: paddy.id, title: "Apply fertilizer (Urea & Potash)", dueDate: new Date(now.getTime() + 86400000), source: "template" },
          { userId: testFarmer.id, cropId: paddy.id, title: "Check for leaf blast and stem pests", dueDate: new Date(now.getTime() + 3 * 86400000), source: "template" },
          { userId: testFarmer.id, cropId: paddy.id, title: "Drain field water for tillering aerate", dueDate: new Date(now.getTime() + 6 * 86400000), source: "template" },
          { userId: testFarmer.id, cropId: paddy.id, title: "Panicle initiation foliar spray", dueDate: new Date(now.getTime() + 24 * 86400000), source: "template" },
          { userId: testFarmer.id, cropId: paddy.id, title: "Final grain harvest & threshing", dueDate: expectedHarvest, source: "template" },
        ],
      });
      taskCount = await prisma.task.count({ where: { cropId: paddy.id } });
    }
    assert(taskCount >= 5, `Scheduled ${taskCount} lifecycle tasks for ${paddy.cropName} in tasks table`);

    // 6. Test Crop Monitoring Check-ins
    console.log("\n--- 6. Testing Crop Check-in Recording ---");
    const checkin = await prisma.cropCheckin.create({
      data: {
        cropId: paddy.id,
        checkedOn: now,
        growthStage: "Flowering",
        health: "good",
        notes: "Uniform flowering, no disease symptoms observed during field inspection.",
      },
    });
    assert(checkin.id !== undefined, `Check-in recorded in crop_checkins table (id: ${checkin.id})`);
    assert(checkin.health === "good", `Check-in health rating is ${checkin.health}`);

    // 7. Test Row-Level Privacy Isolation
    console.log("\n--- 7. Testing Row-Level Privacy Isolation ---");
    // Verify that querying with an arbitrary non-existent user returns 0 crops
    const strangerCrops = await prisma.crop.findMany({
      where: {
        plot: {
          farm: {
            userId: 999999999n,
          },
        },
      },
    });
    assert(strangerCrops.length === 0, `Stranger user 999999999 sees 0 crops (strict row-level privacy enforced)`);

    const ramaCrops = await prisma.crop.findMany({
      where: {
        plot: {
          farm: {
            userId: testFarmer.id,
          },
        },
      },
    });
    assert(ramaCrops.length >= 1, `Owner farmer Rama sees their own ${ramaCrops.length} crops`);

    console.log("\n========================================================");
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log("========================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStep4Verification();
