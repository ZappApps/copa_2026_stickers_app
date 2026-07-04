import * as SQLite from "expo-sqlite";
import { ALL_STICKERS } from "./stickers-seed";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("figurinhas2026.db");
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user_collection (
      sticker_id TEXT PRIMARY KEY,
      quantity INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trades_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      partner_name TEXT NOT NULL,
      given_stickers TEXT NOT NULL DEFAULT '[]',
      received_stickers TEXT NOT NULL DEFAULT '[]',
      notes TEXT DEFAULT ''
    );
  `);

  // Check if collection is already seeded
  const count = await database.getFirstAsync<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM user_collection"
  );

  if (!count || count.cnt === 0) {
    // Seed all stickers as missing (quantity = 0)
    await database.withTransactionAsync(async () => {
      for (const sticker of ALL_STICKERS) {
        await database.runAsync(
          "INSERT OR IGNORE INTO user_collection (sticker_id, quantity) VALUES (?, ?)",
          [sticker.id, 0]
        );
      }
    });
  }
}

// === Collection Operations ===

export interface CollectionRow {
  sticker_id: string;
  quantity: number;
  updated_at: string;
}

export async function getCollection(): Promise<CollectionRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<CollectionRow>("SELECT * FROM user_collection ORDER BY sticker_id");
}

export async function getSticker(stickerId: string): Promise<CollectionRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<CollectionRow>(
    "SELECT * FROM user_collection WHERE sticker_id = ?",
    [stickerId.toUpperCase()]
  );
}

export async function updateStickerQuantity(stickerId: string, quantity: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE user_collection SET quantity = ?, updated_at = datetime('now') WHERE sticker_id = ?",
    [Math.max(0, quantity), stickerId.toUpperCase()]
  );
}

export async function incrementSticker(stickerId: string, amount = 1): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE user_collection SET quantity = quantity + ?, updated_at = datetime('now') WHERE sticker_id = ?",
    [amount, stickerId.toUpperCase()]
  );
}

export async function decrementSticker(stickerId: string, amount = 1): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE user_collection SET quantity = MAX(0, quantity - ?), updated_at = datetime('now') WHERE sticker_id = ?",
    [amount, stickerId.toUpperCase()]
  );
}

export async function bulkUpdateStickers(
  updates: Array<{ stickerId: string; quantity: number }>
): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    for (const { stickerId, quantity } of updates) {
      await database.runAsync(
        "UPDATE user_collection SET quantity = ?, updated_at = datetime('now') WHERE sticker_id = ?",
        [Math.max(0, quantity), stickerId.toUpperCase()]
      );
    }
  });
}

export async function bulkIncrementStickers(
  stickers: Array<{ stickerId: string; amount?: number }>
): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    for (const { stickerId, amount = 1 } of stickers) {
      await database.runAsync(
        "UPDATE user_collection SET quantity = quantity + ?, updated_at = datetime('now') WHERE sticker_id = ?",
        [amount, stickerId.toUpperCase()]
      );
    }
  });
}

// === Statistics ===

export interface CollectionStats {
  total: number;
  owned: number;
  missing: number;
  duplicates: number;
  completionPercent: number;
}

export async function getStats(): Promise<CollectionStats> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    total: number;
    owned: number;
    missing: number;
    duplicates: number;
  }>(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN quantity >= 1 THEN 1 END) as owned,
      COUNT(CASE WHEN quantity = 0 THEN 1 END) as missing,
      SUM(CASE WHEN quantity > 1 THEN quantity - 1 ELSE 0 END) as duplicates
    FROM user_collection
  `);

  const stats = result || { total: 0, owned: 0, missing: 0, duplicates: 0 };
  return {
    ...stats,
    completionPercent: stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0,
  };
}

export async function getMissingStickers(): Promise<CollectionRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<CollectionRow>(
    "SELECT * FROM user_collection WHERE quantity = 0 ORDER BY sticker_id"
  );
}

export async function getDuplicateStickers(): Promise<CollectionRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<CollectionRow>(
    "SELECT * FROM user_collection WHERE quantity > 1 ORDER BY sticker_id"
  );
}

// === Trades History ===

export interface TradeRow {
  id: number;
  date: string;
  partner_name: string;
  given_stickers: string; // JSON array of sticker IDs
  received_stickers: string; // JSON array of sticker IDs
  notes: string;
}

export async function getTrades(): Promise<TradeRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<TradeRow>(
    "SELECT * FROM trades_history ORDER BY date DESC"
  );
}

export async function addTrade(
  partnerName: string,
  givenStickers: string[],
  receivedStickers: string[],
  notes = ""
): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    // Save trade record
    await database.runAsync(
      "INSERT INTO trades_history (partner_name, given_stickers, received_stickers, notes) VALUES (?, ?, ?, ?)",
      [partnerName, JSON.stringify(givenStickers), JSON.stringify(receivedStickers), notes]
    );
    // Update collection: decrement given, increment received
    for (const id of givenStickers) {
      await database.runAsync(
        "UPDATE user_collection SET quantity = MAX(0, quantity - 1), updated_at = datetime('now') WHERE sticker_id = ?",
        [id.toUpperCase()]
      );
    }
    for (const id of receivedStickers) {
      await database.runAsync(
        "UPDATE user_collection SET quantity = quantity + 1, updated_at = datetime('now') WHERE sticker_id = ?",
        [id.toUpperCase()]
      );
    }
  });
}

export async function deleteTrade(tradeId: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM trades_history WHERE id = ?", [tradeId]);
}

// === Reset ===

export async function resetCollection(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("UPDATE user_collection SET quantity = 0, updated_at = datetime('now')");
}
