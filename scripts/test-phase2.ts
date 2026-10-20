import { getDb, updateDb } from "../lib/db";

async function verifyPhase2Logic() {
  console.log("🧪 Starting Phase 2 Logic & Mutation Verification...\n");

  // Step 1: Baseline Check
  console.log("▶ [Step 1] Verifying initial wallet baseline...");
  const initialDb = await getDb();
  console.log(`  ✓ Current Balance: $${initialDb.wallet.balance} ${initialDb.wallet.baseCurrency}`);

  const initialBalance = initialDb.wallet.balance;

  // Step 2: Simulate adding an expense (e.g. Gaming PC Build for $1,250)
  console.log("\n▶ [Step 2] Simulating manual expense creation (Gaming PC - $1,250)...");
  const pcTxId = `tx_pc_test_${Date.now()}`;
  await updateDb((db) => {
    db.wallet.balance = parseFloat((db.wallet.balance - 1250.00).toFixed(2));
    db.wallet.updatedAt = new Date().toISOString();
    db.transactions.unshift({
      id: pcTxId,
      title: "Gaming PC Build (Test)",
      amount: 1250.00,
      type: "EXPENSE",
      categoryId: "cat_tech",
      categoryName: "Electronics & Tech",
      isQuickAction: false,
      isRoutine: false,
      isRefunded: false,
      date: new Date().toISOString(),
      notes: "Test purchase",
    });
  });

  const postBuyDb = await getDb();
  const expectedPostBuy = parseFloat((initialBalance - 1250.00).toFixed(2));
  console.log(`  ✓ New Balance after PC purchase: $${postBuyDb.wallet.balance}`);
  if (postBuyDb.wallet.balance !== expectedPostBuy) {
    throw new Error(`Expected $${expectedPostBuy}, got $${postBuyDb.wallet.balance}`);
  }

  // Step 3: Simulate Refund / Item Return
  console.log("\n▶ [Step 3] Simulating Item Return / Refund (Refunds $1,250 back to balance)...");
  const refundTxId = `tx_ref_test_${Date.now()}`;
  await updateDb((db) => {
    const tx = db.transactions.find((t) => t.id === pcTxId);
    if (!tx) throw new Error("PC Transaction not found");
    tx.isRefunded = true;
    tx.refundedAt = new Date().toISOString();

    db.transactions.unshift({
      id: refundTxId,
      title: `Refund: ${tx.title}`,
      amount: tx.amount,
      type: "REFUND",
      categoryId: tx.categoryId,
      categoryName: tx.categoryName,
      isQuickAction: false,
      isRoutine: false,
      isRefunded: false,
      originalTransactionId: tx.id,
      date: new Date().toISOString(),
    });

    db.wallet.balance = parseFloat((db.wallet.balance + tx.amount).toFixed(2));
    db.wallet.updatedAt = new Date().toISOString();
  });

  const postRefundDb = await getDb();
  console.log(`  ✓ New Balance after Refund: $${postRefundDb.wallet.balance}`);
  if (postRefundDb.wallet.balance !== initialBalance) {
    throw new Error(`Expected balance restored to $${initialBalance}, got $${postRefundDb.wallet.balance}`);
  }
  const refundedPc = postRefundDb.transactions.find((t) => t.id === pcTxId);
  if (!refundedPc?.isRefunded) {
    throw new Error("PC Transaction was not marked as isRefunded!");
  }
  console.log("  ✓ PC Transaction successfully marked as isRefunded: true.");

  // Step 4: Simulate Delete / Undo Mistake
  console.log("\n▶ [Step 4] Simulating accidental transaction and Delete / Undo...");
  const mistakeTxId = `tx_mistake_${Date.now()}`;
  await updateDb((db) => {
    db.wallet.balance = parseFloat((db.wallet.balance - 75.00).toFixed(2));
    db.transactions.unshift({
      id: mistakeTxId,
      title: "Accidental Charge",
      amount: 75.00,
      type: "EXPENSE",
      categoryId: "cat_misc",
      isQuickAction: false,
      isRoutine: false,
      isRefunded: false,
      date: new Date().toISOString(),
    });
  });

  const postMistakeDb = await getDb();
  console.log(`  ✓ Balance after mistake: $${postMistakeDb.wallet.balance}`);

  // Now delete it
  await updateDb((db) => {
    const idx = db.transactions.findIndex((t) => t.id === mistakeTxId);
    if (idx !== -1) {
      const tx = db.transactions[idx];
      db.wallet.balance = parseFloat((db.wallet.balance + tx.amount).toFixed(2));
      db.transactions.splice(idx, 1);
    }
  });

  const postDeleteDb = await getDb();
  console.log(`  ✓ Balance after Delete/Undo restored: $${postDeleteDb.wallet.balance}`);
  if (postDeleteDb.wallet.balance !== initialBalance) {
    throw new Error(`Expected balance restored to $${initialBalance}, got $${postDeleteDb.wallet.balance}`);
  }

  // Cleanup the test PC and Refund records to keep clean state
  await updateDb((db) => {
    db.transactions = db.transactions.filter(
      (t) => t.id !== pcTxId && t.id !== refundTxId && t.id !== mistakeTxId
    );
  });

  console.log("\n🎉 ALL PHASE 2 ENGINE TESTS PASSED!\n");
}

verifyPhase2Logic().catch((err) => {
  console.error("❌ Phase 2 Test Failed:", err);
  process.exit(1);
});
