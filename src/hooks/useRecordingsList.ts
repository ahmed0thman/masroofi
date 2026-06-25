import { useState, useEffect, useCallback } from 'react';
import { getAllRecordings, deleteRecording, type RecordingRow } from '@/db/recording-repo';
import type { IRecording } from '@/types';
import { Directory, Paths, File } from 'expo-file-system';

const recordingDir = new Directory(Paths.document, 'recordings');

function rowToIRecording(row: RecordingRow): IRecording {
  return {
    id: row.id,
    transcript: row.transcript,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
    uri: new File(recordingDir, `${row.id}.m4a`).uri,
  };
}

export function useRecordingsList() {
  const [recordings, setRecordings] = useState<IRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rows = await getAllRecordings();
      setRecordings(rows.map(rowToIRecording));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onDelete = useCallback(async (id: string) => {
    try {
      await deleteRecording(id);
      try {
        const file = new File(recordingDir, `${id}.m4a`);
        await file.delete();
      } catch {
        // File may not exist on disk
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recording');
    }
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { recordings, isLoading, error, refresh, onDelete };
}
