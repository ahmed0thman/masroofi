import { normalizeArabic, arabicSimilarity, wordOverlapScore, findBestMatch, matchExpenseRecord } from '@/services/matcher';
import { getDb } from '@/db/index';

jest.mock('@/db/index', () => ({
  getDb: jest.fn(),
}));

const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe('normalizeArabic', () => {
  it('normalizes alef variants (آ, أ, إ, ا) to ا', () => {
    expect(normalizeArabic('آدم')).toBe('ادم');
    expect(normalizeArabic('أحمد')).toBe('احمد');
    expect(normalizeArabic('إبراهيم')).toBe('ابراهيم');
    expect(normalizeArabic('اثاث')).toBe('اثاث');
    expect(normalizeArabic('آ أ إ ا')).toBe('ا ا ا ا');
  });

  it('normalizes taa marbouta (ة, ه at end) to ة', () => {
    expect(normalizeArabic('تفاحة')).toBe('تفاحة');
    expect(normalizeArabic('فاطمه')).toBe('فاطمة');
    expect(normalizeArabic('وردة')).toBe('وردة');
    expect(normalizeArabic('كتابه')).toBe('كتابة');
  });

  it('normalizes yaa variants (ى, ي) to ي', () => {
    expect(normalizeArabic('على')).toBe('علي');
    expect(normalizeArabic('مصطفى')).toBe('مصطفي');
    expect(normalizeArabic('يسري')).toBe('يسري');
    expect(normalizeArabic('ى ي')).toBe('ي ي');
  });

  it('normalizes waw with hamza (ؤ) to و', () => {
    expect(normalizeArabic('مؤمن')).toBe('مومن');
    expect(normalizeArabic('مؤمنة')).toBe('مومنة');
  });

  it('normalizes yaa with hamza (ئ) to ي', () => {
    expect(normalizeArabic('مئة')).toBe('مية');
    expect(normalizeArabic('شئ')).toBe('شي');
  });

  it('removes tatweel (ـ)', () => {
    expect(normalizeArabic('عيشـ')).toBe('عيش');
    expect(normalizeArabic('مستـقبل')).toBe('مستقبل');
    expect(normalizeArabic('ـــ')).toBe('');
  });

  it('collapses whitespace and trims', () => {
    expect(normalizeArabic('  hello   world  ')).toBe('hello world');
    expect(normalizeArabic('  ')).toBe('');
  });

  it('lowercases English letters', () => {
    expect(normalizeArabic('HELLO')).toBe('hello');
    expect(normalizeArabic('Hello World')).toBe('hello world');
  });

  it('handles mixed Arabic and English', () => {
    expect(normalizeArabic('آحمد HELLO')).toBe('احمد hello');
  });

  it('handles empty string', () => {
    expect(normalizeArabic('')).toBe('');
  });

  it('handles all normalizations together', () => {
    const input = '  آحمد إبراهيم   فاطمه على مـؤمن  ';
    const expected = 'احمد ابراهيم فاطمة علي مومن';
    expect(normalizeArabic(input)).toBe(expected);
  });
});

describe('wordOverlapScore', () => {
  it('returns 0.85 when search text is a subset of candidate', () => {
    expect(wordOverlapScore('موز', 'موز بلدي')).toBe(0.85);
  });

  it('returns 0.85 when candidate is a subset of search text', () => {
    expect(wordOverlapScore('كيلو موز', 'موز')).toBe(0.85);
  });

  it('returns 0.85 when subset after stop word filtering', () => {
    expect(wordOverlapScore('كيلو موز', 'موز بلدي')).toBe(0.85);
  });

  it('returns 0 for no overlapping words', () => {
    expect(wordOverlapScore('خبز', 'عيش')).toBe(0);
  });

  it('returns jaccard score for partial overlap', () => {
    expect(wordOverlapScore('موز بلدي طازة', 'موز بلدي')).toBe(0.85);
  });

  it('returns 0 for empty inputs', () => {
    expect(wordOverlapScore('', 'موز')).toBe(0);
    expect(wordOverlapScore('موز', '')).toBe(0);
    expect(wordOverlapScore('', '')).toBe(0);
  });

  it('returns 0 when all words are stop words', () => {
    expect(wordOverlapScore('كيلو', 'موز')).toBe(0);
  });
});

