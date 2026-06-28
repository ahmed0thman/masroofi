import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { getTopItemsForPrompt } from '@/db/item-repo';
import { getAllMerchants } from '@/db/merchant-repo';
import { getAllCategories } from '@/db/category-repo';
import { matchExpenseRecord } from '@/services/matcher';
import type { ExpenseRecord } from '@/schemas';
export type { ExpenseRecord };

interface PromptContextItem {
  id: number;
  name: string;
  variants: string[];
  category: string;
  subCategory: string;
}

interface PromptContext {
  items: PromptContextItem[];
  merchants: string[];
  categories: string[];
}

const SYSTEM_PROMPT = `أنت مساعد استخراج بيانات المصروفات من التسجيلات الصوتية العربية.

## مهمتك
1. **صحح أخطاء النسخ** — Whisper أحياناً يغلط في الكلمات العامية المصرية، الأرقام، أو الخلط بين عربي وإنجليزي. صححها.
2. **حول الأرقام المكتوبة بالحروف إلى أرقام** — مثلاً "خمسين" ← 50، "تلاتين" ← 30.
3. **استخرج بيانات المصروفات** في JSON array. المستخدم قد يذكر أكثر من مصروف في تسجيل واحد (مثلاً "دفعت ٥٠٠ جنيه في كارفور على أكل البيت و ١٠٠ جنيه على بنزين").

## الفئات الرئيسية (اختر الأنسب)
- "أكل ومشروبات" — بقالة، مطاعم، قهوة، delivery
- "مواصلات" — بنزين، أوبر/كريم، مترو، صيانة عربية
- "فواتير" — كهرباء، مياه، غاز، تليفون، نت
- "تسوق" — هدوم، إلكترونيات، أدوات منزلية
- "صحة" — صيدلية، دكتور، جيم
- "ترفيه" — سينما، خروجات، هوايات
- "تعليم" — كورسات، كتب، أدوات مدرسية
- "إيجار" — إيجار الشقة
- "أخرى" — أي حاجة تانية مش من فوق

## تصنيف الأولوية
حدد أولوية كل عنصر بناءً على نوعه:
- essential (أساسي): مواد غذائية أساسية, إيجار, فواتير, أدوية مزمنة, حفاضات أطفال
- important (مهم): مواصلات, أدوية عادية, اشتراكات شهرية
- normal (عادي): ملابس, أدوات تجميل, تسوق عام
- luxury (رفاهية): ترفيه, كماليات, مطاعم فاخرة, سفر

## مخرجات JSON المطلوبة
[
  {
    "item": "اسم المصروف (عربي)",
    "price": 0,
    "currency": "رمز العملة (مثل EGP, SAR, AED, USD, EUR, QAR, KWD, BHD, OMR)",
    "subCategory": "فئة فرعية",
    "mainCategory": "فئة رئيسية من اللي فوق",
    "description": "وصف مختصر بالعربي",
    "confidence": 0.95,
    "merchant": "اسم المحل أو null",
    "priority": "essential | important | normal | luxury"
  }
]

## العملات المدعومة (استخدم الرمز المكون من 3 أحرف)
- AED — درهم إماراتي
- BHD — دينار بحريني
- DJF — فرنك جيبوتي
- DZD — دينار جزائري
- EGP — جنيه مصري
- EUR — يورو
- IQD — دينار عراقي
- JOD — دينار أردني
- KMF — فرنك قمري
- KWD — دينار كويتي
- LBP — ليرة لبنانية
- LYD — دينار ليبي
- MAD — درهم مغربي
- MRU — أوقية موريتانية
- OMR — ريال عماني
- QAR — ريال قطري
- SAR — ريال سعودي
- SDG — جنيه سوداني
- SOS — شلن صومالي
- SYP — ليرة سورية
- TND — دينار تونسي
- USD — دولار أمريكي
- YER — ريال يمني
إذا لم يذكر المستخدم عملة محددة، استخدم EGP كافتراضي.

## قواعد مهمة
- دايمًا ارجع JSON array — لو فيه مصروف واحد بس، لفه في array: [{ ... }]
- إذا كان النص فارغ أو مش مصروف، ارجع array فاضي []
- لو التصنيف مش واضح، استخدم "أخرى" ك mainCategory
- السعر لازم يكون رقم (number)، مش string
-إذا ذكر المستخدم سلعة أو خدمة بدون سعر، اعتبرها مصروفًا غير مكتمل ولا تحذفها.
إذا أمكن استخراج اسم السلعة والمتجر فقط فأرجع العنصر مع:
"price": null
ولا تستبعد العنصر من النتيجة.
- لو العمدة مش مذكور، merchant يكون null
- لو الأولوية مش واضحة، استخدم "normal"
- **حقل currency لازم يكون رمز العملة المكون من 3 أحرف (EGP, SAR, AED, USD, إلخ)**
- **فقط JSON — مفيش markdown، مفيش شرح، مفيش حاجة زيادة**
- لو فيه معلومات زيادة (زي الكمية، طريقة الدفع)، ضيفها في نفس الـ JSON
-استخرج جميع المصروفات المذكورة دون استثناء.
لا تتجاهل أي عملية شراء حتى لو كانت بعض البيانات (مثل السعر أو المتجر) مفقودة.
إذا تعذر استخراج قيمة حقل، اجعله null بدلاً من حذف العنصر بالكامل.`;

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const GROQ_MODELS = ['groq/allam-2-7b', 'llama-3.3-70b-versatile'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function buildPromptContext(): Promise<PromptContext> {
  const items = await getTopItemsForPrompt(50);
  const merchants = await getAllMerchants();
  const categories = await getAllCategories();

  return {
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      variants: i.name_variants ? (JSON.parse(i.name_variants) as string[]) : [],
      category: i.category,
      subCategory: i.subCategory,
    })),
    merchants: merchants.filter((m) => m.is_active).map((m) => m.name),
    categories: categories.filter((c) => c.is_active).map((c) => c.name),
  };
}

