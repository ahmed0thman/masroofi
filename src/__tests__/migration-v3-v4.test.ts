/**
 * Integration test for V3 and V4 DB migration flow.
 *
 * Tests the observable effects of migrateToV3(), migrateToV4(),
 * migrateToV7(), reseedCurrencies(), and the runMigrations() chain.
 *
 * Since these migrations are module-private (not exported),
 * we test their behavior by calling runMigrations() (which IS exported)
 * from specific starting versions, and verifying the resulting mock DB calls.
 *
 * Follows the same patterns as migration.test.ts (V2).
 */
import { getDb, runMigrations, SCHEMA_VERSION } from '@/db/index';
import * as SQLite from 'expo-sqlite';

const mockOpenDb = SQLite.openDatabaseAsync as jest.MockedFunction<typeof SQLite.openDatabaseAsync>;

/** Get the shared mock DB instance and expose its methods for manipulation */
async function getMockDb() {
  const db = await getDb();
  return db as unknown as {
    execAsync: jest.Mock;
    runAsync: jest.Mock;
    getFirstAsync: jest.Mock;
    getAllAsync: jest.Mock;
    prepareAsync: jest.Mock;
  };
}

/**
 * Initialize the in-memory mock DB so getDb() returns a usable instance
 * with all tables created and migrations in a known state (version 4).
 */
beforeEach(async () => {
  const rawDb = jest.mocked(await mockOpenDb(':memory:'));

  rawDb.execAsync.mockReset();
  rawDb.execAsync.mockResolvedValue(undefined);
  rawDb.runAsync.mockReset();
  rawDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
  rawDb.getAllAsync.mockReset();
  rawDb.getAllAsync.mockResolvedValue([]);
  rawDb.getFirstAsync.mockReset();
  // PRAGMA user_version returns { c: 1 } → undefined.user_version → 0
  // All migrations (V2→V3→V4) run during getDb(). Seed checks see count=1 → skip.
  rawDb.getFirstAsync.mockResolvedValue({ c: 1 });

  // This runs all migrations — the mock records all calls but they get
  // cleared between tests by jest.clearMocks (config). Each test below
  // makes its own function call (runMigrations()) to generate fresh calls.
  await getDb();
});

// ============================================================
// V3 migration tests
// ============================================================
describe('V3 migration', () => {
  it('calls createV2Tables (CREATE TABLE IF NOT EXISTS) and sets PRAGMA = 3', async () => {
    const db = await getMockDb();

    // Clear previous call history and set up to start at version 2
    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 2 })  // start at V2 → V3 + V4 run
      .mockResolvedValue({ id: 1 });                 // reseed SELECT returns truthy

    await runMigrations();

    // V3 calls createV2Tables → CREATE TABLE IF NOT EXISTS statements
    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const createTableCalls = execCalls.filter((c: string) =>
      c.includes('CREATE TABLE IF NOT EXISTS'),
    );
    // Should create at least 8 tables (currencies, categories, sub_categories,
    // merchants, items, expenses, change_log, analytics, word_equivalences,
    // budgets, savings_goals)
    expect(createTableCalls.length).toBeGreaterThanOrEqual(8);

    // V3 sets PRAGMA user_version = 3
    expect(execCalls).toContain('PRAGMA user_version = 3');
  });

  it('does not re-run V2 when starting from version 2', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 2 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    // V2 should NOT have run
    expect(execCalls).not.toContain('PRAGMA user_version = 2');
    // V3 should have run
    expect(execCalls).toContain('PRAGMA user_version = 3');
  });

  it('V3 V2 table creation is safe to re-run (IF NOT EXISTS)', async () => {
    // createV2Tables() uses CREATE TABLE IF NOT EXISTS, which is a no-op
    // on existing tables. The mock always resolves, so no error.
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 2 })
      .mockResolvedValue({ id: 1 });

    await expect(runMigrations()).resolves.not.toThrow();
  });
});

