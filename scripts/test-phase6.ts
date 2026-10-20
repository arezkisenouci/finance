import { getExchangeRates, convertCurrency } from "../lib/forex";

async function verifyPhase6Forex() {
  console.log("🧪 Starting Phase 6 Live Multi-Currency Engine Tests...\n");

  // Step 1: Fetch rates
  console.log("▶ [Step 1] Fetching live/cached exchange rates for USD...");
  const ratesResult = await getExchangeRates("USD");
  console.log(`  ✓ Base Currency: ${ratesResult.base}`);
  console.log(`  ✓ Cached At: ${ratesResult.cachedAt}`);
  console.log(`  ✓ Total Active Forex Pairs: ${Object.keys(ratesResult.rates).length}`);

  const sampleCurrencies = ["EUR", "GBP", "JPY", "CAD", "DZD"];
  for (const curr of sampleCurrencies) {
    if (ratesResult.rates[curr]) {
      console.log(`  ✓ 1 USD = ${ratesResult.rates[curr]} ${curr}`);
    } else {
      throw new Error(`Missing exchange rate for ${curr}!`);
    }
  }

  // Step 2: Test Currency Conversion Calculation
  console.log("\n▶ [Step 2] Testing Currency Conversion (Converting $1,250 USD to EUR)...");
  const conversion = await convertCurrency(1250, "USD", "EUR");
  console.log(`  ✓ Original: $1,250 USD`);
  console.log(`  ✓ Rate Applied: ${conversion.rate}`);
  console.log(`  ✓ Converted: €${conversion.convertedAmount} EUR`);

  const expectedConverted = parseFloat((1250 * conversion.rate).toFixed(2));
  if (conversion.convertedAmount !== expectedConverted) {
    throw new Error(`Conversion math mismatch: got ${conversion.convertedAmount}, expected ${expectedConverted}`);
  }

  // Step 3: Test Conversion to DZD (Algerian Dinar)
  console.log("\n▶ [Step 3] Testing Currency Conversion ($100 USD to DZD)...");
  const dzdConversion = await convertCurrency(100, "USD", "DZD");
  console.log(`  ✓ Converted: ${dzdConversion.convertedAmount} DZD (Rate: ${dzdConversion.rate})`);
  if (dzdConversion.convertedAmount <= 0) {
    throw new Error("Invalid DZD conversion result!");
  }

  console.log("\n🎉 ALL PHASE 6 MULTI-CURRENCY TESTS PASSED!\n");
}

verifyPhase6Forex().catch((err) => {
  console.error("❌ Phase 6 Test Failed:", err);
  process.exit(1);
});
