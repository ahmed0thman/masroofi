import { transcribeAudioFile } from '@/services/transcription';
import { refineAndExtractEnititesFromTranscript } from '@/services/gemini';
import type { ExpenseRecord } from '@/services/gemini';
import type { IRecording } from '@/types';
import { insertRecording } from '@/db/recording-repo';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Directory, File, Paths } from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useRecordings = () => {
  const [recordingList, setRecordingList] = useState<IRecording[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
  });
  const recorderState = useAudioRecorderState(audioRecorder);
  const recordingDir = new Directory(Paths.document, 'recordings');

  const loadRecordings = useCallback(async () => {
    const items = (await recordingDir
      .list()
      .filter((item) => item instanceof File && item.uri.includes('.m4a'))) as File[];
    const sortedRecordings = [...items].sort((a, b) => b.lastModified! - a.lastModified!);
    setRecordingList(
      sortedRecordings.map((file) => ({
        id: file.name,
        transcript: file.name,
        durationMs: 0,
        createdAt: new Date(file.lastModified!).toISOString(),
        uri: file.uri,
      })),
    );
  }, []);

  const configureAudioSession = async () => {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
  };

  const record = async () => {
    await configureAudioSession();
    await audioRecorder.prepareToRecordAsync();
    await audioRecorder.record();
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri ?? recorderState.url;
      if (uri) {
        const source = new File(uri);
        const dest = new File(recordingDir, `${Date.now()}_${source.name}`);
        await source.move(dest);
        return dest;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleRecordingToggle = async () => {
    if (recorderState.isRecording) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const destFile = await stopRecording();
      if (destFile) {
        // Step 1: Transcribe via Whisper
        setIsTranscribing(true);
        const transcription = await transcribeAudioFile(destFile);
        console.log({ transcription });
        const transcriptText = transcription?.text ?? null;
        setTranscriptionResult(transcriptText);
        setIsTranscribing(false);

        if (!transcriptText) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        // Step 1b: Save recording to SQLite
        const recordingId = destFile.name.replace('.m4a', '');
        if (transcriptText) {
            try {
              await insertRecording({
                id: recordingId,
                transcript: transcriptText,
                duration_ms: recorderState.durationMillis ?? 0,
              });
          } catch (err) {
            console.error('Failed to save recording to DB:', err);
          }
        }

        // Step 2: Extract expense via Gemini
        if (transcriptText) {
          setIsExtracting(true);
          const extracted = await refineAndExtractEnititesFromTranscript(transcriptText);
          console.log({ extracted });
          setExpenseRecords(extracted ?? []);

          // Haptic feedback based on extraction results
          if (extracted && extracted.length > 0) {
            const allGoodConfidence = extracted.every(
              (r) => r.confidence >= 0.6,
            );
            if (allGoodConfidence) {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            } else {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
              );
            }
          } else {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error,
            );
          }
          setIsExtracting(false);
        }
      }
      await loadRecordings();
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await record();
    }
  };

  useEffect(() => {
    const initAudio = async () => {
      if (!recordingDir.exists) {
        recordingDir.create();
      }
      loadRecordings();
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone is required!');
      }
    };
    initAudio();
  }, []);

  const onDelete = async (file: File) => {
    Alert.alert('Delete Recording', 'Are you sure you want to delete this recording?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await file.delete();
            loadRecordings();
          } catch (error) {
            Alert.alert(
              'Error deleting recording',
              `An error occurred while deleting the recording: ${error}`,
            );
          }
        },
      },
    ]);
  };

  return {
    isRecording: recorderState.isRecording,
    handleRecordingToggle,
    recordingList,
    recorderState,
    recordingDir,
    onDelete,
    isTranscribing,
    transcriptionResult,
    expenseRecords,
    isExtracting,
  };
};
