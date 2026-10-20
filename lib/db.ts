import fs from "fs";
import path from "path";
import { Database, DatabaseSchema } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Default initial seed data (conforming to system_design.md)
export const DEFAULT_DATABASE: Database = {
  wallet: {
    balance: 3840.50,
    baseCurrency: "USD",
    updatedAt: new Date().toISOString(),
  },
  categories: [
    { id: "cat_breakfast", name: "Breakfast", icon: "Croissant", isQuickAction: true },
    { id: "cat_lunch", name: "Lunch", icon: "Salad", isQuickAction: true },
    { id: "cat_dinner", name: "Dinner", icon: "Utensils", isQuickAction: true },
    { id: "cat_transport", name: "Transport", icon: "Car", isQuickAction: true },
    { id: "cat_habits", name: "Habits & Routines", icon: "Flame", isQuickAction: false },
    { id: "cat_tech", name: "Electronics & Tech", icon: "Laptop", isQuickAction: false },
    { id: "cat_shopping", name: "Shopping", icon: "ShoppingBag", isQuickAction: false },
    { id: "cat_misc", name: "Miscellaneous", icon: "Receipt", isQuickAction: false },
  ],
  routines: [
    {
      id: "rt_cigg_001",
      title: "Packet of Cigarettes",
      cost: 8.00,
      currency: "USD",
      categoryId: "cat_habits",
      frequency: "DAILY",
      reminderTime: "20:00",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  routine_logs: [
    {
      id: "rtl_sample_01",
      routineId: "rt_cigg_001",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
      status: "SKIPPED",
      savedAmount: 8.00,
      loggedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  transactions: [
    {
      id: "tx_init_001",
      title: "Custom Gaming PC Build",
      amount: 1250.00,
      type: "EXPENSE",
      categoryId: "cat_tech",
      categoryName: "Electronics & Tech",
      isQuickAction: false,
      isRoutine: false,
      isRefunded: false,
      date: new Date(Date.now() - 172800000).toISOString(),
      notes: "High performance workstation upgrade",
    },
    {
      id: "tx_init_002",
      title: "Weekly Grocery Run",
      amount: 65.20,
      type: "EXPENSE",
      categoryId: "cat_shopping",
      categoryName: "Shopping",
      isQuickAction: false,
      isRoutine: false,
      isRefunded: false,
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  exchange_rates_cache: {
    base: "USD",
    updatedAt: new Date().toISOString(),
    rates: {
      EUR: 0.925,
      GBP: 0.785,
      JPY: 151.70,
      CAD: 1.38,
      DZD: 134.50,
      MAD: 9.95,
      EGP: 48.80,
    },
  },
};

// In-memory write mutex queue to serialize disk operations
let writeQueue = Promise.resolve();

/**
 * Ensures the data directory exists.
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Reads and parses the database JSON file.
 * If the file does not exist or is corrupted, initializes it with DEFAULT_DATABASE.
 */
export async function getDb(): Promise<Database> {
  ensureDataDir();

  if (!fs.existsSync(DB_FILE)) {
    await writeDb(DEFAULT_DATABASE);
    return DEFAULT_DATABASE;
  }

  try {
    const rawData = await fs.promises.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(rawData);
    const validated = DatabaseSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("[Database] Corrupted or invalid db.json, recovering with defaults:", error);
    await writeDb(DEFAULT_DATABASE);
    return DEFAULT_DATABASE;
  }
}

/**
 * Performs an ACID-safe atomic write to db.json:
 * 1. Validates the data against Zod DatabaseSchema.
 * 2. Writes to a temporary file (`db.json.<pid>.<timestamp>.tmp`).
 * 3. Atomically renames the temporary file over db.json.
 */
export async function writeDb(data: Database): Promise<Database> {
  ensureDataDir();

  // Validate schema before persisting
  const validated = DatabaseSchema.parse(data);

  // Serialize writes through the write queue
  writeQueue = writeQueue.then(async () => {
    const tmpFile = path.join(
      DATA_DIR,
      `db.json.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
    );

    const jsonString = JSON.stringify(validated, null, 2);
    await fs.promises.writeFile(tmpFile, jsonString, "utf-8");
    await fs.promises.rename(tmpFile, DB_FILE);
  });

  await writeQueue;
  return validated;
}

/**
 * Convenience helper to mutate the database safely in a single atomic transaction.
 */
export async function updateDb(
  updater: (currentDb: Database) => Promise<void> | void
): Promise<Database> {
  const currentDb = await getDb();
  await updater(currentDb);
  return await writeDb(currentDb);
}
