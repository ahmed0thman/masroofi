import { getDb } from './index';
import type { RecordingRow, NewRecording } from '@/schemas';
export type { RecordingRow, NewRecording };

export async function insertRecording(recording: NewRecording): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO recordings (id, transcript, duration_ms, created_at) VALUES (?, ?, ?, ?)',
    recording.id,
    recording.transcript,
    recording.duration_ms ?? 0,
    now,
  );
}

export async function getTodayRecordingCount(): Promise<number> {
  const db = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM recordings WHERE created_at >= ?',
    today.toISOString(),
  );
  return row?.count ?? 0;
}

export async function getAllRecordings(): Promise<RecordingRow[]> {
  const db = await getDb();
  return db.getAllAsync<RecordingRow>('SELECT * FROM recordings ORDER BY created_at DESC');
}

export async function getRecordingById(id: string): Promise<RecordingRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<RecordingRow>(
    'SELECT * FROM recordings WHERE id = ?',
    id,
  );
  return row ?? null;
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM recordings WHERE id = ?', id);
}
