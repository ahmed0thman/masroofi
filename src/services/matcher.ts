import { getDb } from '@/db/index';
import type { MatchResult } from '@/schemas';
export type { MatchResult };

const STOP_WORDS = new Set([
  'كيلو', 'نص', 'ربع', 'علبة', 'كرتونة', 'زوج', 'زوجين',
  'حبة', 'حبتين', 'قطعة', 'قطع', 'جرام', 'تو',
  'كجم', 'كج', 'لتر', 'لترين', 'package', 'pack', 'bag', 'box', 'cross',
]);

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
    }
  }
  return dp[m][n];
}

export function normalizeArabic(text: string): string {
  return text
    .replace(/[آأإا]/g, 'ا')
    .replace(/ة/g, 'ة')
    .replace(/ه($|\s)/g, 'ة$1')
    .replace(/[ىي]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function wordOverlapScore(a: string, b: string): number {
  const wordsA = normalizeArabic(a).split(/\s+/).filter(w => w.length > 0 && !STOP_WORDS.has(w));
  const wordsB = normalizeArabic(b).split(/\s+/).filter(w => w.length > 0 && !STOP_WORDS.has(w));

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  let overlap = 0;
  for (const word of setA) {
    if (setB.has(word)) overlap++;
  }

  if (setA.size <= setB.size && overlap === setA.size) return 0.85;
  if (setB.size <= setA.size && overlap === setB.size) return 0.85;

  const union = new Set([...setA, ...setB]);
  return overlap / union.size;
}

export function arabicSimilarity(a: string, b: string): number {
  const na = normalizeArabic(a);
  const nb = normalizeArabic(b);

  if (na === nb) return 1.0;

  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1.0;

  const overlapScore = wordOverlapScore(a, b);
  if (overlapScore >= 0.5) return 0.85;

  const dist = levenshteinDistance(na, nb);
  return 1 - dist / maxLen;
}

export function findBestMatch(
  searchText: string,
  candidates: Array<{ id: number; name: string; name_variants?: string | null }>,
  threshold = 0.7,
  equivalenceMap?: Map<string, string>,
): { id: number | null; score: number } {
  let bestId: number | null = null;
  let bestScore = 0;

  const normalizedSearch = normalizeArabic(searchText);
  const searchAliases = [searchText];
  if (equivalenceMap?.has(normalizedSearch)) {
    searchAliases.push(equivalenceMap.get(normalizedSearch)!);
  }

  for (const candidate of candidates) {
    const normalizedName = normalizeArabic(candidate.name);
    const candidateAliases = [candidate.name];
    if (equivalenceMap?.has(normalizedName)) {
      candidateAliases.push(equivalenceMap.get(normalizedName)!);
    }

    let score = 0;
    for (const s of searchAliases) {
      for (const c of candidateAliases) {
        const sim = arabicSimilarity(s, c);
        if (sim > score) score = sim;
      }

      if (candidate.name_variants) {
        try {
          const variants: string[] = JSON.parse(candidate.name_variants);
          for (const variant of variants) {
            const vScore = arabicSimilarity(s, variant);
            if (vScore > score) score = vScore;
          }
        } catch {}
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = candidate.id;
    }
  }

  return bestScore >= threshold ? { id: bestId, score: bestScore } : { id: null, score: bestScore };
}

interface CandidateRow {
  id: number;
  name: string;
}

export async function matchExpenseRecord(record: { item: string; merchant?: string | null; mainCategory: string }): Promise<MatchResult> {
  const db = await getDb();

  const eqRows = await db.getAllAsync<{ variant: string; canonical: string }>(
    'SELECT variant, canonical FROM word_equivalences',
  );
  const equivalenceMap = new Map<string, string>();
  for (const eq of eqRows) {
    const nv = normalizeArabic(eq.variant);
    if (!equivalenceMap.has(nv)) {
      equivalenceMap.set(nv, eq.canonical);
    }
  }

  type RowWithVariants = { id: number; name: string; name_variants: string | null };
  const items = await db.getAllAsync<RowWithVariants>(
    'SELECT id, name, name_variants FROM items WHERE is_active = 1',
  );

  const merchants = await db.getAllAsync<RowWithVariants>(
    "SELECT id, name, name_variants FROM merchants WHERE is_active = 1",
  );

  const categories = await db.getAllAsync<CandidateRow>(
    'SELECT id, name FROM categories WHERE is_active = 1',
  );

  const subCategories = await db.getAllAsync<CandidateRow>(
    'SELECT id, name FROM sub_categories WHERE is_active = 1',
  );

  const itemMatch = findBestMatch(record.item, items, 0.7, equivalenceMap);
  const merchantMatch = record.merchant ? findBestMatch(record.merchant, merchants, 0.7, equivalenceMap) : null;
  const categoryMatch = findBestMatch(record.mainCategory, categories, 0.7, equivalenceMap);
  const subCategoryMatch = findBestMatch(record.mainCategory, subCategories, 0.7, equivalenceMap);

  const matchScores = [
    itemMatch.score,
    categoryMatch.score,
    ...(merchantMatch ? [merchantMatch.score] : []),
    ...(subCategoryMatch.score > 0.7 ? [subCategoryMatch.score] : []),
  ];

  const confidence = matchScores.length > 0
    ? matchScores.reduce((a, b) => a + b, 0) / matchScores.length
    : 0;

  return {
    itemId: itemMatch.id,
    merchantId: merchantMatch?.id ?? null,
    categoryId: categoryMatch.id,
    subCategoryId: subCategoryMatch.score > 0.7 ? subCategoryMatch.id : null,
    confidence,
  };
}