// ============================================================
// V4 migration tests
// ============================================================
describe('V4 migration', () => {
  it('adds symbol_en column via ALTER TABLE', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })  // start at V3 → only V4 runs
      .mockResolvedValue({ id: 1 });                 // reseed SELECT

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const alterCall = execCalls.find((c: string) =>
      c.includes('ALTER TABLE') && c.includes('currencies') && c.includes('symbol_en'),
    );
    expect(alterCall).toBeDefined();
  });

  it('reseedCurrencies updates existing currencies (no INSERT duplicates)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })  // start at V3
      .mockResolvedValue({ id: 1 });                 // all reseed SELECTs return truthy

    await runMigrations();

    const runCalls = db.runAsync.mock.calls.map((c: string[]) => c[0]);

    const updateCalls = runCalls.filter((c: string) =>
      c.toString().includes('UPDATE currencies'),
    );
    const insertCalls = runCalls.filter((c: string) =>
      c.toString().includes('INSERT INTO currencies'),
    );

    // Should have 46 UPDATEs (23 per reseed × 2 migrations) and 0 INSERTs
    expect(updateCalls.length).toBe(46);
    expect(insertCalls.length).toBe(0);
  });

  it('reseedCurrencies UPDATEs include symbol_en and code filter', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const runCalls = db.runAsync.mock.calls.filter((c: unknown[]) =>
      (c[0] as string)?.toString().includes('UPDATE currencies'),
    ) as [string, ...string[]][];

    expect(runCalls.length).toBeGreaterThanOrEqual(1);
    // Verify SQL shape
    expect(runCalls[0][0]).toContain('symbol_en');
    expect(runCalls[0][0]).toContain('SET');
    expect(runCalls[0][0]).toContain('WHERE code = ?');
  });

  it('sets PRAGMA user_version = 4', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).toContain('PRAGMA user_version = 4');
  });

  it('runs V4 after V3 (PRAGMA 3 before PRAGMA 4)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 2 })  // start at V2 → V3 + V4
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const v3Idx = execCalls.indexOf('PRAGMA user_version = 3');
    const v4Idx = execCalls.indexOf('PRAGMA user_version = 4');
    expect(v3Idx).toBeGreaterThanOrEqual(0);
    expect(v4Idx).toBeGreaterThan(v3Idx);
  });

  it('reseedCurrencies processes all 23 currencies', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const runCalls = db.runAsync.mock.calls.map((c: string[]) => c[0]);
    const updateCalls = runCalls.filter((c: string) =>
      c.toString().includes('UPDATE currencies'),
    );
    expect(updateCalls).toHaveLength(46);
  });
});

// ============================================================
// runMigrations chain tests
// ============================================================
describe('runMigrations chain', () => {
  it('chains V2→V3→V4→V5→V6→V7 when starting from version 0', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 0 })  // start at 0 → all run
      .mockResolvedValue({ c: 1 });                  // seed checks: skip

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const v2Idx = execCalls.indexOf('PRAGMA user_version = 2');
    const v3Idx = execCalls.indexOf('PRAGMA user_version = 3');
    const v4Idx = execCalls.indexOf('PRAGMA user_version = 4');
    const v5Idx = execCalls.indexOf('PRAGMA user_version = 5');
    const v6Idx = execCalls.indexOf('PRAGMA user_version = 6');
    const v7Idx = execCalls.indexOf('PRAGMA user_version = 7');

    expect(v2Idx).toBeGreaterThanOrEqual(0);
    expect(v3Idx).toBeGreaterThan(v2Idx);
    expect(v4Idx).toBeGreaterThan(v3Idx);
    expect(v5Idx).toBeGreaterThan(v4Idx);
    expect(v6Idx).toBeGreaterThan(v5Idx);
    expect(v7Idx).toBeGreaterThan(v6Idx);
  });

  it('SCHEMA_VERSION is 7 (all migrations defined)', () => {
    expect(SCHEMA_VERSION).toBe(7);
  });

  it('skips all migrations when version is current (SCHEMA_VERSION)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValue({ user_version: SCHEMA_VERSION });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls.filter((c: string) => c.includes('PRAGMA user_version'))).toHaveLength(0);
  });

  it('resumes from version 2 (runs V3, V4, V5, V6, and V7)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 2 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).not.toContain('PRAGMA user_version = 2');
    expect(execCalls).toContain('PRAGMA user_version = 3');
    expect(execCalls).toContain('PRAGMA user_version = 4');
    expect(execCalls).toContain('PRAGMA user_version = 5');
    expect(execCalls).toContain('PRAGMA user_version = 6');
    expect(execCalls).toContain('PRAGMA user_version = 7');
  });

  it('resumes from version 3 (runs V4, V5, V6, and V7)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).not.toContain('PRAGMA user_version = 2');
    expect(execCalls).not.toContain('PRAGMA user_version = 3');
    expect(execCalls).toContain('PRAGMA user_version = 4');
    expect(execCalls).toContain('PRAGMA user_version = 5');
    expect(execCalls).toContain('PRAGMA user_version = 6');
    expect(execCalls).toContain('PRAGMA user_version = 7');
  });

  it('resumes from version 4 (runs V5, V6, and V7)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 4 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).not.toContain('PRAGMA user_version = 2');
    expect(execCalls).not.toContain('PRAGMA user_version = 3');
    expect(execCalls).not.toContain('PRAGMA user_version = 4');
    expect(execCalls).toContain('PRAGMA user_version = 5');
    expect(execCalls).toContain('PRAGMA user_version = 6');
    expect(execCalls).toContain('PRAGMA user_version = 7');
  });

  it('resumes from version 5 (runs V6 and V7)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 5 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).not.toContain('PRAGMA user_version = 2');
    expect(execCalls).not.toContain('PRAGMA user_version = 3');
    expect(execCalls).not.toContain('PRAGMA user_version = 4');
    expect(execCalls).not.toContain('PRAGMA user_version = 5');
    expect(execCalls).toContain('PRAGMA user_version = 6');
    expect(execCalls).toContain('PRAGMA user_version = 7');
  });

  it('resumes from version 6 (runs only V7)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 6 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).not.toContain('PRAGMA user_version = 2');
    expect(execCalls).not.toContain('PRAGMA user_version = 3');
    expect(execCalls).not.toContain('PRAGMA user_version = 4');
    expect(execCalls).not.toContain('PRAGMA user_version = 5');
    expect(execCalls).not.toContain('PRAGMA user_version = 6');
    expect(execCalls).toContain('PRAGMA user_version = 7');
  });
});

