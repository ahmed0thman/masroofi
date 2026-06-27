import { getDb } from './index';

export interface AnalyticsRow {
  id: number;
  period_start: string;
  period_end: string;
  period_type: string;
  generated_at: string;
  data: string;
  insights: string | null;
  recommendations: string | null;
  status: string;
  token_estimate: number | null;
  model_used: string | null;
}

export async function insertAnalytics(data: {
  period_start: string;
  period_end: string;
  period_type?: string;
  data: string;
  insights?: string;
  recommendations?: string;
  status?: string;
  token_estimate?: number;
  model_used?: string;
}): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO analytics (period_start, period_end, period_type, generated_at, data, insights, recommendations, status, token_estimate, model_used)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.period_start,
    data.period_end,
    data.period_type ?? 'weekly',
    now,
    data.data,
    data.insights ?? null,
    data.recommendations ?? null,
    data.status ?? 'completed',
    data.token_estimate ?? null,
    data.model_used ?? null,
  );
  return result.lastInsertRowId as number;
}

export async function getLatestAnalytics(): Promise<AnalyticsRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<AnalyticsRow>(
    'SELECT * FROM analytics ORDER BY created_at DESC LIMIT 1',
  );
  return row ?? null;
}

export async function getRecentAnalytics(limit: number = 10): Promise<AnalyticsRow[]> {
  const db = await getDb();
  return db.getAllAsync<AnalyticsRow>(
    'SELECT * FROM analytics ORDER BY created_at DESC LIMIT ?',
    limit,
  );
}

export async function hasAnalyticsForPeriod(periodStart: string, periodEnd: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM analytics WHERE period_start = ? AND period_end = ?',
    periodStart,
    periodEnd,
  );
  return (row?.count ?? 0) > 0;
}

export async function getAnalyticsByDateRange(from: string, to: string): Promise<AnalyticsRow[]> {
  const db = await getDb();
  return db.getAllAsync<AnalyticsRow>(
    'SELECT * FROM analytics WHERE period_start >= ? AND period_end <= ? ORDER BY created_at DESC',
    from,
    to,
  );
}
