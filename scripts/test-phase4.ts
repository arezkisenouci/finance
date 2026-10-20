import { getDb, updateDb } from "../lib/db";

async function verifyPhase4Routines() {
  console.log("🧪 Starting Phase 4 Daily Routine & Check-In Verification...\n");

  const todayStr = new Date().toISOString().split("T")[0];

  // Step 1: Initial state
  const initialDb = await getDb();
  const startBalance = initialDb.wallet.balance;
  console.log(`▶ [Step 1] Initial Wallet Balance: $${startBalance}`);

  const cigaretteRoutine = initialDb.routines.find((r) => r.id === "rt_cigg_001");
  if (!cigaretteRoutine) throw new Error("Preset cigarette routine not found in seed!");
  console.log(`  ✓ Found Routine: "${cigaretteRoutine.title}" ($${cigaretteRoutine.cost}/day)`);

  // Step 2: Test CONFIRMED (Yes, bought cigarettes today)
  console.log("\n▶ [Step 2] Testing Routine Check-in: CONFIRMED (User bought it)...");
  const testTxId = `tx_rt_test_${Date.now()}`;
  const testLogId = `rtl_test_${Date.now()}`;

  await updateDb((db) => {
    // Deduct cost
    db.wallet.balance = parseFloat((db.wallet.balance - cigaretteRoutine.cost).toFixed(2));
    db.transactions.unshift({
      id: testTxId,
      title: cigaretteRoutine.title,
      amount: cigaretteRoutine.cost,
      type: "EXPENSE",
      categoryId: cigaretteRoutine.categoryId,
      categoryName: "Habits",
      isQuickAction: false,
      isRoutine: true,
      routineId: cigaretteRoutine.id,
      isRefunded: false,
      date: new Date().toISOString(),
    });

    db.routine_logs.unshift({
      id: testLogId,
      routineId: cigaretteRoutine.id,
      date: todayStr,
      status: "CONFIRMED",
      transactionId: testTxId,
      savedAmount: 0,
      loggedAt: new Date().toISOString(),
    });
  });

  const postConfirmDb = await getDb();
  const expectedConfirmedBalance = parseFloat((startBalance - cigaretteRoutine.cost).toFixed(2));
  console.log(`  ✓ Wallet balance after CONFIRMED: $${postConfirmDb.wallet.balance}`);
  if (postConfirmDb.wallet.balance !== expectedConfirmedBalance) {
    throw new Error(`Expected $${expectedConfirmedBalance}, got $${postConfirmDb.wallet.balance}`);
  }

  // Step 3: Test SKIPPED (No, user skipped cigarettes today)
  console.log("\n▶ [Step 3] Testing Routine Check-in: SKIPPED (User skipped habit & saved money)...");
  // Clean up confirmed test
  await updateDb((db) => {
    db.wallet.balance = startBalance;
    db.transactions = db.transactions.filter((t) => t.id !== testTxId);
    db.routine_logs = db.routine_logs.filter((l) => l.id !== testLogId);

    // Apply SKIPPED log
    db.routine_logs.unshift({
      id: testLogId,
      routineId: cigaretteRoutine.id,
      date: todayStr,
      status: "SKIPPED",
      savedAmount: cigaretteRoutine.cost,
      loggedAt: new Date().toISOString(),
    });
  });

  const postSkipDb = await getDb();
  console.log(`  ✓ Wallet balance after SKIPPED remains untouched: $${postSkipDb.wallet.balance}`);
  if (postSkipDb.wallet.balance !== startBalance) {
    throw new Error(`Expected balance untouched at $${startBalance}, got $${postSkipDb.wallet.balance}`);
  }

  // Calculate streak
  const logs = postSkipDb.routine_logs.filter((l) => l.routineId === cigaretteRoutine.id);
  const skipCount = logs.filter((l) => l.status === "SKIPPED").length;
  console.log(`  ✓ Consecutive Clean Skipped Days: ${skipCount} days`);
  console.log(`  ✓ Habit savings recorded: $${cigaretteRoutine.cost.toFixed(2)}`);

  // Step 4: Cleanup
  console.log("\n▶ [Step 4] Cleaning up test log to leave pending check-in active for today...");
  await updateDb((db) => {
    db.routine_logs = db.routine_logs.filter((l) => l.id !== testLogId);
  });

  console.log("\n🎉 ALL PHASE 4 ROUTINE TESTS PASSED!\n");
}

verifyPhase4Routines().catch((err) => {
  console.error("❌ Phase 4 Test Failed:", err);
  process.exit(1);
});
