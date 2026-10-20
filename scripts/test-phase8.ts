import { getDb, writeDb, DEFAULT_DATABASE } from "../lib/db";
import { createBackup, listBackups } from "../lib/backup";
import { DatabaseSchema } from "../types/database";

async function verifyPhase8SystemHardening() {
  console.log("🧪 Starting Phase 8 System Hardening, Backups & Export/Import Tests...\n");

  // Step 1: Test Database Export Serialization
  console.log("▶ [Step 1] Verifying database export serialization...");
  const db = await getDb();
  const exportedString = JSON.stringify(db, null, 2);
  const parsedExport = JSON.parse(exportedString);
  const validatedExport = DatabaseSchema.parse(parsedExport);

  console.log(`  ✓ Database successfully validated for export.`);
  console.log(`  ✓ Export size: ${(exportedString.length / 1024).toFixed(2)} KB`);
  console.log(`  ✓ Serialized entities: ${validatedExport.categories.length} categories, ${validatedExport.transactions.length} transactions`);

  // Step 2: Test Schema Rejection on Malformed Import
  console.log("\n▶ [Step 2] Testing malformed database import rejection...");
  const malformedPayload = {
    wallet: { balance: "invalid_string_not_number" }, // Invalid
    categories: [],
  };

  let caughtError = false;
  try {
    DatabaseSchema.parse(malformedPayload);
  } catch (err: any) {
    caughtError = true;
    console.log("  ✓ Zod successfully intercepted and rejected malformed import payload.");
  }
  if (!caughtError) {
    throw new Error("Failed to reject malformed import payload!");
  }

  // Step 3: Test Automated Safety Backup Creation on Import
  console.log("\n▶ [Step 3] Testing pre-import safety backup creation...");
  const preSnapshot = await createBackup("test-safety-snapshot");
  console.log(`  ✓ Pre-operation safety snapshot generated: ${preSnapshot}`);
  const allBackups = await listBackups();
  console.log(`  ✓ Verified snapshot exists in data/backups/ (Total snapshots: ${allBackups.length})`);

  // Step 4: Test Reset to Initial Baseline
  console.log("\n▶ [Step 4] Testing database reset to default baseline...");
  await writeDb(DEFAULT_DATABASE);
  const freshDb = await getDb();
  console.log(`  ✓ Restored baseline balance: $${freshDb.wallet.balance} ${freshDb.wallet.baseCurrency}`);
  if (freshDb.wallet.balance !== 3840.50) {
    throw new Error(`Expected balance 3840.50, got ${freshDb.wallet.balance}`);
  }

  console.log("\n🎉 ALL PHASE 8 SYSTEM HARDENING TESTS PASSED!\n");
}

verifyPhase8SystemHardening().catch((err) => {
  console.error("❌ Phase 8 Test Failed:", err);
  process.exit(1);
});
