import fs from "fs";
import path from "path";
import { getDb, writeDb } from "./db";
import { DatabaseSchema } from "@/types/database";

const BACKUPS_DIR = path.join(process.cwd(), "data", "backups");

function ensureBackupsDir(): void {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

/**
 * Creates a timestamped snapshot of the current database.
 */
export async function createBackup(customLabel?: string): Promise<string> {
  ensureBackupsDir();
  const currentDb = await getDb();

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, "-");
  const filename = customLabel 
    ? `db-${dateStr}-${customLabel}.json`
    : `db-${dateStr}.json`;

  const backupFilePath = path.join(BACKUPS_DIR, filename);
  await fs.promises.writeFile(backupFilePath, JSON.stringify(currentDb, null, 2), "utf-8");

  return filename;
}

/**
 * Lists all existing database backups, ordered by most recent first.
 */
export async function listBackups(): Promise<{ filename: string; size: number; createdAt: Date }[]> {
  ensureBackupsDir();
  const files = await fs.promises.readdir(BACKUPS_DIR);
  const jsonBackups = files.filter((f) => f.endsWith(".json"));

  const list = await Promise.all(
    jsonBackups.map(async (filename) => {
      const filePath = path.join(BACKUPS_DIR, filename);
      const stat = await fs.promises.stat(filePath);
      return {
        filename,
        size: stat.size,
        createdAt: stat.birthtime,
      };
    })
  );

  return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Restores a database from a specific backup file.
 */
export async function restoreBackup(filename: string): Promise<boolean> {
  ensureBackupsDir();
  const filePath = path.join(BACKUPS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file ${filename} does not exist`);
  }

  // Before restoring, create an emergency safety backup of current state
  await createBackup("pre-restore-safety");

  const raw = await fs.promises.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  const validated = DatabaseSchema.parse(parsed);

  await writeDb(validated);
  return true;
}
