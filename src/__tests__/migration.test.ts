/**
 * Integration test for DB migration flow.
 *
 * Uses the globally-mocked expo-sqlite from jest.setup.ts.
 * We get the db via getDb(), then manipulate it for each test scenario,
 * then call migrateToV2() to exercise the migration logic.
 *
 * IMPORTANT: Because getDb() internally calls seedCurrencies() and
 * seedCategories() (via runMigrations → migrateToV2), we must configure
 * the mock DB's getFirstAsync to return { c: 1 } BEFORE calling getDb(),
 * otherwise seedCurrencies crashes on null.
 */
import { getDb, migrateToV2 } from '@/db/index';
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

beforeEach(async () => {
  // ── Step 1: Get the mock DB directly (without calling getDb()) ──
  // The expo-sqlite mock factory creates a shared mockDb. Calling
  // openDatabaseAsync returns it. clearMocks (config) preserves the
  // factory's mockResolvedValue, so openDatabaseAsync resolves to the
  // same shared mockDb.
  const rawDb = jest.mocked(await mockOpenDb(':memory:'));

  // ── Step 2: Configure mock DB so that getDb() succeeds ──
  // seedCurrencies() calls: getFirstAsync('SELECT COUNT(*) as c FROM currencies')
  // If it returns null, count!.c crashes. Setting { c: 1 } makes it skip.
  // Same for seedCategories.
  //
  // IMPORTANT: Use mockReset() to clear any leftover mockResolvedValueOnce
  // queue from previous tests. clearMocks (config) only calls mockClear()
  // which preserves the "once" queue, causing stale values to leak between
  // tests.
  rawDb.execAsync.mockReset();
  rawDb.execAsync.mockResolvedValue(undefined);
  rawDb.runAsync.mockReset();
  rawDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
  rawDb.getAllAsync.mockReset();
  rawDb.getAllAsync.mockResolvedValue([]);
  rawDb.getFirstAsync.mockReset();
  rawDb.getFirstAsync.mockResolvedValue({ c: 1 });

  // ── Step 3: Initialize the internal db variable ──
  // getDb() will use the already-configured mock, so migrations run
  // without crashing. After this, getMockDb() returns the cached db.
  await getDb();
});