export function buildContextSection(context: PromptContext): string {
  const parts: string[] = [];

  if (context.items.length > 0) {
    parts.push(
      '## العناصر المعروفة في النظام\nاختر الأنسب من هذه القائمة للعناصر المطابقة:',
      ...context.items.map(
        (i) =>
          `- "${i.name}"${i.variants.length ? ` (المعروف أيضاً: ${i.variants.join(', ')})` : ''} ← فئة: ${i.category}`,
      ),
    );
  }

  if (context.merchants.length > 0) {
    parts.push('## التجار المعروفون', ...context.merchants.map((m) => `- ${m}`));
  }

  if (context.categories.length > 0) {
    parts.push('## الفئات الرئيسية', ...context.categories.map((c) => `- ${c}`));
  }

  if (context.items.length > 0 || context.merchants.length > 0 || context.categories.length > 0) {
    parts.push(
      '## قواعد المطابقة',
      '- إذا كان العنصر المذكور مشابهاً لأحد العناصر الموجودة، استخدم نفس الاسم',
      '- إذا لم يوجد تطابق، اترك العنصر كما هو وسيتم إنشاء عنصر جديد تلقائياً',
    );
  }

  return parts.join('\n');
}

function buildFullPrompt(transcript: string, context: PromptContext): string {
  const contextSection = buildContextSection(context);
  if (contextSection) {
    return `${SYSTEM_PROMPT}\n\n${contextSection}\n\nالنص:\n${transcript}`;
  }
  return `${SYSTEM_PROMPT}\n\nالنص:\n${transcript}`;
}

export function parseExpenseResponse(text: string): ExpenseRecord[] {
  let parsed: unknown = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    parsed = [parsed];
  }

  const records = (parsed as unknown[]).filter(
    (item): item is ExpenseRecord =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).item === 'string' &&
      (item as Record<string, unknown>).item !== '' &&
      typeof (item as Record<string, unknown>).price === 'number' &&
      !isNaN((item as Record<string, unknown>).price as number),
  );

  for (const record of records) {
    record.currency = record.currency || 'EGP';
    record.confidence = typeof record.confidence === 'number' ? record.confidence : 0;
    record.priority = record.priority || 'normal';
    record.matchedItemId = null;
    record.matchedMerchantId = null;
    record.matchedCategoryId = null;
    record.matchedSubCategoryId = null;
  }

  return records;
}

async function tryGemini(
  transcript: string,
  context: PromptContext,
): Promise<ExpenseRecord[] | null> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;

  const fullPrompt = buildFullPrompt(transcript, context);
  const ai = new GoogleGenAI({ apiKey });

  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    const model = GEMINI_MODELS[i];
    try {
      if (i > 0) {
        console.log(`[Gemini] Retrying with model: ${model}`);
        await sleep(1000);
      }

      const response = await ai.models.generateContent({
        model,
        contents: fullPrompt,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text;
      if (!text) {
        console.warn(`[Gemini] Empty response from ${model}`);
        continue;
      }

      const records = parseExpenseResponse(text);
      if (records.length > 0) return records;

      console.warn(`[Gemini] No valid records from ${model}`);
    } catch (error) {
      console.error(`[Gemini] ${model} failed:`, error);
    }
  }

  return null;
}

