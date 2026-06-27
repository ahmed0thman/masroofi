import { GoogleGenAI } from '@google/genai';
import { aggregateExpensesForPeriod } from '@/db/expense-repo';
import {
  hasAnalyticsForPeriod,
  getRecentAnalytics,
  insertAnalytics,
  getLatestAnalytics,
} from '@/db/analytics-repo';

export interface AnalyticsInput {
  aggregatedData: {
    totalSpent: number;
    totalTransactions: number;
    dailyAverage: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    topItems: Array<{ name: string; itemId: number; amount: number; frequency: number; priority: string }>;
    topMerchants: Array<{ name: string; merchantId: number; amount: number; frequency: number }>;
  };
  previousAnalytics: Array<{
    periodStart: string;
    periodEnd: string;
    data: Record<string, unknown>;
  }>;
}

export function getDayPeriod(date: Date): { start: string; end: string } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function getMonthPeriod(date: Date): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function getWeekPeriods(date: Date, count: number): { start: string; end: string }[] {
  const periods: { start: string; end: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() - i * 7);
    const day = d.getDay();
    const diffToFriday = day >= 5 ? day - 5 : day + 2;
    const friday = new Date(d);
    friday.setDate(d.getDate() - diffToFriday);
    friday.setHours(0, 0, 0, 0);
    const thursday = new Date(friday);
    thursday.setDate(friday.getDate() + 6);
    thursday.setHours(23, 59, 59, 999);
    periods.push({ start: friday.toISOString(), end: thursday.toISOString() });
  }
  return periods;
}

export async function aggregateForDateRange(from: string, to: string) {
  return aggregateExpensesForPeriod(from, to);
}

export function getPreviousPeriod(start: string, end: string): { start: string; end: string } {
  const s = new Date(start);
  const e = new Date(end);
  const diffMs = e.getTime() - s.getTime();
  const prevStart = new Date(s.getTime() - diffMs - 1);
  const prevEnd = new Date(s.getTime() - 1);
  return { start: prevStart.toISOString(), end: prevEnd.toISOString() };
}

export function getCurrentWeekPeriod(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToFriday = day >= 5 ? day - 5 : day + 2;
  const friday = new Date(now);
  friday.setDate(now.getDate() - diffToFriday);
  friday.setHours(0, 0, 0, 0);
  const thursday = new Date(friday);
  thursday.setDate(friday.getDate() + 6);
  thursday.setHours(23, 59, 59, 999);
  return {
    start: friday.toISOString(),
    end: thursday.toISOString(),
  };
}

export async function hasCurrentWeekAnalytics(): Promise<boolean> {
  const { start, end } = getCurrentWeekPeriod();
  return hasAnalyticsForPeriod(start, end);
}

export async function aggregateCurrentWeek(): Promise<AnalyticsInput['aggregatedData']> {
  const { start, end } = getCurrentWeekPeriod();
  const base = await aggregateExpensesForPeriod(start, end);

  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const daysInPeriod = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  return {
    ...base,
    dailyAverage: base.totalTransactions > 0 ? Math.round(base.totalSpent / daysInPeriod) : 0,
  };
}

export async function buildAnalyticsPrompt(input: AnalyticsInput): Promise<string> {
  const parts: string[] = [];

  parts.push(`أنت محلل مالي خبير في تحليل المصروفات الشخصية. حلل بيانات المصروفات للأسبوع الحالي وقارنها بالأسابيع السابقة.

قم بتحليل البيانات التالية وإرجاع JSON بالهيكل المطلوب.

## بيانات الأسابيع السابقة (آخر ٥ تقارير):

${JSON.stringify(input.previousAnalytics, null, 2)}

## بيانات الأسبوع الحالي:

${JSON.stringify(input.aggregatedData, null, 2)}

## المطلوب:
١. قارن مصروفات الأسبوع الحالي بمتوسط الأسابيع السابقة
٢. حدد الاتجاهات (زيادة/نقصان/استقرار) لكل فئة
٣. اكتشف الحالات الشاذة (أصناف غير متوقعة، زيادات مفاجئة)
٤. اكتشف الأصناف الجديدة التي لم تظهر في التقارير السابقة
٥. قدم توصيات قابلة للتنفيذ لتوفير المال
٦. احسب changeFromPrevious بالنسبة المئوية مقارنة بمتوسط آخر ٥ أسابيع

## هيكل JSON المطلوب:

{
  "summary": {
    "totalSpent": number,
    "totalTransactions": number,
    "dailyAverage": number,
    "changeFromPrevious": string,
    "changeDirection": "up" | "down" | "stable"
  },
  "byCategory": {
    "اسم الفئة": {
      "amount": number,
      "percentage": number,
      "trend": "up" | "down" | "stable",
      "vsAverage": string
    }
  },
  "byPriority": {
    "essential": { "amount": number, "percentage": number, "trend": "up" | "down" | "stable" },
    "important": { "amount": number, "percentage": number, "trend": "up" | "down" | "stable" },
    "normal": { "amount": number, "percentage": number, "trend": "up" | "down" | "stable" },
    "luxury": { "amount": number, "percentage": number, "trend": "up" | "down" | "stable" }
  },
  "topItems": [{ "name": string, "itemId": number, "amount": number, "frequency": number, "priority": string }],
  "topMerchants": [{ "name": string, "merchantId": number, "amount": number, "frequency": number }],
  "insights": [{ "text": string, "severity": "low" | "medium" | "high", "category": string }],
  "recommendations": [{ "text": string, "potentialSavings": number, "priority": "low" | "medium" | "high" }],
  "anomalies": [{ "item": string, "amount": number, "expectedAvg": number, "reason": string, "severity": "low" | "medium" | "high" }],
  "topNewItems": [{ "name": string, "category": string, "firstSeen": string }],
  "metadata": { "totalItems": number, "totalCategories": number, "totalMerchants": number, "currency": "EGP" }
}

تنبيهات:
- changeFromPrevious: احسب النسبة المئوية للتغير مقارنة بمتوسط آخر ٥ أسابيع
- percentage في byCategory و byPriority: النسبة المئوية من إجمالي المصروفات
- vsAverage: النسبة المئوية للفرق بين مصروفات الأسبوع الحالي ومتوسط الأسابيع السابقة لنفس الفئة
- potentialSavings: المبلغ المتوقع توفيره بالجنيه
- firstSeen: تاريخ أول ظهور للصنف الجديد بصيغة YYYY-MM-DD
- فقط JSON — مفيش markdown، مفيش شرح`);

  return parts.join('\n');
}

