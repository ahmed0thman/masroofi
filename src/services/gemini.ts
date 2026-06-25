import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

/** Structured expense record extracted from a voice transcription. */
export interface ExpenseRecord {
  /** What was paid for (e.g. "خضار وفاكهة", "بنزين 95", "فاتورة كهرباء") */
  item: string;
  /** The amount spent */
  price: number;
  /** Currency (default "جنيه") */
  currency: string;
  /** Specific category (e.g. "خضروات", "بنزين", "كهرباء") */
  subCategory: string;
  /** Broad category matching the app's classification system */
  mainCategory: string;
  /** Brief Arabic description */
  description: string;
  /** 0-1 confidence in the extraction */
  confidence: number;
  /** Store/merchant name if mentioned (e.g. "كارفور", "مترو") */
  merchant: string | null;
  /** Any extra fields found in the transcript (e.g. quantity, payment method) */
  [key: string]: unknown;
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

## مخرجات JSON المطلوبة
[
  {
    "item": "اسم المصروف (عربي)",
    "price": 0,
    "currency": "جنيه",
    "subCategory": "فئة فرعية",
    "mainCategory": "فئة رئيسية من اللي فوق",
    "description": "وصف مختصر بالعربي",
    "confidence": 0.95,
    "merchant": "اسم المحل أو null"
  }
]

## قواعد مهمة
- دايمًا ارجع JSON array — لو فيه مصروف واحد بس، لفه في array: [{ ... }]
- إذا كان النص فارغ أو مش مصروف، ارجع array فاضي []
- لو التصنيف مش واضح، استخدم "أخرى" ك mainCategory
- السعر لازم يكون رقم (number)، مش string
- لو العمدة مش مذكور، merchant يكون null
- **فقط JSON — مفيش markdown، مفيش شرح، مفيش حاجة زيادة**
- لو فيه معلومات زيادة (زي الكمية، طريقة الدفع)، ضيفها في نفس الـ JSON`;

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite-preview'];
const GROQ_MODELS = ['groq/allam-2-7b', 'llama-3.3-70b-versatile'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseExpenseResponse(text: string): ExpenseRecord[] {
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
    record.currency = record.currency || 'جنيه';
    record.confidence = typeof record.confidence === 'number' ? record.confidence : 0;
  }

  return records;
}

async function tryGemini(transcript: string): Promise<ExpenseRecord[] | null> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;

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
        contents: `${SYSTEM_PROMPT}\n\nالنص:\n${transcript}`,
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

async function tryGroq(transcript: string): Promise<ExpenseRecord[]> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Groq] EXPO_PUBLIC_GROQ_API_KEY is not set');
    return [];
  }

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
          { role: 'system', content: SYSTEM_PROMPT },
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
  // Try Gemini first (responseMimeType: json gives structured output)
  const geminiResult = await tryGemini(transcript);
  if (geminiResult) return geminiResult;

  console.log('[Gemini] Failed, falling back to Groq');

  // Fall back to Groq (uses same API key as Whisper)
  const groqResult = await tryGroq(transcript);
  if (groqResult.length > 0) return groqResult;

  console.error('[Extraction] All providers exhausted, returning empty');
  return [];
}
