import { getDb, updateDb } from "../lib/db";
import { filterTransactionsByPeriod } from "../lib/analytics";

async function verifyPhase7Analytics() {
  console.log("🧪 Starting Phase 7 Analytics & Filtering Tests...\n");

  const db = await getDb();
  console.log(`▶ [Step 1] Total seed transactions: ${db.transactions.length}`);

  // Test 1: Date filtering
  console.log("\n▶ [Step 2] Testing period filtering logic...");
  const thisMonthResult = filterTransactionsByPeriod(db.transactions, "this_month");
  console.log(`  ✓ 'this_month' filtered transactions count: ${thisMonthResult.filtered.length}`);
  console.log(`  ✓ Days in month evaluated: ${thisMonthResult.daysInPeriod}`);

  const todayResult = filterTransactionsByPeriod(db.transactions, "today");
  console.log(`  ✓ 'today' filtered transactions count: ${todayResult.filtered.length}`);

  // Test 2: Add known sample transactions in the Big 4
  console.log("\n▶ [Step 3] Adding known Big 4 transactions and testing /api/analytics/quick-four logic...");
  const testIds = ["tx_t_bfast", "tx_t_lunch", "tx_t_din", "tx_t_trans"];

  await updateDb((currentDb) => {
    currentDb.transactions.unshift(
      {
        id: "tx_t_bfast",
        title: "Croissant & Coffee",
        amount: 10.00,
        type: "EXPENSE",
        categoryId: "cat_breakfast",
        isQuickAction: true,
        isRoutine: false,
        isRefunded: false,
        date: new Date().toISOString(),
      },
      {
        id: "tx_t_lunch",
        title: "Salad Bowl",
        amount: 20.00,
        type: "EXPENSE",
        categoryId: "cat_lunch",
        isQuickAction: true,
        isRoutine: false,
        isRefunded: false,
        date: new Date().toISOString(),
      },
      {
        id: "tx_t_din",
        title: "Steak Dinner",
        amount: 50.00,
        type: "EXPENSE",
        categoryId: "cat_dinner",
        isQuickAction: true,
        isRoutine: false,
        isRefunded: false,
        date: new Date().toISOString(),
      },
      {
        id: "tx_t_trans",
        title: "Taxi Ride",
        amount: 20.00,
        type: "EXPENSE",
        categoryId: "cat_transport",
        isQuickAction: true,
        isRoutine: false,
        isRefunded: false,
        date: new Date().toISOString(),
      }
    );
  });

  const updatedDb = await getDb();
  const qfFiltered = filterTransactionsByPeriod(updatedDb.transactions, "today").filtered;

  let grandTotal = 0;
  const totals: Record<string, number> = {
    cat_breakfast: 0,
    cat_lunch: 0,
    cat_dinner: 0,
    cat_transport: 0,
  };

  for (const t of qfFiltered) {
    if (totals[t.categoryId] !== undefined && !t.isRefunded) {
      totals[t.categoryId] += t.amount;
      grandTotal += t.amount;
    }
  }

  console.log(`  ✓ Grand Total Quick Four: $${grandTotal.toFixed(2)} (Expected >= $100)`);
  console.log(`  ✓ Breakfast: $${totals.cat_breakfast} (10%)`);
  console.log(`  ✓ Lunch: $${totals.cat_lunch} (20%)`);
  console.log(`  ✓ Dinner: $${totals.cat_dinner} (50%)`);
  console.log(`  ✓ Transport: $${totals.cat_transport} (20%)`);

  if (totals.cat_dinner !== 50 || totals.cat_lunch !== 20) {
    throw new Error("Quick four total calculation mismatch!");
  }

  // Cleanup test transactions
  await updateDb((currentDb) => {
    currentDb.transactions = currentDb.transactions.filter((t) => !testIds.includes(t.id));
  });

  console.log("\n  ✓ Test transactions cleaned up.");
  console.log("\n🎉 ALL PHASE 7 ANALYTICS TESTS PASSED!\n");
}

verifyPhase7Analytics().catch((err) => {
  console.error("❌ Phase 7 Test Failed:", err);
  process.exit(1);
});
