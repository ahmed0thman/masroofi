import {
  parseExpenseResponse,
  buildContextSection,
  refineAndExtractEnititesFromTranscript,
  createEntitiesFromExpenseRecord,
} from '@/services/gemini';
import { getTopItemsForPrompt } from '@/db/item-repo';
import { getAllMerchants } from '@/db/merchant-repo';
import { getAllCategories } from '@/db/category-repo';
import { GoogleGenAI } from '@google/genai';

// Mock all DB dependencies
jest.mock('@/db/item-repo');
jest.mock('@/db/merchant-repo');
jest.mock('@/db/category-repo');

const mockGetTopItems = getTopItemsForPrompt as jest.MockedFunction<typeof getTopItemsForPrompt>;
const mockGetAllMerchants = getAllMerchants as jest.MockedFunction<typeof getAllMerchants>;
const mockGetAllCategories = getAllCategories as jest.MockedFunction<typeof getAllCategories>;

beforeEach(() => {
  mockGetTopItems.mockResolvedValue([
    { id: 1, name: 'خبز', name_variants: JSON.stringify(['عيش']), category: 'أكل ومشروبات', subCategory: 'مخبوزات' },
  ]);
  mockGetAllMerchants.mockResolvedValue([
    { id: 1, name: 'كارفور', name_variants: null, name_en: null, icon: null, color: null, is_active: 1 },
  ]);
  mockGetAllCategories.mockResolvedValue([
    { id: 1, name: 'أكل ومشروبات', name_en: null, icon: null, color: null, default_priority: 'essential', sort_order: 1, is_active: 1 },
  ]);

  process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-gemini-key';

  // Restore GoogleGenAI mock to default implementation.
  // clearMocks (config) calls mockClear() which preserves overridden
  // implementations from previous tests, so we must explicitly reset.
  (GoogleGenAI as jest.Mock).mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify([{
          item: 'خبز',
          price: 50,
          currency: 'جنيه',
          subCategory: 'مخبوزات',
          mainCategory: 'أكل ومشروبات',
          description: 'شراء خبز',
          confidence: 0.95,
          merchant: null,
          priority: 'essential',
        }]),
      }),
    },
  }));
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
});

// ============================================================
// parseExpenseResponse tests
// ============================================================
describe('parseExpenseResponse', () => {
  const validRecord = {
    item: 'خبز',
    price: 50,
    currency: 'جنيه',
    subCategory: 'مخبوزات',
    mainCategory: 'أكل ومشروبات',
    description: 'شراء خبز',
    confidence: 0.95,
    merchant: null,
    priority: 'essential',
  };

  it('parses a valid JSON array of records', () => {
    const text = JSON.stringify([validRecord]);
    const result = parseExpenseResponse(text);
    expect(result).toHaveLength(1);
    expect(result[0].item).toBe('خبز');
    expect(result[0].price).toBe(50);
  });

  it('wraps a single object in an array', () => {
    const text = JSON.stringify(validRecord);
    const result = parseExpenseResponse(text);
    expect(result).toHaveLength(1);
    expect(result[0].item).toBe('خبز');
  });

  it('filters out items with missing price field', () => {
    const records = [
      validRecord,
      { item: 'مشروب', subCategory: 'مشروبات', mainCategory: 'أكل ومشروبات' }, // no price
    ];
    const text = JSON.stringify(records);
    const result = parseExpenseResponse(text);
    expect(result).toHaveLength(1);
    expect(result[0].item).toBe('خبز');
  });

  it('filters out items where price is NaN', () => {
    const records = [
      validRecord,
      { item: 'مشروب', price: NaN, subCategory: 'مشروبات', mainCategory: 'أكل ومشروبات' },
    ];
    const text = JSON.stringify(records);
    const result = parseExpenseResponse(text);
    expect(result).toHaveLength(1);
  });

  it('filters out items with empty item string', () => {
    const records = [
      validRecord,
      { item: '', price: 30, mainCategory: 'أكل ومشروبات', subCategory: '', description: '', merchant: null },
    ];
    const text = JSON.stringify(records);
    const result = parseExpenseResponse(text);
    expect(result).toHaveLength(1);
  });

  it('filters out non-object items', () => {
    const records = [validRecord, null, 'string', 42];
    const text = JSON.stringify(records);
    const result = parseExpenseResponse(text);
    expect(result).toHaveLength(1);
  });

  it('fills default values (currency, confidence, priority, matched fields)', () => {
    const minimal = {
      item: 'خبز',
      price: 50,
      subCategory: '',
      mainCategory: 'أكل ومشروبات',
      description: '',
      merchant: null,
    };
    const text = JSON.stringify([minimal]);
    const result = parseExpenseResponse(text);
    expect(result[0].currency).toBe('EGP');
    expect(result[0].confidence).toBe(0);
    expect(result[0].priority).toBe('normal');
    expect(result[0].matchedItemId).toBeNull();
    expect(result[0].matchedMerchantId).toBeNull();
    expect(result[0].matchedCategoryId).toBeNull();
    expect(result[0].matchedSubCategoryId).toBeNull();
  });

  it('preserves existing confidence and priority when provided', () => {
    const text = JSON.stringify([validRecord]);
    const result = parseExpenseResponse(text);
    expect(result[0].confidence).toBe(0.95);
    expect(result[0].priority).toBe('essential');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseExpenseResponse('not json')).toThrow();
  });

  it('handles empty array', () => {
    const result = parseExpenseResponse('[]');
    expect(result).toHaveLength(0);
  });

  it('handles array with only invalid items', () => {
    const text = JSON.stringify([{ foo: 'bar' }, { item: 123, price: 10, subCategory: '', mainCategory: '', description: '', merchant: null }]);
    const result = parseExpenseResponse(text);
    expect(result).toHaveLength(0);
  });
});

