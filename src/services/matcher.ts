import { getDb } from '@/db/index';

export interface MatchResult {
  itemId: number | null;
  merchantId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;
  confidence: number;
}

const ARABIC_EQUIVALENCES: Record<string, string[]> = {
  'خبز': ['عيش', 'عيشة'],
  'حليب': ['لبن', 'لبنة'],
  'فلوس': ['مصاري', 'دراهم'],
  'موز': ['وز'],
  'بصل': ['بصلة'],
  'طماطم': ['طماطم', 'قوطة'],
  'بطاطس': ['بطاطا', 'بطاطس'],
  'برتقال': ['برتقال', 'يوسفي'],
  'عنب': ['عنب'],
  'فراخ': ['فرخة', 'دجاج', 'كتكوت'],
  'لحمة': ['لحم', 'لحمة'],
  'جبنة': ['جبن', 'جبنة'],
};

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
    .replace(/[ةه]/g, 'ة')
    .replace(/[ىي]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function arabicSimilarity(a: string, b: string): number {
  const na = normalizeArabic(a);
  const nb = normalizeArabic(b);

  if (na === nb) return 1.0;

  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1.0;

  for (const [canonical, variants] of Object.entries(ARABIC_EQUIVALENCES)) {
    const normalizedCanonical = normalizeArabic(canonical);
    const normalizedVariants = variants.map(normalizeArabic);
    const all = [normalizedCanonical, ...normalizedVariants];
    if (all.includes(na) && all.includes(nb)) return 0.9;
  }

  const dist = levenshteinDistance(na, nb);
  return 1 - dist / maxLen;
}

export function findBestMatch(
  searchText: string,
  candidates: Array<{ id: number; name: string; name_variants?: string | null }>,
  threshold = 0.7,
): { id: number | null; score: number } {
  let bestId: number | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    let score = arabicSimilarity(searchText, candidate.name);

    if (candidate.name_variants) {
      try {
        const variants: string[] = JSON.parse(candidate.name_variants);
        for (const variant of variants) {
          const vScore = arabicSimilarity(searchText, variant);
          if (vScore > score) score = vScore;
        }
      } catch {}
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

  const itemMatch = findBestMatch(record.item, items);
  const merchantMatch = record.merchant ? findBestMatch(record.merchant, merchants) : null;
  const categoryMatch = findBestMatch(record.mainCategory, categories);
  const subCategoryMatch = findBestMatch(record.mainCategory, subCategories);

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
