import { z } from 'zod';

export const recordingRowSchema = z.object({
  id: z.string(),
  transcript: z.string(),
  duration_ms: z.number(),
  created_at: z.string(),
});

export type RecordingRow = z.infer<typeof recordingRowSchema>;

export const newRecordingSchema = z.object({
  id: z.string(),
  transcript: z.string(),
  duration_ms: z.number().optional(),
});

export type NewRecording = z.infer<typeof newRecordingSchema>;

export const iRecordingSchema = z.object({
  id: z.string(),
  transcript: z.string(),
  durationMs: z.number(),
  createdAt: z.string(),
  uri: z.string(),
});

export type IRecording = z.infer<typeof iRecordingSchema>;