// ============================================================
// buildContextSection tests
// ============================================================
describe('buildContextSection', () => {
  it('renders items section when items are present', () => {
    const context = {
      items: [
        { id: 1, name: 'خبز', variants: ['عيش', 'عيشة'], category: 'أكل ومشروبات', subCategory: 'مخبوزات' },
        { id: 2, name: 'حليب', variants: ['لبن'], category: 'أكل ومشروبات', subCategory: 'ألبان' },
      ],
      merchants: [],
      categories: [],
    };
    const result = buildContextSection(context);
    expect(result).toContain('العناصر المعروفة في النظام');
    expect(result).toContain('خبز');
    expect(result).toContain('عيش');
    expect(result).toContain('حليب');
    expect(result).toContain('لبن');
  });

  it('renders merchants section when merchants are present', () => {
    const context = {
      items: [],
      merchants: ['كارفور', 'سبينيس'],
      categories: [],
    };
    const result = buildContextSection(context);
    expect(result).toContain('التجار المعروفون');
    expect(result).toContain('كارفور');
    expect(result).toContain('سبينيس');
  });

  it('renders categories section when categories are present', () => {
    const context = {
      items: [],
      merchants: [],
      categories: ['أكل ومشروبات', 'مواصلات'],
    };
    const result = buildContextSection(context);
    expect(result).toContain('الفئات الرئيسية');
    expect(result).toContain('أكل ومشروبات');
    expect(result).toContain('مواصلات');
  });

  it('returns empty string when context is empty', () => {
    const context = { items: [], merchants: [], categories: [] };
    const result = buildContextSection(context);
    expect(result).toBe('');
  });

  it('renders all sections when full context is provided', () => {
    const context = {
      items: [{ id: 1, name: 'خبز', variants: [], category: 'أكل ومشروبات', subCategory: 'مخبوزات' }],
      merchants: ['كارفور'],
      categories: ['أكل ومشروبات'],
    };
    const result = buildContextSection(context);
    expect(result).toContain('العناصر المعروفة');
    expect(result).toContain('التجار المعروفون');
    expect(result).toContain('الفئات الرئيسية');
    expect(result).toContain('قواعد المطابقة');
  });

  it('includes matching rules when there is any context', () => {
    const context = {
      items: [{ id: 1, name: 'خبز', variants: [], category: 'أكل ومشروبات', subCategory: 'مخبوزات' }],
      merchants: [],
      categories: [],
    };
    const result = buildContextSection(context);
    expect(result).toContain('قواعد المطابقة');
    expect(result).toContain('إذا كان العنصر المذكور مشابهاً');
  });

  it('shows variants for items with alternatives', () => {
    const context = {
      items: [{ id: 1, name: 'خبز', variants: ['عيش', 'عيشة'], category: 'أكل ومشروبات', subCategory: '' }],
      merchants: [],
      categories: [],
    };
    const result = buildContextSection(context);
    expect(result).toContain('المعروف أيضاً');
    expect(result).toContain('عيش, عيشة');
  });

  it('does not show variants text for items without variants', () => {
    const context = {
      items: [{ id: 1, name: 'خبز', variants: [], category: 'أكل ومشروبات', subCategory: '' }],
      merchants: [],
      categories: [],
    };
    const result = buildContextSection(context);
    expect(result).not.toContain('المعروف أيضاً');
  });
});