function tryExtractJson(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) return jsonMatch[1];

  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx > startIdx) {
    return text.slice(startIdx, endIdx + 1);
  }

  return text;
}

export async function generateWeeklyAnalytics(): Promise<{ id: number; analytics: any } | null> {
  try {
    const { start, end } = getCurrentWeekPeriod();

    const alreadyExists = await hasAnalyticsForPeriod(start, end);
    if (alreadyExists) {
      console.log('[Analytics] Already exists for this period');
      return null;
    }

    const aggregatedData = await aggregateCurrentWeek();
    if (aggregatedData.totalTransactions === 0) {
      console.log('[Analytics] No data for current week');
      return null;
    }

    const recentRecords = await getRecentAnalytics(5);
    const previousAnalytics = recentRecords
      .filter((r) => r.status === 'completed')
      .map((r) => {
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(r.data) as Record<string, unknown>;
        } catch {
          parsed = {};
        }
        return {
          periodStart: r.period_start,
          periodEnd: r.period_end,
          data: parsed,
        };
      });

    const input: AnalyticsInput = { aggregatedData, previousAnalytics };
    const prompt = await buildAnalyticsPrompt(input);

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Analytics] EXPO_PUBLIC_GEMINI_API_KEY not set');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      console.error('[Analytics] Empty response from Gemini');
      return null;
    }

    let analytics: Record<string, unknown>;
    try {
      analytics = JSON.parse(text) as Record<string, unknown>;
    } catch {
      const extracted = tryExtractJson(text);
      try {
        analytics = JSON.parse(extracted) as Record<string, unknown>;
      } catch {
        console.error('[Analytics] Failed to parse Gemini response');
        return null;
      }
    }

    const insights = analytics.insights
      ? JSON.stringify(analytics.insights)
      : null;
    const recommendations = analytics.recommendations
      ? JSON.stringify(analytics.recommendations)
      : null;

    const id = await insertAnalytics({
      period_start: start,
      period_end: end,
      period_type: 'weekly',
      data: JSON.stringify(analytics),
      insights: insights ?? undefined,
      recommendations: recommendations ?? undefined,
      status: 'completed',
      model_used: 'gemini-2.5-flash',
    });

    return { id, analytics };
  } catch (error) {
    console.error('[Analytics] Generation failed:', error);
    return null;
  }
}

export async function getLatestAnalyticsSummary(): Promise<{
  totalSpent: number;
  totalTransactions: number;
  dailyAverage: number;
  changeFromPrevious: string;
  topInsight: string;
  topRecommendation: string;
} | null> {
  try {
    const latest = await getLatestAnalytics();
    if (!latest) return null;

    const parsed = JSON.parse(latest.data) as {
      summary?: {
        totalSpent?: number;
        totalTransactions?: number;
        dailyAverage?: number;
        changeFromPrevious?: string;
      };
      insights?: Array<{ text: string; severity?: string; category?: string }>;
      recommendations?: Array<{ text: string; potentialSavings?: number; priority?: string }>;
    };

    const summary = parsed.summary ?? {};
    const topInsight = parsed.insights?.[0]?.text ?? '';
    const topRecommendation = parsed.recommendations?.[0]?.text ?? '';

    return {
      totalSpent: summary.totalSpent ?? 0,
      totalTransactions: summary.totalTransactions ?? 0,
      dailyAverage: summary.dailyAverage ?? 0,
      changeFromPrevious: summary.changeFromPrevious ?? '0%',
      topInsight,
      topRecommendation,
    };
  } catch (error) {
    console.error('[Analytics] Failed to get latest summary:', error);
    return null;
  }
}