// ============================================================
// reseedCurrencies semantics
// ============================================================
describe('reseedCurrencies', () => {
  it('only UPDATES existing currencies when data exists (no INSERT duplicates)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })  // start at V3 → V4 runs
      .mockResolvedValue({ id: 1 });                 // every SELECT returns truthy → UPDATE branch

    await runMigrations();

    const updateCalls = db.runAsync.mock.calls.filter((c: unknown[]) =>
      (c[0] as string)?.toString().includes('UPDATE currencies'),
    );
    const insertCalls = db.runAsync.mock.calls.filter((c: unknown[]) =>
      (c[0] as string)?.toString().includes('INSERT INTO currencies'),
    );

    expect(updateCalls).toHaveLength(46);
    expect(insertCalls).toHaveLength(0);
  });

  it('INSERTs a currency when it does not already exist', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })
      // First SELECT returns null (currency doesn't exist) → INSERT branch
      // Subsequent SELECTs return { id: 1 } (exist) → UPDATE branch
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const insertCalls = db.runAsync.mock.calls.filter((c: unknown[]) =>
      (c[0] as string)?.toString().includes('INSERT INTO currencies'),
    );
    // At least one INSERT (for the first currency that didn't exist)
    expect(insertCalls.length).toBeGreaterThanOrEqual(1);
    // Total UPDATE + INSERT should be 46 (23 per reseed × 2 migrations)
    const updateCalls = db.runAsync.mock.calls.filter((c: unknown[]) =>
      (c[0] as string)?.toString().includes('UPDATE currencies'),
    );
    expect(updateCalls.length + insertCalls.length).toBe(46);
  });
});

// ============================================================
// Edge case: V4 with already-seeded data
// ============================================================
describe('V4 with already-seeded data', () => {
  it('handles already-seeded currency data correctly (no INSERT by default)', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const insertCalls = db.runAsync.mock.calls.filter((c: unknown[]) =>
      (c[0] as string)?.toString().includes('INSERT INTO currencies'),
    );
    expect(insertCalls).toHaveLength(0);
  });

  it('V4 migration completes without error when column already exists', async () => {
    const db = await getMockDb();

    // Simulate that ALTER TABLE ADD COLUMN throws (column already exists)
    db.execAsync.mockImplementation(async (sql: string) => {
      if (sql.includes('ALTER TABLE') && sql.includes('ADD COLUMN')) {
        throw new Error('duplicate column: symbol_en');
      }
    });

    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 3 })
      .mockResolvedValue({ id: 1 });

    // addColumnIfNotExists catches the error silently
    await expect(runMigrations()).resolves.not.toThrow();

    // V4 should still complete (PRAGMA user_version = 4 should be set)
    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).toContain('PRAGMA user_version = 4');
  });
});

// ============================================================
// V7 migration tests
// ============================================================
describe('V7 migration', () => {
  it('creates saving_wallet_entries table', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 6 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const createCall = execCalls.find((c: string) =>
      c.includes('CREATE TABLE IF NOT EXISTS saving_wallet_entries'),
    );
    expect(createCall).toBeDefined();
  });

  it('adds monthly_budget column to profiles via addColumnIfNotExists', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 6 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const alterCall = execCalls.find((c: string) =>
      c.includes('ALTER TABLE') && c.includes('profiles') && c.includes('monthly_budget'),
    );
    expect(alterCall).toBeDefined();
  });

  it('sets PRAGMA user_version = 7', async () => {
    const db = await getMockDb();

    db.execAsync.mockClear();
    db.runAsync.mockClear();
    db.getFirstAsync
      .mockReset()
      .mockResolvedValueOnce({ user_version: 6 })
      .mockResolvedValue({ id: 1 });

    await runMigrations();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).toContain('PRAGMA user_version = 7');
  });
});
