/**
 * Integration test for the full extraction flow:
 * refineAndExtractEnititesFromTranscript → Gemini → parse → matcher
 *
 * This test mocks all external dependencies and verifies the pipeline
 * works end-to-end with controlled data.
 */
import { refineAndExtractEnititesFromTranscript } from '@/services/gemini';
import { getTopItemsForPrompt } from '@/db/item-repo';
import { getAllMerchants } from '@/db/merchant-repo';
import { getAllCategories } from '@/db/category-repo';
import { GoogleGenAI } from '@google/genai';

// Mock DB repos
jest.mock('@/db/item-repo');
jest.mock('@/db/merchant-repo');
jest.mock('@/db/category-repo');

// Mock the matcher (separate from the global jest.setup mock)
jest.mock('@/services/matcher', () => ({
  matchExpenseRecord: jest.fn(),
}));

import { matchExpenseRecord } from '@/services/matcher';
const mockMatchExpenseRecord = matchExpenseRecord as jest.MockedFunction<typeof matchExpenseRecord>;

const mockGetTopItems = getTopItemsForPrompt as jest.MockedFunction<typeof getTopItemsForPrompt>;
const mockGetAllMerchants = getAllMerchants as jest.MockedFunction<typeof getAllMerchants>;
const mockGetAllCategories = getAllCategories as jest.MockedFunction<typeof getAllCategories>;

/** Helper to override the Gemini mock for a single test */
function mockGeminiResponse(response: object) {
  (GoogleGenAI as jest.Mock).mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue(response),
    },
  }));
}