describe('arabicSimilarity', () => {
  it('returns 1.0 for exact match after normalization', () => {
    expect(arabicSimilarity('خبز', 'خبز')).toBe(1.0);
    expect(arabicSimilarity('خبز', 'خبز')).toBe(1.0);
  });

  it('returns 1.0 for strings that normalize to same value', () => {
    expect(arabicSimilarity('أحمد', 'احمد')).toBe(1.0);
    expect(arabicSimilarity('تفاحة', 'تفاحه')).toBe(1.0);
    expect(arabicSimilarity('على', 'علي')).toBe(1.0);
    expect(arabicSimilarity('مؤمن', 'مومن')).toBe(1.0);
  });

  it('returns 0.85 for word overlap (subset)', () => {
    expect(arabicSimilarity('كيلو موز', 'موز')).toBe(0.85);
    expect(arabicSimilarity('موز', 'موز بلدي')).toBe(0.85);
  });

  it('uses levenshtein fallback for non-matching words', () => {
    const score = arabicSimilarity('خبز', 'جبن');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.85);
  });

  it('returns lower similarity for very different words', () => {
    const score = arabicSimilarity('خبز', 'سيارة');
    expect(score).toBeLessThan(0.4);
  });

  it('returns 1.0 when both strings are empty (maxLen=0)', () => {
    expect(arabicSimilarity('', '')).toBe(1.0);
  });

  it('handles one empty string', () => {
    const score = arabicSimilarity('خبز', '');
    expect(score).toBeLessThan(1.0);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('handles very different strings with same length', () => {
    const score = arabicSimilarity('أكل', 'شرب');
    expect(score).toBeLessThan(0.5);
  });

  it('is symmetric', () => {
    const score1 = arabicSimilarity('أحمد', 'احمد');
    const score2 = arabicSimilarity('احمد', 'أحمد');
    expect(score1).toBe(score2);
  });
});

describe('findBestMatch', () => {
  const candidates = [
    { id: 1, name: 'خبز', name_variants: JSON.stringify(['عيش', 'عيشة']) },
    { id: 2, name: 'حليب', name_variants: JSON.stringify(['لبن', 'لبنة']) },
    { id: 3, name: 'جبنة', name_variants: JSON.stringify(['جبن', 'جبنة']) },
    { id: 4, name: 'موز', name_variants: JSON.stringify(['وز']) },
    { id: 5, name: 'سيارة', name_variants: null },
  ];

  it('returns exact match with score 1.0', () => {
    const result = findBestMatch('خبز', candidates);
    expect(result.id).toBe(1);
    expect(result.score).toBe(1.0);
  });

  it('returns fuzzy match with high score via name_variants', () => {
    const result = findBestMatch('عيش', candidates);
    expect(result.id).toBe(1);
    expect(result.score).toBeGreaterThanOrEqual(0.9);
  });

  it('returns fuzzy match for variant', () => {
    const result = findBestMatch('لبن', candidates);
    expect(result.id).toBe(2);
    expect(result.score).toBeGreaterThanOrEqual(0.9);
  });

  it('returns best match among multiple candidates', () => {
    const result = findBestMatch('جبنة', candidates);
    expect(result.id).toBe(3);
    expect(result.score).toBe(1.0);
  });

  it('returns null when score is below threshold', () => {
    const result = findBestMatch('xyzabc', candidates, 0.9);
    expect(result.id).toBeNull();
  });

  it('returns match when score meets threshold', () => {
    const result = findBestMatch('جبن', candidates, 0.9);
    expect(result.id).toBe(3);
  });

  it('handles empty candidates array', () => {
    const result = findBestMatch('خبز', []);
    expect(result.id).toBeNull();
    expect(result.score).toBe(0);
  });

  it('handles null name_variants without throwing', () => {
    const result = findBestMatch('سيارة', candidates);
    expect(result.id).toBe(5);
    expect(result.score).toBe(1.0);
  });

  it('handles malformed JSON in name_variants gracefully', () => {
    const badCandidate = [{ id: 1, name: 'خبز', name_variants: '{invalid json}' }];
    const result = findBestMatch('خبز', badCandidate);
    expect(result.id).toBe(1);
    expect(result.score).toBe(1.0);
  });

  it('uses default threshold of 0.7', () => {
    const result = findBestMatch('موز', candidates);
    expect(result.id).toBe(4);
    expect(result.score).toBe(1.0);
  });

  it('returns null with no matching candidates and high threshold', () => {
    const result = findBestMatch('xyz', candidates, 0.99);
    expect(result.id).toBeNull();
  });

  it('uses equivalenceMap to resolve search text to canonical', () => {
    const eqMap = new Map<string, string>([
      ['عيش', 'خبز'],
      ['عيشة', 'خبز'],
    ]);
    const candidatesNoVariants = [
      { id: 1, name: 'خبز', name_variants: null },
      { id: 2, name: 'حليب', name_variants: null },
    ];
    const result = findBestMatch('عيش', candidatesNoVariants, 0.7, eqMap);
    expect(result.id).toBe(1);
    expect(result.score).toBe(1.0);
  });

  it('uses equivalenceMap to resolve candidate name to canonical', () => {
    const eqMap = new Map<string, string>([
      ['عيشة', 'خبز'],
    ]);
    const candidatesNoVariants = [
      { id: 1, name: 'عيشة', name_variants: null },
      { id: 2, name: 'حليب', name_variants: null },
    ];
    const result = findBestMatch('خبز', candidatesNoVariants, 0.7, eqMap);
    expect(result.id).toBe(1);
    expect(result.score).toBe(1.0);
  });

  it('matches via word-overlap in findBestMatch', () => {
    const candidates = [
      { id: 1, name: 'موز', name_variants: null },
      { id: 2, name: 'عيش', name_variants: null },
    ];
    const result = findBestMatch('كيلو موز', candidates);
    expect(result.id).toBe(1);
    expect(result.score).toBe(0.85);
  });
});

describe('matchExpenseRecord', () => {
  const mockDb = {
    getAllAsync: jest.fn(),
  };

  beforeEach(() => {
    mockGetDb.mockResolvedValue(mockDb as any);
  });

  it('matches items, categories, and returns MatchResult', async () => {
    mockDb.getAllAsync
      .mockResolvedValueOnce([]) // word_equivalences
      .mockResolvedValueOnce([{ id: 1, name: 'خبز', name_variants: JSON.stringify(['عيش']) }]) // items
      .mockResolvedValueOnce([]) // merchants
      .mockResolvedValueOnce([{ id: 10, name: 'أكل ومشروبات' }, { id: 11, name: 'مواصلات' }]) // categories
      .mockResolvedValueOnce([{ id: 20, name: 'مخبوزات' }]); // sub_categories

    const result = await matchExpenseRecord({
      item: 'خبز',
      merchant: null,
      mainCategory: 'أكل ومشروبات',
    });

    expect(result.itemId).toBe(1);
    expect(result.merchantId).toBeNull();
    expect(result.categoryId).toBe(10);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('handles merchant matching', async () => {
    mockDb.getAllAsync
      .mockResolvedValueOnce([]) // word_equivalences
      .mockResolvedValueOnce([{ id: 1, name: 'خبز', name_variants: null }])
      .mockResolvedValueOnce([{ id: 5, name: 'كارفور', name_variants: null }])
      .mockResolvedValueOnce([{ id: 10, name: 'أكل ومشروبات' }])
      .mockResolvedValueOnce([]);

    const result = await matchExpenseRecord({
      item: 'خبز',
      merchant: 'كارفور',
      mainCategory: 'أكل ومشروبات',
    });

    expect(result.itemId).toBe(1);
    expect(result.merchantId).toBe(5);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('handles sub-category match with score > 0.7', async () => {
    mockDb.getAllAsync
      .mockResolvedValueOnce([]) // word_equivalences
      .mockResolvedValueOnce([{ id: 1, name: 'خبز', name_variants: null }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 10, name: 'أكل ومشروبات' }])
      .mockResolvedValueOnce([{ id: 20, name: 'أكل ومشروبات' }]);

    const result = await matchExpenseRecord({
      item: 'خبز',
      merchant: null,
      mainCategory: 'أكل ومشروبات',
    });

    expect(result.subCategoryId).toBe(20);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('handles no matches gracefully', async () => {
    mockDb.getAllAsync
      .mockResolvedValueOnce([]) // word_equivalences
      .mockResolvedValueOnce([]) // items
      .mockResolvedValueOnce([]) // merchants
      .mockResolvedValueOnce([]) // categories
      .mockResolvedValueOnce([]); // sub_categories

    const result = await matchExpenseRecord({
      item: 'something unknown',
      merchant: null,
      mainCategory: 'unknown category',
    });

    expect(result.itemId).toBeNull();
    expect(result.merchantId).toBeNull();
    expect(result.categoryId).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it('queries SQLite with correct SQL', async () => {
    mockDb.getAllAsync
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await matchExpenseRecord({ item: 'خبز', merchant: 'كارفور', mainCategory: 'أكل ومشروبات' });

    expect(mockDb.getAllAsync).toHaveBeenNthCalledWith(
      1,
      'SELECT variant, canonical FROM word_equivalences',
    );
    expect(mockDb.getAllAsync).toHaveBeenNthCalledWith(
      2,
      'SELECT id, name, name_variants FROM items WHERE is_active = 1',
    );
  });
});
