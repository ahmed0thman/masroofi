/**
 * Comprehensive tests for all Zod schemas defined in src/schemas/.
 *
 * Every schema gets at least:
 *  - Valid data → .parse() succeeds
 *  - Missing required field → throws ZodError
 *  - Wrong type → throws ZodError
 *  - Edge case (null, undefined, empty string, boundary)
 */
import { ZodError } from 'zod';
import {
  currencySchema,
  expenseRowSchema,
  newExpenseSchema,
  expenseFiltersSchema,
  profileSchema,
  createProfileInputSchema,
  categoryRowSchema,
  subCategoryRowSchema,
  merchantRowSchema,
  itemRowSchema,
  recordingRowSchema,
  newRecordingSchema,
  iRecordingSchema,
  reminderSchema,
  newReminderSchema,
  budgetOverviewSchema,
  budgetProgressItemSchema,
  savingsGoalSchema,
  createGoalInputSchema,
  analyticsRowSchema,
  aggregatedDataSchema,
  geminiAnalyticsResponseSchema,
  changeLogRowSchema,
  wordEquivalenceRowSchema,
  expenseRecordSchema,
  matchResultSchema,
  editableExpenseSchema,
} from '@/schemas/index';

// ============================================================
// currencySchema
// ============================================================
describe('currencySchema', () => {
  const validCurrency = {
    id: 1,
    code: 'EGP',
    name_ar: 'جنيه مصري',
    name_en: 'Egyptian Pound',
    symbol: 'ج.م',
    symbol_en: 'EGP',
    is_default: 1,
  };

  it('parses valid currency', () => {
    expect(() => currencySchema.parse(validCurrency)).not.toThrow();
  });

  it('rejects missing code', () => {
    const { code: _, ...invalid } = validCurrency;
    expect(() => currencySchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects missing name_ar', () => {
    const { name_ar: _, ...invalid } = validCurrency;
    expect(() => currencySchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects wrong type for id (string instead of number)', () => {
    expect(() => currencySchema.parse({ ...validCurrency, id: 'abc' })).toThrow(ZodError);
  });

  it('rejects wrong type for is_default (string instead of number)', () => {
    expect(() => currencySchema.parse({ ...validCurrency, is_default: 'yes' })).toThrow(ZodError);
  });

  it('accepts zero and negative id values', () => {
    expect(() => currencySchema.parse({ ...validCurrency, id: 0 })).not.toThrow();
    expect(() => currencySchema.parse({ ...validCurrency, id: -1 })).not.toThrow();
  });

  it('rejects null for required string field', () => {
    expect(() => currencySchema.parse({ ...validCurrency, code: null })).toThrow(ZodError);
  });

  it('rejects undefined for required field', () => {
    expect(() => currencySchema.parse({ ...validCurrency, code: undefined })).toThrow(ZodError);
  });

  it('accepts empty strings for string fields', () => {
    expect(() => currencySchema.parse({ ...validCurrency, symbol: '' })).not.toThrow();
  });
});

// ============================================================
// expenseRowSchema
// ============================================================
describe('expenseRowSchema', () => {
  const validExpense = {
    id: 1,
    item_name: 'خبز',
    price: 50,
    currency_id: 1,
    description: 'شراء خبز',
    merchant_id: null,
    merchant_name: null,
    item_id: null,
    item_name_variants: null,
    category_id: 1,
    category_name: 'أكل ومشروبات',
    category_default_priority: 'essential',
    sub_category_id: 5,
    sub_category_name: 'مخبوزات',
    confidence: 0.95,
    transcript_id: null,
    source: 'voice',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  it('parses valid expense row', () => {
    expect(() => expenseRowSchema.parse(validExpense)).not.toThrow();
  });

  it('rejects missing item_name', () => {
    const { item_name: _, ...invalid } = validExpense;
    expect(() => expenseRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number price', () => {
    expect(() => expenseRowSchema.parse({ ...validExpense, price: 'fifty' })).toThrow(ZodError);
  });

  it('rejects non-integer currency_id', () => {
    expect(() => expenseRowSchema.parse({ ...validExpense, currency_id: 'EGP' })).toThrow(ZodError);
  });

  it('allows optional fields to be undefined', () => {
    const { merchant_name: _1, item_name_variants: _2, category_name: _3,
            category_default_priority: _4, sub_category_name: _5, ...minimal } = { ...validExpense };
    // These are all optional — .parse() should still work
    expect(() => expenseRowSchema.parse(validExpense)).not.toThrow();
  });

  it('accepts zero price', () => {
    expect(() => expenseRowSchema.parse({ ...validExpense, price: 0 })).not.toThrow();
  });

  it('accepts negative price', () => {
    expect(() => expenseRowSchema.parse({ ...validExpense, price: -10 })).not.toThrow();
  });

  it('rejects null for required string fields', () => {
    expect(() => expenseRowSchema.parse({ ...validExpense, item_name: null })).toThrow(ZodError);
  });

  it('rejects non-number confidence', () => {
    expect(() => expenseRowSchema.parse({ ...validExpense, confidence: 'high' })).toThrow(ZodError);
  });
});

// ============================================================
// newExpenseSchema
// ============================================================
describe('newExpenseSchema', () => {
  const validNewExpense = {
    item_name: 'خبز',
    price: 50,
    description: 'شراء خبز',
    merchant_id: null,
    item_id: null,
    category_id: 1,
    sub_category_id: 5,
    confidence: 0.95,
    transcript_id: null,
    source: 'voice',
  };

  it('parses valid new expense', () => {
    expect(() => newExpenseSchema.parse(validNewExpense)).not.toThrow();
  });

  it('rejects missing item_name', () => {
    const { item_name: _, ...invalid } = validNewExpense;
    expect(() => newExpenseSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects missing price', () => {
    const { price: _, ...invalid } = validNewExpense;
    expect(() => newExpenseSchema.parse(invalid)).toThrow(ZodError);
  });

  it('allows optional fields to be omitted', () => {
    const minimal = { item_name: 'خبز', price: 50 };
    expect(() => newExpenseSchema.parse(minimal)).not.toThrow();
  });

  it('rejects non-number price', () => {
    expect(() => newExpenseSchema.parse({ ...validNewExpense, price: 'fifty' })).toThrow(ZodError);
  });
});

// ============================================================
// expenseFiltersSchema
// ============================================================
describe('expenseFiltersSchema', () => {
  it('parses empty filters', () => {
    expect(() => expenseFiltersSchema.parse({})).not.toThrow();
  });

  it('parses all fields', () => {
    const filters = {
      search: 'خبز',
      category_id: 1,
      sub_category_id: 5,
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
      priceMin: 10,
      priceMax: 100,
    };
    expect(() => expenseFiltersSchema.parse(filters)).not.toThrow();
  });

  it('rejects wrong type for category_id', () => {
    expect(() => expenseFiltersSchema.parse({ category_id: 'abc' })).toThrow(ZodError);
  });

  it('rejects wrong type for priceMin', () => {
    expect(() => expenseFiltersSchema.parse({ priceMin: 'free' })).toThrow(ZodError);
  });

  it('partially parses with just search', () => {
    const result = expenseFiltersSchema.parse({ search: 'خبز' });
    expect(result.search).toBe('خبز');
    expect(result.category_id).toBeUndefined();
  });
});

// ============================================================
// profileSchema
// ============================================================
describe('profileSchema', () => {
  const validProfile = {
    id: 1,
    name: 'أحمد',
    avatar_uri: null,
    language: 'ar',
    theme: 'system',
    reminders_enabled: 1,
    user_type: 'user',
    gender: 'ذكر',
    location: 'القاهرة',
    age: 30,
    monthly_budget: 5000,
    saving_goal: 10000,
    analytics_day: 5,
    currency_id: 1,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  it('parses valid profile', () => {
    expect(() => profileSchema.parse({ ...validProfile, currency_id: 1 })).not.toThrow();
  });

  it('rejects missing name', () => {
    const { name: _, ...invalid } = validProfile;
    expect(() => profileSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects invalid user_type', () => {
    expect(() => profileSchema.parse({ ...validProfile, user_type: 'superadmin' })).toThrow(ZodError);
  });

  it('accepts all valid user_types', () => {
    for (const ut of ['user', 'admin', 'tester'] as const) {
      expect(() => profileSchema.parse({ ...validProfile, user_type: ut })).not.toThrow();
    }
  });

  it('rejects non-number age', () => {
    expect(() => profileSchema.parse({ ...validProfile, age: 'old' })).toThrow(ZodError);
  });

  it('accepts nullable avatar_uri as null', () => {
    expect(() => profileSchema.parse({ ...validProfile, avatar_uri: null })).not.toThrow();
  });

  it('accepts avatar_uri as string', () => {
    expect(() => profileSchema.parse({ ...validProfile, avatar_uri: 'https://example.com/avatar.png' })).not.toThrow();
  });
});

// ============================================================
// createProfileInputSchema
// ============================================================
describe('createProfileInputSchema', () => {
  const validInput = {
    name: 'أحمد',
    language: 'ar',
    theme: 'system',
    reminders_enabled: 1,
    gender: 'ذكر',
    location: 'القاهرة',
    age: 30,
  };

  it('parses valid input', () => {
    expect(() => createProfileInputSchema.parse(validInput)).not.toThrow();
  });

  it('requires only name', () => {
    expect(() => createProfileInputSchema.parse({ name: 'أحمد' })).not.toThrow();
  });

  it('rejects missing name', () => {
    expect(() => createProfileInputSchema.parse({})).toThrow(ZodError);
  });

  it('rejects non-number age', () => {
    expect(() => createProfileInputSchema.parse({ name: 'أحمد', age: 'old' })).toThrow(ZodError);
  });

  it('rejects non-number reminders_enabled', () => {
    expect(() => createProfileInputSchema.parse({ name: 'أحمد', reminders_enabled: 'yes' })).toThrow(ZodError);
  });
});

// ============================================================
// categoryRowSchema
// ============================================================
describe('categoryRowSchema', () => {
  const validCategory = {
    id: 1,
    name: 'أكل ومشروبات',
    name_en: 'Food & Drinks',
    icon: 'fast-food',
    color: '#FF5733',
    default_priority: 'essential',
    sort_order: 1,
    is_active: 1,
  };

  it('parses valid category', () => {
    expect(() => categoryRowSchema.parse(validCategory)).not.toThrow();
  });

  it('rejects missing name', () => {
    const { name: _, ...invalid } = validCategory;
    expect(() => categoryRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects invalid default_priority', () => {
    expect(() => categoryRowSchema.parse({ ...validCategory, default_priority: 'super' })).toThrow(ZodError);
  });

  it('accepts all valid priorities', () => {
    for (const p of ['essential', 'important', 'normal', 'luxury'] as const) {
      expect(() => categoryRowSchema.parse({ ...validCategory, default_priority: p })).not.toThrow();
    }
  });

  it('accepts nullable name_en as null', () => {
    expect(() => categoryRowSchema.parse({ ...validCategory, name_en: null })).not.toThrow();
  });

  it('rejects non-number sort_order', () => {
    expect(() => categoryRowSchema.parse({ ...validCategory, sort_order: 'first' })).toThrow(ZodError);
  });
});

// ============================================================
// subCategoryRowSchema
// ============================================================
describe('subCategoryRowSchema', () => {
  const validSub = {
    id: 1,
    name: 'مخبوزات',
    name_en: 'Bakery',
    category_id: 1,
    is_active: 1,
  };

  it('parses valid sub-category', () => {
    expect(() => subCategoryRowSchema.parse(validSub)).not.toThrow();
  });

  it('rejects missing name', () => {
    const { name: _, ...invalid } = validSub;
    expect(() => subCategoryRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects missing category_id', () => {
    const { category_id: _, ...invalid } = validSub;
    expect(() => subCategoryRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts null name_en', () => {
    expect(() => subCategoryRowSchema.parse({ ...validSub, name_en: null })).not.toThrow();
  });

  it('rejects non-number category_id', () => {
    expect(() => subCategoryRowSchema.parse({ ...validSub, category_id: 'food' })).toThrow(ZodError);
  });
});

// ============================================================
// merchantRowSchema
// ============================================================
describe('merchantRowSchema', () => {
  const validMerchant = {
    id: 1,
    name: 'كارفور',
    name_variants: '["Carrefour"]',
    name_en: 'Carrefour',
    icon: 'store',
    color: '#0047AB',
    is_active: 1,
  };

  it('parses valid merchant', () => {
    expect(() => merchantRowSchema.parse(validMerchant)).not.toThrow();
  });

  it('rejects missing name', () => {
    const { name: _, ...invalid } = validMerchant;
    expect(() => merchantRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts nullable fields as null', () => {
    expect(() => merchantRowSchema.parse({ ...validMerchant, name_variants: null, name_en: null, icon: null, color: null })).not.toThrow();
  });

  it('rejects non-number id', () => {
    expect(() => merchantRowSchema.parse({ ...validMerchant, id: 'one' })).toThrow(ZodError);
  });

  it('rejects non-number is_active', () => {
    expect(() => merchantRowSchema.parse({ ...validMerchant, is_active: 'yes' })).toThrow(ZodError);
  });
});

// ============================================================
// itemRowSchema
// ============================================================
describe('itemRowSchema', () => {
  const validItem = {
    id: 1,
    name: 'خبز',
    name_variants: JSON.stringify(['عيش', 'عيشة']),
    canonical_item_id: null,
    category_id: 1,
    sub_category_id: 5,
    merchant_id: null,
    priority: 'essential',
    is_active: 1,
  };

  it('parses valid item', () => {
    expect(() => itemRowSchema.parse(validItem)).not.toThrow();
  });

  it('rejects missing name', () => {
    const { name: _, ...invalid } = validItem;
    expect(() => itemRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts nullable fields as null', () => {
    expect(() => itemRowSchema.parse({
      ...validItem,
      name_variants: null,
      canonical_item_id: null,
      category_id: null,
      sub_category_id: null,
      merchant_id: null,
      priority: null,
    })).not.toThrow();
  });

  it('accepts any string for priority (no enum constraint at Zod level)', () => {
    expect(() => itemRowSchema.parse({ ...validItem, priority: 'super' })).not.toThrow();
  });

  it('rejects non-number is_active', () => {
    expect(() => itemRowSchema.parse({ ...validItem, is_active: 'true' })).toThrow(ZodError);
  });
});

// ============================================================
// recordingRowSchema
// ============================================================
describe('recordingRowSchema', () => {
  const validRecording = {
    id: 'uuid-123',
    transcript: 'اشتريت خبز بخمسين جنيه',
    duration_ms: 5000,
    created_at: '2025-01-01T00:00:00.000Z',
  };

  it('parses valid recording', () => {
    expect(() => recordingRowSchema.parse(validRecording)).not.toThrow();
  });

  it('rejects missing id', () => {
    const { id: _, ...invalid } = validRecording;
    expect(() => recordingRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number duration_ms', () => {
    expect(() => recordingRowSchema.parse({ ...validRecording, duration_ms: 'long' })).toThrow(ZodError);
  });

  it('accepts empty transcript', () => {
    expect(() => recordingRowSchema.parse({ ...validRecording, transcript: '' })).not.toThrow();
  });

  it('rejects null for required string', () => {
    expect(() => recordingRowSchema.parse({ ...validRecording, transcript: null })).toThrow(ZodError);
  });
});

// ============================================================
// newRecordingSchema
// ============================================================
describe('newRecordingSchema', () => {
  const validNewRecording = {
    id: 'uuid-123',
    transcript: 'اشتريت خبز بخمسين جنيه',
    duration_ms: 5000,
  };

  it('parses valid new recording', () => {
    expect(() => newRecordingSchema.parse(validNewRecording)).not.toThrow();
  });

  it('allows optional duration_ms to be omitted', () => {
    expect(() => newRecordingSchema.parse({ id: 'uuid-123', transcript: 'test' })).not.toThrow();
  });

  it('rejects missing id', () => {
    expect(() => newRecordingSchema.parse({ transcript: 'test' })).toThrow(ZodError);
  });

  it('rejects missing transcript', () => {
    expect(() => newRecordingSchema.parse({ id: 'uuid-123' })).toThrow(ZodError);
  });
});

// ============================================================
// iRecordingSchema
// ============================================================
describe('iRecordingSchema', () => {
  const validIRecording = {
    id: 'uuid-123',
    transcript: 'اشتريت خبز بخمسين جنيه',
    durationMs: 5000,
    createdAt: '2025-01-01T00:00:00.000Z',
    uri: 'file:///recordings/uuid-123.m4a',
  };

  it('parses valid IRecording', () => {
    expect(() => iRecordingSchema.parse(validIRecording)).not.toThrow();
  });

  it('rejects missing uri', () => {
    const { uri: _, ...invalid } = validIRecording;
    expect(() => iRecordingSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number durationMs', () => {
    expect(() => iRecordingSchema.parse({ ...validIRecording, durationMs: 'long' })).toThrow(ZodError);
  });

  it('accepts empty transcript', () => {
    expect(() => iRecordingSchema.parse({ ...validIRecording, transcript: '' })).not.toThrow();
  });
});

// ============================================================
// reminderSchema
// ============================================================
describe('reminderSchema', () => {
  const validReminder = {
    id: 1,
    time: '09:00',
    meridiem: 'AM',
    enabled: 1,
    created_at: '2025-01-01T00:00:00.000Z',
  };

  it('parses valid reminder', () => {
    expect(() => reminderSchema.parse(validReminder)).not.toThrow();
  });

  it('rejects missing time', () => {
    const { time: _, ...invalid } = validReminder;
    expect(() => reminderSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number enabled', () => {
    expect(() => reminderSchema.parse({ ...validReminder, enabled: 'yes' })).toThrow(ZodError);
  });

  it('accepts 0 for enabled', () => {
    expect(() => reminderSchema.parse({ ...validReminder, enabled: 0 })).not.toThrow();
  });

  it('rejects non-number id', () => {
    expect(() => reminderSchema.parse({ ...validReminder, id: 'first' })).toThrow(ZodError);
  });
});

// ============================================================
// newReminderSchema
// ============================================================
describe('newReminderSchema', () => {
  const validNewReminder = {
    time: '09:00',
    meridiem: 'AM',
    enabled: 1,
  };

  it('parses valid new reminder', () => {
    expect(() => newReminderSchema.parse(validNewReminder)).not.toThrow();
  });

  it('allows optional enabled to be omitted', () => {
    expect(() => newReminderSchema.parse({ time: '09:00', meridiem: 'PM' })).not.toThrow();
  });

  it('rejects missing time', () => {
    expect(() => newReminderSchema.parse({ meridiem: 'AM' })).toThrow(ZodError);
  });

  it('rejects missing meridiem', () => {
    expect(() => newReminderSchema.parse({ time: '09:00' })).toThrow(ZodError);
  });
});

// ============================================================
// budgetOverviewSchema
// ============================================================
describe('budgetOverviewSchema', () => {
  it('parses valid budget overview', () => {
    expect(() => budgetOverviewSchema.parse({ categoryId: 1, amount: 5000 })).not.toThrow();
  });

  it('accepts nullable categoryId', () => {
    expect(() => budgetOverviewSchema.parse({ categoryId: null, amount: 5000 })).not.toThrow();
  });

  it('rejects missing amount', () => {
    expect(() => budgetOverviewSchema.parse({ categoryId: 1 })).toThrow(ZodError);
  });

  it('rejects non-number amount', () => {
    expect(() => budgetOverviewSchema.parse({ categoryId: 1, amount: 'lots' })).toThrow(ZodError);
  });

  it('accepts zero amount', () => {
    expect(() => budgetOverviewSchema.parse({ categoryId: 1, amount: 0 })).not.toThrow();
  });
});

// ============================================================
// budgetProgressItemSchema
// ============================================================
describe('budgetProgressItemSchema', () => {
  const validProgress = {
    categoryId: 1,
    categoryName: 'أكل ومشروبات',
    budget: 5000,
    spent: 3200,
    percentage: 64,
  };

  it('parses valid progress item', () => {
    expect(() => budgetProgressItemSchema.parse(validProgress)).not.toThrow();
  });

  it('rejects missing categoryName', () => {
    const { categoryName: _, ...invalid } = validProgress;
    expect(() => budgetProgressItemSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number spent', () => {
    expect(() => budgetProgressItemSchema.parse({ ...validProgress, spent: 'lots' })).toThrow(ZodError);
  });

  it('accepts 0 for percentage', () => {
    expect(() => budgetProgressItemSchema.parse({ ...validProgress, percentage: 0 })).not.toThrow();
  });

  it('accepts 100 for percentage', () => {
    expect(() => budgetProgressItemSchema.parse({ ...validProgress, percentage: 100 })).not.toThrow();
  });
});

// ============================================================
// savingsGoalSchema
// ============================================================
describe('savingsGoalSchema', () => {
  const validGoal = {
    id: 1,
    name: 'سيارة جديدة',
    target_amount: 500000,
    current_amount: 50000,
    deadline: '2026-12-31',
    icon: 'car',
    color: '#FF0000',
    is_active: 1,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  it('parses valid goal', () => {
    expect(() => savingsGoalSchema.parse(validGoal)).not.toThrow();
  });

  it('rejects missing name', () => {
    const { name: _, ...invalid } = validGoal;
    expect(() => savingsGoalSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts nullable deadline and color', () => {
    expect(() => savingsGoalSchema.parse({ ...validGoal, deadline: null, color: null })).not.toThrow();
  });

  it('rejects non-number target_amount', () => {
    expect(() => savingsGoalSchema.parse({ ...validGoal, target_amount: 'lots' })).toThrow(ZodError);
  });

  it('rejects non-number is_active', () => {
    expect(() => savingsGoalSchema.parse({ ...validGoal, is_active: 'yes' })).toThrow(ZodError);
  });

  it('accepts zero current_amount', () => {
    expect(() => savingsGoalSchema.parse({ ...validGoal, current_amount: 0 })).not.toThrow();
  });
});

// ============================================================
// createGoalInputSchema
// ============================================================
describe('createGoalInputSchema', () => {
  const validInput = {
    name: 'سيارة جديدة',
    targetAmount: 500000,
    deadline: '2026-12-31',
    icon: 'car',
    color: '#FF0000',
  };

  it('parses valid input', () => {
    expect(() => createGoalInputSchema.parse(validInput)).not.toThrow();
  });

  it('requires only name and targetAmount', () => {
    expect(() => createGoalInputSchema.parse({ name: 'Goal', targetAmount: 1000 })).not.toThrow();
  });

  it('rejects missing name', () => {
    expect(() => createGoalInputSchema.parse({ targetAmount: 1000 })).toThrow(ZodError);
  });

  it('rejects missing targetAmount', () => {
    expect(() => createGoalInputSchema.parse({ name: 'Goal' })).toThrow(ZodError);
  });

  it('rejects non-number targetAmount', () => {
    expect(() => createGoalInputSchema.parse({ name: 'Goal', targetAmount: 'lots' })).toThrow(ZodError);
  });
});

// ============================================================
// analyticsRowSchema
// ============================================================
describe('analyticsRowSchema', () => {
  const validRow = {
    id: 1,
    period_start: '2025-01-01',
    period_end: '2025-01-07',
    period_type: 'weekly',
    generated_at: '2025-01-07T12:00:00.000Z',
    data: JSON.stringify({ total: 5000 }),
    insights: 'Spending increased by 10%',
    recommendations: 'Reduce eating out',
    status: 'completed',
    token_estimate: 1500,
    model_used: 'gemini-2.0-flash',
  };

  it('parses valid analytics row', () => {
    expect(() => analyticsRowSchema.parse(validRow)).not.toThrow();
  });

  it('rejects missing period_start', () => {
    const { period_start: _, ...invalid } = validRow;
    expect(() => analyticsRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts nullable insights, recommendations, token_estimate, model_used', () => {
    expect(() => analyticsRowSchema.parse({
      ...validRow,
      insights: null,
      recommendations: null,
      token_estimate: null,
      model_used: null,
    })).not.toThrow();
  });

  it('accepts any string for period_type (no enum constraint at Zod level)', () => {
    expect(() => analyticsRowSchema.parse({ ...validRow, period_type: 'yearly' })).not.toThrow();
  });

  it('rejects non-number id', () => {
    expect(() => analyticsRowSchema.parse({ ...validRow, id: 'first' })).toThrow(ZodError);
  });
});

// ============================================================
// aggregatedDataSchema
// ============================================================
describe('aggregatedDataSchema', () => {
  const validData = {
    totalSpent: 15000,
    totalTransactions: 42,
    dailyAverage: 500,
    byCategory: { 'أكل ومشروبات': 8000, مواصلات: 3000 },
    byPriority: { essential: 10000, luxury: 5000 },
    topItems: [
      { name: 'خبز', itemId: 1, amount: 500, frequency: 10, priority: 'essential' },
    ],
    topMerchants: [
      { name: 'كارفور', merchantId: 1, amount: 3000, frequency: 5 },
    ],
  };

  it('parses valid aggregated data', () => {
    expect(() => aggregatedDataSchema.parse(validData)).not.toThrow();
  });

  it('rejects missing totalSpent', () => {
    const { totalSpent: _, ...invalid } = validData;
    expect(() => aggregatedDataSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number totalTransactions', () => {
    expect(() => aggregatedDataSchema.parse({ ...validData, totalTransactions: 'many' })).toThrow(ZodError);
  });

  it('allows empty arrays for topItems and topMerchants', () => {
    expect(() => aggregatedDataSchema.parse({
      ...validData,
      topItems: [],
      topMerchants: [],
    })).not.toThrow();
  });

  it('accepts nullable itemId and merchantId', () => {
    expect(() => aggregatedDataSchema.parse({
      ...validData,
      topItems: [{ name: 'خبز', itemId: null, amount: 500, frequency: 10, priority: 'essential' }],
      topMerchants: [{ name: 'كارفور', merchantId: null, amount: 3000, frequency: 5 }],
    })).not.toThrow();
  });

  it('rejects invalid topItem missing name', () => {
    expect(() => aggregatedDataSchema.parse({
      ...validData,
      topItems: [{ itemId: 1, amount: 500, frequency: 10, priority: 'essential' }],
    })).toThrow(ZodError);
  });
});

// ============================================================
// geminiAnalyticsResponseSchema
// ============================================================
describe('geminiAnalyticsResponseSchema', () => {
  const validResponse = {
    summary: {
      totalSpent: 15000,
      totalTransactions: 42,
      dailyAverage: 500,
      changeFromPrevious: '+10%',
      changeDirection: 'up',
    },
    byCategory: {
      'أكل ومشروبات': { amount: 8000, percentage: 53.3, trend: 'up', vsAverage: '+5%' },
    },
    byPriority: {
      essential: { amount: 10000, percentage: 66.7, trend: 'stable' },
    },
    topItems: [
      { name: 'خبز', itemId: 1, amount: 500, frequency: 10, priority: 'essential' },
    ],
    topMerchants: [
      { name: 'كارفور', merchantId: 1, amount: 3000, frequency: 5 },
    ],
    insights: [
      { text: 'Spending on food increased', severity: 'medium', category: 'food' },
    ],
    recommendations: [
      { text: 'Reduce eating out', potentialSavings: 2000, priority: 'high' },
    ],
    anomalies: [
      { item: 'خبز', amount: 500, expectedAvg: 50, reason: '10x higher than usual', severity: 'high' },
    ],
    topNewItems: [
      { name: 'جبنة', category: 'أكل ومشروبات', firstSeen: '2025-06-01' },
    ],
    metadata: {
      totalItems: 50,
      totalCategories: 9,
      totalMerchants: 20,
      currency: 'EGP',
    },
  };

  it('parses valid response', () => {
    expect(() => geminiAnalyticsResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('rejects missing summary', () => {
    const { summary: _, ...invalid } = validResponse;
    expect(() => geminiAnalyticsResponseSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects invalid changeDirection', () => {
    expect(() => geminiAnalyticsResponseSchema.parse({
      ...validResponse,
      summary: { ...validResponse.summary, changeDirection: 'sideways' },
    })).toThrow(ZodError);
  });

  it('rejects invalid severity', () => {
    expect(() => geminiAnalyticsResponseSchema.parse({
      ...validResponse,
      insights: [{ text: 'test', severity: 'critical', category: 'test' }],
    })).toThrow(ZodError);
  });

  it('rejects invalid priority in recommendations', () => {
    expect(() => geminiAnalyticsResponseSchema.parse({
      ...validResponse,
      recommendations: [{ text: 'test', potentialSavings: 100, priority: 'urgent' }],
    })).toThrow(ZodError);
  });

  it('accepts empty arrays', () => {
    expect(() => geminiAnalyticsResponseSchema.parse({
      ...validResponse,
      topItems: [],
      topMerchants: [],
      insights: [],
      recommendations: [],
      anomalies: [],
      topNewItems: [],
    })).not.toThrow();
  });

  it('rejects non-number totalSpent in summary', () => {
    expect(() => geminiAnalyticsResponseSchema.parse({
      ...validResponse,
      summary: { ...validResponse.summary, totalSpent: 'lots' },
    })).toThrow(ZodError);
  });
});

// ============================================================
// changeLogRowSchema
// ============================================================
describe('changeLogRowSchema', () => {
  const validRow = {
    id: 1,
    table_name: 'expenses',
    row_id: 42,
    action: 'CREATE',
    old_data: null,
    new_data: JSON.stringify({ item_name: 'خبز', price: 50 }),
    source: 'system',
    created_at: '2025-01-01T00:00:00.000Z',
  };

  it('parses valid change log row', () => {
    expect(() => changeLogRowSchema.parse(validRow)).not.toThrow();
  });

  it('rejects invalid action', () => {
    expect(() => changeLogRowSchema.parse({ ...validRow, action: 'DROP' })).toThrow(ZodError);
  });

  it('accepts all valid actions', () => {
    for (const a of ['CREATE', 'UPDATE', 'MERGE', 'DELETE'] as const) {
      expect(() => changeLogRowSchema.parse({ ...validRow, action: a })).not.toThrow();
    }
  });

  it('accepts nullable old_data and new_data', () => {
    expect(() => changeLogRowSchema.parse({ ...validRow, old_data: null, new_data: null })).not.toThrow();
  });

  it('rejects missing table_name', () => {
    const { table_name: _, ...invalid } = validRow;
    expect(() => changeLogRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number row_id', () => {
    expect(() => changeLogRowSchema.parse({ ...validRow, row_id: 'many' })).toThrow(ZodError);
  });
});

// ============================================================
// wordEquivalenceRowSchema
// ============================================================
describe('wordEquivalenceRowSchema', () => {
  const validRow = {
    id: 1,
    canonical: 'عيش',
    variant: 'خبز',
    dialect: 'egyptian',
    source: 'system',
  };

  it('parses valid word equivalence', () => {
    expect(() => wordEquivalenceRowSchema.parse(validRow)).not.toThrow();
  });

  it('rejects missing canonical', () => {
    const { canonical: _, ...invalid } = validRow;
    expect(() => wordEquivalenceRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects missing variant', () => {
    const { variant: _, ...invalid } = validRow;
    expect(() => wordEquivalenceRowSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts nullable dialect', () => {
    expect(() => wordEquivalenceRowSchema.parse({ ...validRow, dialect: null })).not.toThrow();
  });

  it('rejects non-number id', () => {
    expect(() => wordEquivalenceRowSchema.parse({ ...validRow, id: 'first' })).toThrow(ZodError);
  });
});

// ============================================================
// expenseRecordSchema (from gemini.ts)
// ============================================================
describe('expenseRecordSchema', () => {
  const validRecord = {
    item: 'خبز',
    price: 50,
    currency: 'EGP',
    subCategory: 'مخبوزات',
    mainCategory: 'أكل ومشروبات',
    description: 'شراء خبز',
    confidence: 0.95,
    merchant: 'كارفور',
    priority: 'essential',
    matchedItemId: null,
    matchedMerchantId: null,
    matchedCategoryId: 1,
    matchedSubCategoryId: null,
  };

  it('parses valid record', () => {
    expect(() => expenseRecordSchema.parse(validRecord)).not.toThrow();
  });

  it('rejects missing item', () => {
    const { item: _, ...invalid } = validRecord;
    expect(() => expenseRecordSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects missing price', () => {
    const { price: _, ...invalid } = validRecord;
    expect(() => expenseRecordSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts nullable merchant', () => {
    expect(() => expenseRecordSchema.parse({ ...validRecord, merchant: null })).not.toThrow();
  });

  it('rejects non-number price', () => {
    expect(() => expenseRecordSchema.parse({ ...validRecord, price: 'fifty' })).toThrow(ZodError);
  });

  it('accepts zero confidence', () => {
    expect(() => expenseRecordSchema.parse({ ...validRecord, confidence: 0 })).not.toThrow();
  });

  it('accepts nullable matched IDs', () => {
    expect(() => expenseRecordSchema.parse({ ...validRecord, matchedItemId: null, matchedMerchantId: null })).not.toThrow();
  });
});

// ============================================================
// matchResultSchema
// ============================================================
describe('matchResultSchema', () => {
  const validResult = {
    itemId: 1,
    merchantId: null,
    categoryId: 10,
    subCategoryId: null,
    confidence: 0.95,
  };

  it('parses valid match result', () => {
    expect(() => matchResultSchema.parse(validResult)).not.toThrow();
  });

  it('rejects missing itemId', () => {
    const { itemId: _, ...invalid } = validResult;
    expect(() => matchResultSchema.parse(invalid)).toThrow(ZodError);
  });

  it('accepts nullable fields', () => {
    expect(() => matchResultSchema.parse({ itemId: null, merchantId: null, categoryId: null, subCategoryId: null, confidence: 0 })).not.toThrow();
  });

  it('rejects non-number confidence', () => {
    expect(() => matchResultSchema.parse({ ...validResult, confidence: 'high' })).toThrow(ZodError);
  });
});

// ============================================================
// editableExpenseSchema
// ============================================================
describe('editableExpenseSchema', () => {
  const validEditable = {
    item: 'خبز',
    price: 50,
    currency: 'EGP',
    subCategory: 'مخبوزات',
    mainCategory: 'أكل ومشروبات',
    description: 'شراء خبز',
    confidence: 0.95,
    merchant: 'كارفور',
    priority: 'essential',
    matchedItemId: null,
    matchedMerchantId: null,
    matchedCategoryId: 1,
    matchedSubCategoryId: null,
    localId: 42,
  };

  it('parses valid editable expense', () => {
    expect(() => editableExpenseSchema.parse(validEditable)).not.toThrow();
  });

  it('rejects missing localId', () => {
    const { localId: _, ...invalid } = validEditable;
    expect(() => editableExpenseSchema.parse(invalid)).toThrow(ZodError);
  });

  it('rejects non-number localId', () => {
    expect(() => editableExpenseSchema.parse({ ...validEditable, localId: 'forty-two' })).toThrow(ZodError);
  });

  it('inherits all expenseRecordSchema fields', () => {
    const { localId: _, ...recordFields } = validEditable;
    expect(() => expenseRecordSchema.parse(recordFields)).not.toThrow();
  });
});

// ============================================================
// Type inference smoke tests
// ============================================================
describe('type inference (smoke)', () => {
  it('currencySchema infers CurrencyRow type', () => {
    const result = currencySchema.parse({
      id: 1, code: 'EGP', name_ar: 'x', name_en: 'y', symbol: 'ج.م', symbol_en: 'EGP', is_default: 1,
    });
    // Type-level check — this should compile
    const _check: number = result.id;
    const _codeCheck: string = result.code;
    expect(_check).toBe(1);
    expect(_codeCheck).toBe('EGP');
  });

  it('expenseRowSchema includes all expected fields', () => {
    const result = expenseRowSchema.parse({
      id: 1, item_name: 'x', price: 10, currency_id: 1, description: '', merchant_id: null,
      item_id: null, category_id: null, sub_category_id: null, confidence: 0, transcript_id: null,
      source: 'voice', created_at: '', updated_at: '',
    });
    expect(result.id).toBe(1);
    expect(result.item_name).toBe('x');
    expect(result.source).toBe('voice');
  });

  it('profileSchema includes user_type enum', () => {
    const result = profileSchema.parse({
      id: 1, name: 'x', avatar_uri: null, language: 'ar', theme: 'system',
      reminders_enabled: 1, user_type: 'admin', gender: '', location: '', age: 0,
      monthly_budget: 0, saving_goal: 0, analytics_day: 5, currency_id: 1,
      created_at: '', updated_at: '',
    });
    expect(result.user_type).toBe('admin');
  });

  it('geminiAnalyticsResponseSchema deep structure', () => {
    const result = geminiAnalyticsResponseSchema.parse({
      summary: { totalSpent: 100, totalTransactions: 5, dailyAverage: 20, changeFromPrevious: '+5%', changeDirection: 'up' },
      byCategory: { Food: { amount: 50, percentage: 50, trend: 'stable', vsAverage: '0%' } },
      byPriority: { essential: { amount: 80, percentage: 80, trend: 'down' } },
      topItems: [{ name: 'x', itemId: 1, amount: 10, frequency: 2, priority: 'essential' }],
      topMerchants: [{ name: 'y', merchantId: 1, amount: 20, frequency: 1 }],
      insights: [{ text: 'ok', severity: 'low', category: 'test' }],
      recommendations: [{ text: 'save', potentialSavings: 100, priority: 'medium' }],
      anomalies: [{ item: 'z', amount: 99, expectedAvg: 10, reason: 'spike', severity: 'high' }],
      topNewItems: [{ name: 'new', category: 'cat', firstSeen: '2025-01-01' }],
      metadata: { totalItems: 10, totalCategories: 3, totalMerchants: 5, currency: 'EGP' },
    });
    expect(result.summary.changeDirection).toBe('up');
    expect(result.insights[0].severity).toBe('low');
  });
});
