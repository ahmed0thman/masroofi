import { getDb } from './index';
import type { Profile, UserType, CreateProfileInput } from '@/schemas';
export type { Profile, UserType, CreateProfileInput };

export async function getProfile(): Promise<Profile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Profile>('SELECT * FROM profiles LIMIT 1');
  return row ?? null;
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const db = await getDb();
  const now = new Date().toISOString();
  const language = input.language ?? 'ar';
  const theme = input.theme ?? 'system';
  const reminders_enabled = input.reminders_enabled ?? 1;
  const gender = input.gender ?? '';
  const location = input.location ?? '';
  const age = input.age ?? 0;
  const currency_id = input.currency_id ?? 1;

  const result = await db.runAsync(
    'INSERT INTO profiles (id, name, language, theme, reminders_enabled, gender, location, age, user_type, monthly_budget, saving_goal, analytics_day, currency_id, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 5, ?, ?, ?)',
    input.name,
    language,
    theme,
    reminders_enabled,
    gender,
    location,
    age,
    'user',
    currency_id,
    now,
    now,
  );
  return {
    id: result.lastInsertRowId as number,
    name: input.name,
    avatar_uri: null,
    language,
    theme,
    reminders_enabled,
    user_type: 'user',
    gender,
    location,
    age,
    monthly_budget: 0,
    saving_goal: 0,
    analytics_day: 5,
    currency_id,
    created_at: now,
    updated_at: now,
  };
}

export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const allowed = ['name', 'avatar_uri', 'language', 'theme', 'reminders_enabled', 'gender', 'location', 'age', 'user_type', 'monthly_budget', 'saving_goal', 'analytics_day', 'currency_id'] as const;
  const setClauses: string[] = [];
  const values: (string | number | null)[] = [];

  for (const key of allowed) {
    if (key in updates) {
      setClauses.push(`${key} = ?`);
      values.push(updates[key] as string | number | null);
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push('updated_at = ?');
  values.push(now);
  values.push(1);

  await db.runAsync(
    `UPDATE profiles SET ${setClauses.join(', ')} WHERE id = ?`,
    values,
  );
}