beforeEach(() => {
  // Default DB repo mocks
  mockGetTopItems.mockResolvedValue([
    { id: 1, name: 'خبز', name_variants: JSON.stringify(['عيش', 'عيشة']), category: 'أكل ومشروبات', subCategory: 'مخبوزات' },
    { id: 2, name: 'حليب', name_variants: JSON.stringify(['لبن']), category: 'أكل ومشروبات', subCategory: 'ألبان' },
    { id: 3, name: 'جبنة', name_variants: JSON.stringify(['جبن']), category: 'أكل ومشروبات', subCategory: 'ألبان' },
  ]);

  mockGetAllMerchants.mockResolvedValue([
    { id: 1, name: 'كارفور', name_variants: null, name_en: null, icon: null, color: null, is_active: 1 },
    { id: 2, name: 'سبينيس', name_variants: null, name_en: null, icon: null, color: null, is_active: 1 },
  ]);

  mockGetAllCategories.mockResolvedValue([
    { id: 1, name: 'أكل ومشروبات', name_en: null, icon: null, color: null, default_priority: 'essential', sort_order: 1, is_active: 1 },
    { id: 2, name: 'مواصلات', name_en: null, icon: null, color: null, default_priority: 'important', sort_order: 2, is_active: 1 },
    { id: 3, name: 'فواتير', name_en: null, icon: null, color: null, default_priority: 'essential', sort_order: 3, is_active: 1 },
  ]);

  process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-gemini-key';

  // Default matcher mock: returns null matches
  mockMatchExpenseRecord.mockResolvedValue({
    itemId: null,
    merchantId: null,
    categoryId: null,
    subCategoryId: null,
    confidence: 0,
  });

  // Restore GoogleGenAI mock to default (clearMocks preserves overrides)
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

describe('Full extraction flow', () => {
  it('builds prompt context from DB and calls Gemini with it', async () => {
    // Use the default Gemini mock from jest.setup.ts which returns valid data
    mockMatchExpenseRecord.mockResolvedValue({
      itemId: 1, merchantId: null, categoryId: 1, subCategoryId: null, confidence: 0.95,
    });

    const result = await refineAndExtractEnititesFromTranscript('اشتريت خبز بخمسين جنيه من كارفور');

    // Verify DB was queried for context
    expect(mockGetTopItems).toHaveBeenCalledWith(50);
    expect(mockGetAllMerchants).toHaveBeenCalled();
    expect(mockGetAllCategories).toHaveBeenCalled();

    // Verify we got a result
    expect(result).toHaveLength(1);
    expect(result[0].item).toBe('خبز');
  });

  it('passes context to Gemini in the prompt', async () => {
    // Capture what Gemini is called with
    let capturedContents = '';
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockImplementation(({ contents }: any) => {
          capturedContents = contents;
          return {
            text: JSON.stringify([{
              item: 'خبز', price: 50, currency: 'جنيه', subCategory: 'مخبوزات',
              mainCategory: 'أكل ومشروبات', description: '', confidence: 0.95,
              merchant: null, priority: 'essential',
            }]),
          };
        }),
      },
    }));

    await refineAndExtractEnititesFromTranscript('خبز ٥٠ جنيه');

    // The prompt should contain the system prompt and context
    expect(capturedContents).toContain('أنت مساعد استخراج بيانات المصروفات');
    expect(capturedContents).toContain('خبز');
    expect(capturedContents).toContain('كارفور');
  });

  it('applies matcher post-processing to records', async () => {
    mockMatchExpenseRecord.mockResolvedValue({
      itemId: 1, merchantId: 1, categoryId: 1, subCategoryId: 10, confidence: 0.95,
    });

    const result = await refineAndExtractEnititesFromTranscript('خبز خمسين جنيه');

    expect(result).toHaveLength(1);
    expect(result[0].matchedItemId).toBe(1);
    expect(result[0].matchedMerchantId).toBe(1);
    expect(result[0].matchedCategoryId).toBe(1);
    expect(result[0].matchedSubCategoryId).toBe(10);
  });

  it('handles matcher failures gracefully', async () => {
    mockMatchExpenseRecord.mockRejectedValue(new Error('DB error'));

    const result = await refineAndExtractEnititesFromTranscript('خبز خمسين جنيه');

    // Should still return the record even if matcher fails
    expect(result).toHaveLength(1);
    expect(result[0].matchedItemId).toBeNull();
    expect(result[0].matchedMerchantId).toBeNull();
  });

  it('returns empty array when Gemini returns empty', async () => {
    mockGeminiResponse({ text: '[]' });
    // No Groq key set, so Groq will return []
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;

    const result = await refineAndExtractEnititesFromTranscript('خبز خمسين جنيه');
    expect(result).toEqual([]);
  });

  it('extracts multiple records from a single transcript', async () => {
    mockGeminiResponse({
      text: JSON.stringify([
        {
          item: 'خبز', price: 50, currency: 'جنيه', subCategory: 'مخبوزات',
          mainCategory: 'أكل ومشروبات', description: 'خبز فينو', confidence: 0.95,
          merchant: null, priority: 'essential',
        },
        {
          item: 'حليب', price: 30, currency: 'جنيه', subCategory: 'ألبان',
          mainCategory: 'أكل ومشروبات', description: 'حليب كامل الدسم', confidence: 0.9,
          merchant: 'كارفور', priority: 'essential',
        },
      ]),
    });

    mockMatchExpenseRecord.mockResolvedValue({
      itemId: 1, merchantId: null, categoryId: 1, subCategoryId: null, confidence: 0.95,
    });

    const result = await refineAndExtractEnititesFromTranscript('اشتريت خبز بخمسين جنيه وحليب بتلاتين جنيه من كارفور');
    expect(result).toHaveLength(2);
    expect(result[0].item).toBe('خبز');
    expect(result[1].item).toBe('حليب');
    expect(result[1].merchant).toBe('كارفور');
  });

  it('handles empty transcript', async () => {
    mockMatchExpenseRecord.mockResolvedValue({
      itemId: null, merchantId: null, categoryId: null, subCategoryId: null, confidence: 0,
    });

    const result = await refineAndExtractEnititesFromTranscript('');
    // Should process and get result from default Gemini mock
    expect(Array.isArray(result)).toBe(true);
  });

  it('handles non-expense transcript gracefully', async () => {
    // Gemini returns empty; delete Groq key so Groq also returns []
    mockGeminiResponse({ text: '[]' });
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;

    const result = await refineAndExtractEnititesFromTranscript('مرحبا كيف حالك');
    expect(result).toEqual([]);
  });

  it('filters invalid records from Gemini response', async () => {
    mockGeminiResponse({
      text: JSON.stringify([
        null,
        { item: 'خبز', price: 50, mainCategory: 'أكل ومشروبات' }, // valid
        { item: '', price: 30, mainCategory: 'أكل ومشروبات' }, // empty item
        { item: 'مشروب', mainCategory: 'أكل ومشروبات' }, // no price
        42, // not an object
        { item: 'لحمة', price: 'ليس رقماً', mainCategory: 'أكل ومشروبات' }, // price is string
      ]),
    });

    mockMatchExpenseRecord.mockResolvedValue({
      itemId: null, merchantId: null, categoryId: null, subCategoryId: null, confidence: 0,
    });

    const result = await refineAndExtractEnititesFromTranscript('خبز ولحمة');
    expect(result).toHaveLength(1);
    expect(result[0].item).toBe('خبز');
  });

  it('performs the full pipeline: context → prompt → parse → match', async () => {
    // Validate the entire pipeline runs correctly
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockImplementation(async ({ contents, config }: any) => {
          // Validate that the prompt includes proper context
          expect(contents).toContain('خبز');
          expect(contents).toContain('حليب');
          expect(contents).toContain('كارفور');
          expect(contents).toContain('أكل ومشروبات');
          expect(config?.responseMimeType).toBe('application/json');

          return {
            text: JSON.stringify([{
              item: 'خبز', price: 50, currency: 'جنيه', subCategory: 'مخبوزات',
              mainCategory: 'أكل ومشروبات', description: '', confidence: 0.95,
              merchant: 'كارفور', priority: 'essential',
            }]),
          };
        }),
      },
    }));

    mockMatchExpenseRecord.mockResolvedValue({
      itemId: 1, merchantId: 1, categoryId: 1, subCategoryId: 10, confidence: 0.95,
    });

    const result = await refineAndExtractEnititesFromTranscript('اشترى خبز من كارفور');
    expect(result).toHaveLength(1);
    expect(result[0].item).toBe('خبز');
    expect(result[0].merchant).toBe('كارفور');
    expect(result[0].matchedItemId).toBe(1);
    expect(result[0].matchedMerchantId).toBe(1);
    expect(result[0].matchedCategoryId).toBe(1);
  });
});