async function tryGroq(transcript: string, context: PromptContext): Promise<ExpenseRecord[]> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Groq] EXPO_PUBLIC_GROQ_API_KEY is not set');
    return [];
  }

  const contextSection = buildContextSection(context);
  const systemPrompt = contextSection ? `${SYSTEM_PROMPT}\n\n${contextSection}` : SYSTEM_PROMPT;

  const groq = new Groq({ apiKey });

  for (let i = 0; i < GROQ_MODELS.length; i++) {
    const model = GROQ_MODELS[i];
    try {
      if (i > 0) {
        console.log(`[Groq] Retrying with model: ${model}`);
        await sleep(1000);
      }

      const response = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const text = response.choices?.[0]?.message?.content;
      if (!text) {
        console.warn(`[Groq] Empty response from ${model}`);
        continue;
      }

      const records = parseExpenseResponse(text);
      if (records.length > 0) return records;

      console.warn(`[Groq] No valid records from ${model}`);
    } catch (error) {
      console.error(`[Groq] ${model} failed:`, error);
    }
  }

  return [];
}

async function applyMatcher(records: ExpenseRecord[]): Promise<ExpenseRecord[]> {
  return Promise.all(
    records.map(async (record) => {
      try {
        const match = await matchExpenseRecord({
          item: record.item,
          merchant: record.merchant,
          mainCategory: record.mainCategory,
        });
        return {
          ...record,
          matchedItemId: match.itemId,
          matchedMerchantId: match.merchantId,
          matchedCategoryId: match.categoryId,
          matchedSubCategoryId: match.subCategoryId,
          confidence: Math.min(1, (record.confidence + match.confidence) / 2),
        };
      } catch (error) {
        console.error('[Matcher] Failed to match record:', error);
        return record;
      }
    }),
  );
}

/**
 * Sends a voice transcription to an LLM for expense extraction.
 * Tries Gemini models first, then falls back to Groq models.
 * Handles multiple expenses mentioned in a single recording.
 * @param transcript - Raw Arabic transcription from Whisper
 * @returns Array of parsed ExpenseRecord items (empty array if extraction failed or no expenses found)
 */
export async function refineAndExtractEnititesFromTranscript(
  transcript: string,
): Promise<ExpenseRecord[]> {
  const context = await buildPromptContext();

  const geminiResult = await tryGemini(transcript, context);
  let records = geminiResult;

  if (!records) {
    console.log('[Gemini] Failed, falling back to Groq');
    records = await tryGroq(transcript, context);
  }

  if (records.length > 0) {
    records = await applyMatcher(records);
  }

  if (records.length === 0) {
    console.error('[Extraction] All providers exhausted, returning empty');
  }

  return records;
}

/**
 * Creates DB entities (item, merchant, category) from an unmatched expense record.
 * Called from the review screen when saving a record that has no matches.
 */
export async function createEntitiesFromExpenseRecord(record: ExpenseRecord): Promise<{
  itemId: number | null;
  merchantId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;
}> {
  const itemRepo = await import('@/db/item-repo');
  const categoryRepo = await import('@/db/category-repo');
  const merchantRepo = await import('@/db/merchant-repo');

  let categoryId = record.matchedCategoryId;
  if (!categoryId) {
    const existing = await categoryRepo.getCategoryByName(record.mainCategory);
    if (existing) {
      categoryId = existing.id;
    } else {
      categoryId = await categoryRepo.createCategory({
        name: record.mainCategory,
        default_priority: record.priority,
      });
    }
  }

  let merchantId = record.matchedMerchantId;
  if (record.merchant && !merchantId) {
    const existing = await merchantRepo.getMerchantByName(record.merchant);
    if (existing) {
      merchantId = existing.id;
    } else {
      merchantId = await merchantRepo.createMerchant({
        name: record.merchant,
        name_variants: [record.merchant],
      });
    }
  }

  let itemId = record.matchedItemId;
  if (!itemId) {
    const existing = await itemRepo.getItemByName(record.item);
    if (existing) {
      itemId = existing.id;
    } else {
      itemId = await itemRepo.createItem({
        name: record.item,
        category_id: categoryId,
        merchant_id: merchantId,
        priority: record.priority,
      });
    }
  }

  return { itemId, merchantId, categoryId, subCategoryId: null };
}
