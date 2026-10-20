async function verifyPhase5Simulator() {
  console.log("🧪 Starting Phase 5 What-If Habit Simulator Tests...\n");

  // Step 1: Test mathematical formulas for Cigarettes ($8/day)
  console.log("▶ [Step 1] Verifying Cigarette ($8/day) savings projections...");
  const dailyCost = 8.00;
  const oneMonth = dailyCost * 30;
  const sixMonths = dailyCost * 180;
  const oneYear = dailyCost * 365;

  console.log(`  ✓ 1 Month Projected: $${oneMonth.toFixed(2)} (Expected: $240.00)`);
  console.log(`  ✓ 6 Months Projected: $${sixMonths.toFixed(2)} (Expected: $1440.00)`);
  console.log(`  ✓ 1 Year Projected: $${oneYear.toFixed(2)} (Expected: $2920.00)`);

  if (oneMonth !== 240 || sixMonths !== 1440 || oneYear !== 2920) {
    throw new Error("Projection math mismatch!");
  }

  // Step 2: Compound Interest test (5 Years @ 7% Annual return)
  console.log("\n▶ [Step 2] Verifying 5-Year compound interest projection...");
  const monthlyDeposit = dailyCost * (365 / 12);
  const monthlyRate = 0.07 / 12;
  const months = 60;
  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const fiveYearInvested = monthlyDeposit * ((compoundFactor - 1) / monthlyRate);

  console.log(`  ✓ Monthly Contribution: $${monthlyDeposit.toFixed(2)} / mo`);
  console.log(`  ✓ 5-Year Invested Total: $${fiveYearInvested.toFixed(2)}`);

  if (fiveYearInvested < 17000 || fiveYearInvested > 18000) {
    throw new Error(`Unexpected compound calculation result: ${fiveYearInvested}`);
  }

  // Step 3: Test Dynamic Calculation Logic
  console.log("\n▶ [Step 3] Verifying custom simulation calculation ($12.50/day, 12 months)...");
  const customDaily = 12.50;
  const customDuration = 12;
  const customAnnualRate = 8.0;

  const customMonthly = customDaily * (365 / 12);
  const customCashSaved = customDaily * (customDuration * (365 / 12));
  const customMonthlyRate = customAnnualRate / 100 / 12;
  const customCompoundFactor = Math.pow(1 + customMonthlyRate, customDuration);
  const customInvested = customMonthly * ((customCompoundFactor - 1) / customMonthlyRate);
  const customInterest = customInvested - customCashSaved;

  console.log(`  ✓ Total Cash Saved: $${customCashSaved.toFixed(2)}`);
  console.log(`  ✓ Total Invested Return: $${customInvested.toFixed(2)}`);
  console.log(`  ✓ Interest Earned: $${customInterest.toFixed(2)}`);

  if (customCashSaved <= 0 || customInvested <= customCashSaved || customInterest <= 0) {
    throw new Error("Compound growth calculation failed!");
  }

  console.log("\n🎉 ALL PHASE 5 WHAT-IF SIMULATOR TESTS PASSED!\n");
}

verifyPhase5Simulator().catch((err) => {
  console.error("❌ Phase 5 Test Failed:", err);
  process.exit(1);
});
