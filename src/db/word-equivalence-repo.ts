import { getDb } from './index';
import type { WordEquivalenceRow } from '@/schemas';
export type { WordEquivalenceRow };

export async function getAllEquivalences(): Promise<WordEquivalenceRow[]> {
  const db = await getDb();
  return db.getAllAsync<WordEquivalenceRow>('SELECT * FROM word_equivalences ORDER BY canonical');
}

export async function getEquivalenceByVariant(variant: string): Promise<WordEquivalenceRow | null> {
  const db = await getDb();
  return db.getFirstAsync<WordEquivalenceRow>(
    'SELECT * FROM word_equivalences WHERE variant = ? LIMIT 1',
    variant,
  );
}

export async function createEquivalence(data: {
  canonical: string;
  variant: string;
  dialect?: string;
  source?: string;
}): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO word_equivalences (canonical, variant, dialect, source) VALUES (?, ?, ?, ?)',
    data.canonical,
    data.variant,
    data.dialect ?? null,
    data.source ?? 'user',
  );
  return result.lastInsertRowId;
}

export async function batchInsertEquivalences(
  data: Array<{ canonical: string; variant: string; dialect?: string }>,
): Promise<void> {
  const db = await getDb();
  const stmt = await db.prepareAsync(
    'INSERT INTO word_equivalences (canonical, variant, dialect, source) VALUES (?, ?, ?, ?)',
  );
  try {
    for (const eq of data) {
      await stmt.executeAsync(eq.canonical, eq.variant, eq.dialect ?? null, 'user');
    }
  } finally {
    await stmt.finalizeAsync();
  }
}
