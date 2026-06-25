import type { RecordingRow } from '@/db/recording-repo';
import type { ExpenseRow } from '@/db/expense-repo';
import type { ExpenseRecord } from '@/services/gemini';

export type { RecordingRow, ExpenseRow, ExpenseRecord };

export interface IRecording {
  id: string;
  transcript: string;
  durationMs: number;
  createdAt: string;
  uri: string;
}
