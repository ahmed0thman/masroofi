import { getDb } from './index';

export type UserType = 'user' | 'admin' | 'tester';

export interface Profile {
  id: number;
  name: string;
  avatar_uri: string | null;
  language: string;
  theme: string;
  reminders_enabled: number;
  user_type: UserType;
  gender: string;
  location: string;
  age: number;
  created_at: string;
  updated_at: string;
}

export async function getProfile(): Promise<Profile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Profile>('SELECT * FROM profiles LIMIT 1');
  return row ?? null;
}

export interface CreateProfileInput {
  name: string;
  language?: string;
  theme?: string;
  reminders_enabled?: number;
  gender?: string;
  location?: string;
  age?: number;
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

  const result = await db.runAsync(
    'INSERT INTO profiles (id, name, language, theme, reminders_enabled, gender, location, age, user_type, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    input.name,
    language,
    theme,
    reminders_enabled,
    gender,
    location,
    age,
    'user',
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
    created_at: now,
    updated_at: now,
  };
}

export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const allowed = ['name', 'avatar_uri', 'language', 'theme', 'reminders_enabled', 'gender', 'location', 'age', 'user_type'] as const;
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