describe('Migration V2 flow', () => {
  it('detects old expenses table by checking PRAGMA table_info', async () => {
    const db = await getMockDb();
    // Old schema: has 'item' column but not 'item_name'
    db.getAllAsync.mockResolvedValueOnce([
      { name: 'id' }, { name: 'item' }, { name: 'price' },
    ]);
    db.getFirstAsync
      .mockResolvedValueOnce(null)  // expenses_old doesn't exist → will rename
      .mockResolvedValueOnce({ c: 1 }) // seedCurrencies: already seeded
      .mockResolvedValueOnce({ c: 1 }) // seedCategories: already seeded
      .mockResolvedValueOnce({ c: 1 }); // seedWordEquivalences: already seeded

    await migrateToV2();

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("PRAGMA table_info('expenses')"),
    );
  });

  it('renames old expenses table to expenses_old', async () => {
    const db = await getMockDb();
    db.getAllAsync.mockResolvedValueOnce([
      { name: 'id' }, { name: 'item' }, { name: 'price' },
    ]);
    db.getFirstAsync
      .mockResolvedValueOnce(null)  // expenses_old doesn't exist → rename
      .mockResolvedValueOnce({ c: 1 }) // currencies seeded
      .mockResolvedValueOnce({ c: 1 }) // categories seeded
      .mockResolvedValueOnce({ c: 1 }); // seedWordEquivalences: already seeded

    await migrateToV2();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).toContain('ALTER TABLE expenses RENAME TO expenses_old');
  });

  it('skips re-renaming if expenses_old already exists', async () => {
    const db = await getMockDb();
    db.getAllAsync.mockResolvedValueOnce([
      { name: 'id' }, { name: 'item' }, { name: 'price' },
    ]);
    db.getFirstAsync
      .mockResolvedValueOnce({ name: 'expenses_old' }) // already exists
      .mockResolvedValueOnce({ c: 1 }) // currencies seeded
      .mockResolvedValueOnce({ c: 1 }) // categories seeded
      .mockResolvedValueOnce({ c: 1 }); // seedWordEquivalences: already seeded

    await migrateToV2();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls.filter((c: string) => c.includes('RENAME TO expenses_old'))).toHaveLength(0);
  });

  it('creates all V2 tables', async () => {
    const db = await getMockDb();
    // No old columns → hasOldExpenses = false → first getFirstAsync is seedCurrencies
    db.getFirstAsync
      .mockResolvedValueOnce({ c: 1 }) // seedCurrencies: already seeded
      .mockResolvedValueOnce({ c: 1 }) // seedCategories: already seeded
      .mockResolvedValueOnce({ c: 1 }) // seedWordEquivalences: already seeded
      .mockResolvedValueOnce(null);    // expenses_old check → doesn't exist → no data migration

    await migrateToV2();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const createTables = execCalls.filter((c: string) => c.includes('CREATE TABLE'));
    expect(createTables.length).toBeGreaterThan(0);
    expect(execCalls).toContain('PRAGMA user_version = 2');
  });

  it('seeds currencies and categories when empty', async () => {
    const db = await getMockDb();
    // No old columns → hasOldExpenses = false → first getFirstAsync is seedCurrencies
    db.getFirstAsync
      .mockResolvedValueOnce({ c: 0 }) // seedCurrencies: empty → seed
      .mockResolvedValueOnce({ c: 0 }) // seedCategories: empty → seed
      .mockResolvedValueOnce({ c: 0 }) // seedWordEquivalences: empty → seed
      .mockResolvedValueOnce(null);    // expenses_old check → doesn't exist

    await migrateToV2();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    const allExec = execCalls.join(' ');
    expect(allExec).toContain('INSERT INTO currencies');
    expect(allExec).toContain('INSERT INTO categories');
  });

  it('migrates expense data from old table to new table', async () => {
    const db = await getMockDb();
    // Old schema detected
    db.getAllAsync
      .mockResolvedValueOnce([{ name: 'id' }, { name: 'item' }, { name: 'price' }])
      .mockResolvedValueOnce([
        { id: 1, item: 'خبز', price: 50, currency: 'جنيه', main_category: 'أكل ومشروبات',
          sub_category: 'مخبوزات', description: '', confidence: 0.95, merchant: null,
          transcript_id: null, created_at: '2025-01-01', updated_at: '2025-01-01' },
      ]);

    db.getFirstAsync
      .mockResolvedValueOnce(null)  // expenses_old check → doesn't exist → will rename
      .mockResolvedValueOnce({ c: 1 }) // currencies seeded
      .mockResolvedValueOnce({ c: 1 }) // categories seeded
      .mockResolvedValueOnce({ c: 1 }) // seedWordEquivalences: already seeded
      .mockResolvedValueOnce({ name: 'expenses_old' }) // old table exists after rename
      .mockResolvedValueOnce({ id: 10 }) // resolveCategoryId: SELECT result
      .mockResolvedValueOnce({ id: 20 }) // resolveSubCategoryId: SELECT result
      .mockResolvedValueOnce([{ id: 1, name_ar: 'جنيه مصري', name_en: 'Egyptian Pound', code: 'EGP' }]) // buildCurrencyMap
      .mockResolvedValueOnce(null)   // merchant doesn't exist yet (INSERT OR IGNORE then SELECT)
      .mockResolvedValueOnce(null)   // item doesn't exist yet (SELECT)
      .mockResolvedValueOnce({ id: 40 }); // after ITEM insert, SELECT returns it

    // For merchant: INSERT OR IGNORE, then SELECT
    db.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });

    await migrateToV2();

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM expenses_old'),
    );
  });

  it('handles migration with no old data', async () => {
    const db = await getMockDb();
    // No old columns → hasOldExpenses = false → first getFirstAsync is seedCurrencies
    db.getFirstAsync
      .mockResolvedValueOnce({ c: 1 }) // seedCurrencies: already seeded
      .mockResolvedValueOnce({ c: 1 }) // seedCategories: already seeded
      .mockResolvedValueOnce({ c: 1 }) // seedWordEquivalences: already seeded
      .mockResolvedValueOnce(null);    // expenses_old check → doesn't exist

    await migrateToV2();

    const execCalls = db.execAsync.mock.calls.map((c: string[]) => c[0]);
    expect(execCalls).toContain('PRAGMA user_version = 2');
  });
});
