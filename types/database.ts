import { z } from "zod";

// --- Wallet Schema ---
export const WalletSchema = z.object({
  balance: z.number(),
  baseCurrency: z.string().default("USD"),
  updatedAt: z.string().datetime(),
});
export type Wallet = z.infer<typeof WalletSchema>;

// --- Category Schema ---
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  isQuickAction: z.boolean().default(false),
});
export type Category = z.infer<typeof CategorySchema>;

// --- Routine Schema ---
export const RoutineSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  cost: z.number().positive("Routine cost must be greater than 0"),
  currency: z.string().default("USD"),
  categoryId: z.string(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),
  reminderTime: z.string().default("20:00"),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});
export type Routine = z.infer<typeof RoutineSchema>;

// --- Routine Check-In Log Schema ---
export const RoutineLogStatusSchema = z.enum(["CONFIRMED", "SKIPPED", "PENDING"]);
export type RoutineLogStatus = z.infer<typeof RoutineLogStatusSchema>;

export const RoutineLogSchema = z.object({
  id: z.string(),
  routineId: z.string(),
  date: z.string(), // YYYY-MM-DD
  status: RoutineLogStatusSchema,
  transactionId: z.string().optional(),
  savedAmount: z.number().default(0),
  loggedAt: z.string().datetime(),
});
export type RoutineLog = z.infer<typeof RoutineLogSchema>;

// --- Transaction Schema ---
export const TransactionTypeSchema = z.enum(["EXPENSE", "INCOME", "REFUND"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  type: TransactionTypeSchema,
  categoryId: z.string(),
  categoryName: z.string().optional(),
  isQuickAction: z.boolean().default(false),
  isRoutine: z.boolean().default(false),
  routineId: z.string().optional(),
  isRefunded: z.boolean().default(false),
  refundedAt: z.string().datetime().optional(),
  originalTransactionId: z.string().optional(),
  date: z.string().datetime(),
  notes: z.string().optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

// --- Forex Exchange Rates Cache Schema ---
export const ExchangeRatesCacheSchema = z.object({
  base: z.string().default("USD"),
  updatedAt: z.string().datetime(),
  rates: z.record(z.string(), z.number()),
});
export type ExchangeRatesCache = z.infer<typeof ExchangeRatesCacheSchema>;

// --- Master Database Schema ---
export const DatabaseSchema = z.object({
  wallet: WalletSchema,
  categories: z.array(CategorySchema),
  routines: z.array(RoutineSchema),
  routine_logs: z.array(RoutineLogSchema),
  transactions: z.array(TransactionSchema),
  exchange_rates_cache: ExchangeRatesCacheSchema,
});
export type Database = z.infer<typeof DatabaseSchema>;
