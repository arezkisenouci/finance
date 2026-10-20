import { getDb, updateDb, writeDb } from "../lib/db";
import { createBackup, listBackups } from "../lib/backup";
import { RoutineSchema } from "../types/database";

async function runTests() {
  console.log("🧪 Starting Atomic JSON Database Tests...\n");

  // Test 1: Get or initialize database
  console.log("▶ [Test 1] Initializing and reading database...");
  const db = await getDb();
  console.log(`  ✓ Database loaded successfully.`);
  console.log(`  ✓ Current Wallet Balance: $${db.wallet.balance} ${db.wallet.baseCurrency}`);
  console.log(`  ✓ Active Categories: ${db.categories.length}`);
  console.log(`  ✓ Active Routines: ${db.routines.length}`);

  if (db.wallet.balance !== 3840.50) {
    throw new Error(`Expected balance 3840.50, got ${db.wallet.balance}`);
  }

  // Test 2: Atomic Update
  console.log("\n▶ [Test 2] Testing atomic transaction mutation...");
  const testTxId = "tx_test_audit";
  await updateDb((currentDb) => {
    currentDb.wallet.balance -= 50;
    currentDb.transactions.push({
      id: testTxId,
      title: "Test Coffee Machine Descaler",
      amount: 50.00,
      type: "EXPENSE",
      categoryId: "cat_misc",
      isQuickAction: false,
      isRoutine: false,
      isRefunded: false,
      date: new Date().toISOString(),
    });
  });

  const mutatedDb = await getDb();
  if (mutatedDb.wallet.balance !== 3790.50) {
    throw new Error(`Expected balance 3790.50 after deduction, got ${mutatedDb.wallet.balance}`);
  }
  const foundTx = mutatedDb.transactions.find((t) => t.id === testTxId);
  if (!foundTx) {
    throw new Error("Failed to find appended test transaction in database!");
  }
  console.log("  ✓ Atomic balance deduction verified: $3790.50");
  console.log("  ✓ Transaction record safely appended and verified on disk.");

  // Test 3: Zod Schema Rejection
  console.log("\n▶ [Test 3] Testing Zod schema validation (malformed data rejection)...");
  let caughtZodError = false;
  try {
    RoutineSchema.parse({
      id: "invalid_routine",
      title: "Bad Routine",
      cost: -10, // Invalid: must be positive
      currency: "USD",
      categoryId: "cat_habits",
      frequency: "DAILY",
      reminderTime: "20:00",
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    caughtZodError = true;
    console.log("  ✓ Zod successfully rejected negative cost as expected.");
  }
  if (!caughtZodError) {
    throw new Error("Zod schema failed to reject negative routine cost!");
  }

  // Test 4: Backup creation
  console.log("\n▶ [Test 4] Testing automated backup generation...");
  const backupFile = await createBackup("phase1-verify");
  console.log(`  ✓ Created backup snapshot: ${backupFile}`);
  const backups = await listBackups();
  console.log(`  ✓ Total backup snapshots stored: ${backups.length}`);

  // Clean up: Revert test transaction to keep seed pristine
  console.log("\n▶ [Cleanup] Reverting test transaction to restore baseline seed...");
  await updateDb((currentDb) => {
    currentDb.wallet.balance += 50;
    currentDb.transactions = currentDb.transactions.filter((t) => t.id !== testTxId);
  });
  const cleanDb = await getDb();
  console.log(`  ✓ Restored baseline balance: $${cleanDb.wallet.balance} USD`);

  console.log("\n🎉 ALL PHASE 1 DATABASE TESTS PASSED SUCCESSFULLY!\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
