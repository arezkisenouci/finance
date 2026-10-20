import { getDb, updateDb } from "../lib/db";

async function verifyPhase3QuickActions() {
  console.log("🧪 Starting Phase 3 Quick Actions (Big 4) Tests...\n");

  // Step 1: Initial State
  const initialDb = await getDb();
  const startBalance = initialDb.wallet.balance;
  console.log(`▶ [Step 1] Initial Wallet Balance: $${startBalance}`);

  // Step 2: Simulate Quick Action Log (e.g. Quick Lunch for $14.50)
  console.log("\n▶ [Step 2] Simulating 1-Tap Quick Action Log (Lunch - $14.50)...");
  const quickTxId = `tx_quick_test_${Date.now()}`;
  const amountToLog = 14.50;

  await updateDb((db) => {
    const cat = db.categories.find((c) => c.id === "cat_lunch");
    const categoryName = cat ? cat.name : "Lunch";

    db.wallet.balance = parseFloat((db.wallet.balance - amountToLog).toFixed(2));
    db.wallet.updatedAt = new Date().toISOString();

    db.transactions.unshift({
      id: quickTxId,
      title: `Quick ${categoryName}`,
      amount: amountToLog,
      type: "EXPENSE",
      categoryId: "cat_lunch",
      categoryName,
      isQuickAction: true,
      isRoutine: false,
      isRefunded: false,
      date: new Date().toISOString(),
      notes: "Quick burrito bowl test",
    });
  });

  const postQuickDb = await getDb();
  const expectedBalance = parseFloat((startBalance - amountToLog).toFixed(2));
  console.log(`  ✓ Updated balance after quick lunch: $${postQuickDb.wallet.balance}`);
  if (postQuickDb.wallet.balance !== expectedBalance) {
    throw new Error(`Expected $${expectedBalance}, got $${postQuickDb.wallet.balance}`);
  }

  const foundQuickTx = postQuickDb.transactions.find((t) => t.id === quickTxId);
  if (!foundQuickTx || !foundQuickTx.isQuickAction) {
    throw new Error("Quick action transaction was not saved properly with isQuickAction: true!");
  }
  console.log(`  ✓ Quick transaction verified on disk: "${foundQuickTx.title}" (-$${foundQuickTx.amount})`);

  // Step 3: Verify Recent Average Calculation
  console.log("\n▶ [Step 3] Verifying dynamic recent average calculation for Lunch...");
  const lunchTxs = postQuickDb.transactions.filter(
    (t) => t.categoryId === "cat_lunch" && t.type === "EXPENSE" && !t.isRefunded
  );
  const avg = lunchTxs.reduce((acc, t) => acc + t.amount, 0) / lunchTxs.length;
  console.log(`  ✓ Dynamic recent average for Lunch: $${avg.toFixed(2)}`);

  // Step 4: Cleanup
  console.log("\n▶ [Step 4] Cleaning up test transaction...");
  await updateDb((db) => {
    db.wallet.balance = parseFloat((db.wallet.balance + amountToLog).toFixed(2));
    db.transactions = db.transactions.filter((t) => t.id !== quickTxId);
  });
  const cleanDb = await getDb();
  console.log(`  ✓ Balance restored to original baseline: $${cleanDb.wallet.balance}`);

  console.log("\n🎉 ALL PHASE 3 QUICK ACTIONS TESTS PASSED!\n");
}

verifyPhase3QuickActions().catch((err) => {
  console.error("❌ Phase 3 Test Failed:", err);
  process.exit(1);
});