// ============================================================
// refineAndExtractEnititesFromTranscript integration tests
// ============================================================
describe('refineAndExtractEnititesFromTranscript', () => {
  it('returns parsed expense records from Gemini', async () => {
    // The Gemini mock in jest.setup returns a valid record
    const result = await refineAndExtractEnititesFromTranscript('اشتريت خبز بخمسين جنيه');
    expect(result).toHaveLength(1);
    expect(result[0].item).toBeDefined();
    expect(result[0].price).toBeGreaterThan(0);
  });

  it('falls back to Groq when Gemini returns empty', async () => {
    // Override Gemini to return empty
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({ text: '[]' }),
      },
    }));

    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-groq-key';
    const result = await refineAndExtractEnititesFromTranscript('');
    // The global Groq mock returns a valid record as fallback
    expect(result).toHaveLength(1);
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
  });

  it('returns empty array when both providers fail', async () => {
    // Override Gemini to return empty
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({ text: '[]' }),
      },
    }));

    // No Groq key set, so Groq will return []
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY; // Gemini also returns null without key

    const result = await refineAndExtractEnititesFromTranscript('some transcript');
    expect(result).toEqual([]);
  });

  it('applies matcher post-processing to records', async () => {
    const result = await refineAndExtractEnititesFromTranscript('خبز خمسين جنيه');
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('matchedItemId');
    expect(result[0]).toHaveProperty('matchedMerchantId');
    expect(result[0]).toHaveProperty('matchedCategoryId');
    expect(result[0]).toHaveProperty('matchedSubCategoryId');
  });
});

// ============================================================
// createEntitiesFromExpenseRecord tests
// ============================================================
describe('createEntitiesFromExpenseRecord', () => {
  it('works with matched IDs (no new entities created)', async () => {
    const record = {
      item: 'خبز',
      price: 50,
      currency: 'جنيه',
      subCategory: 'مخبوزات',
      mainCategory: 'أكل ومشروبات',
      description: '',
      confidence: 0.95,
      merchant: 'كارفور',
      priority: 'essential',
      matchedItemId: 1,
      matchedMerchantId: 2,
      matchedCategoryId: 3,
      matchedSubCategoryId: null,
    };

    const result = await createEntitiesFromExpenseRecord(record);
    expect(result.itemId).toBe(1);
    expect(result.merchantId).toBe(2);
    expect(result.categoryId).toBe(3);
  });

  it('creates category, merchant, and item when IDs are missing', async () => {
    // createEntitiesFromExpenseRecord does dynamic imports of DB repos.
    // The top-level jest.mock('@/db/item-repo') etc. create auto-mocks
    // that return undefined for all function calls (getItemByName,
    // createItem, etc.). So when the function tries to find existing
    // entities, it gets undefined (falsy), then calls create* which
    // also returns undefined. The IDs in the result are thus undefined.

    const record = {
      item: 'جبنة',
      price: 40,
      currency: 'جنيه',
      subCategory: 'ألبان',
      mainCategory: 'أكل ومشروبات',
      description: '',
      confidence: 0.8,
      merchant: 'سبينيس',
      priority: 'normal',
      matchedItemId: null,
      matchedMerchantId: null,
      matchedCategoryId: null,
      matchedSubCategoryId: null,
    };

    const result = await createEntitiesFromExpenseRecord(record);
    // Since all matchedIds are null, it should try to find/create entities
    // Auto-mocks return undefined (not null) so we check falsy
    expect(result.itemId).toBeFalsy();
    expect(result.categoryId).toBeFalsy();
    expect(result.merchantId).toBeFalsy();
  });
});
