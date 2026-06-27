import { transcribeAudioFile } from '@/services/transcription';
import { refineAndExtractEnititesFromTranscript } from '@/services/gemini';
import type { ExpenseRecord } from '@/services/gemini';
import { insertRecording, getTodayRecordingCount } from '@/db/recording-repo';
import { getProfile } from '@/db/profile-repo';
import { setPendingExpenses } from '@/lib/pending-expenses';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Directory, File, Paths } from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const MAX_RECORDING_MS = 60000;
export const MAX_DAILY_RECORDINGS = 10;

export const useRecordings = () => {
  const { t } = useTranslation();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userType, setUserType] = useState<string>('user');
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
  });
  const recorderState = useAudioRecorderState(audioRecorder);
  const recordingDir = new Directory(Paths.document, 'recordings');
  const finishRecordingRef = useRef<() => Promise<void>>(async () => {});

  const loadRecordings = useCallback(async () => {
    const items = (await recordingDir
      .list()
      .filter((item) => item instanceof File && item.uri.includes('.m4a'))) as File[];
    const sortedRecordings = [...items].sort((a, b) => b.lastModified! - a.lastModified!);
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

  const startRecording = async (): Promise<boolean> => {
    if (isRecording) return false;
    const count = await getTodayRecordingCount();
    if (userType === 'user' && count >= MAX_DAILY_RECORDINGS) {
      Alert.alert(t('recordings.dailyLimit'));
      return false;
    }
    setIsPaused(false);
    setTodayCount(count);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await record();
    setIsRecording(true);
    return true;
  };

  const processTranscription = async (destFile: File) => {
    setIsTranscribing(true);
    const transcription = await transcribeAudioFile(destFile);
    console.log({ transcription });
    const transcriptText = transcription?.text ?? null;
    setTranscriptionResult(transcriptText);
    setIsTranscribing(false);

    if (!transcriptText) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    const recordingId = destFile.name.replace('.m4a', '');
    if (transcriptText) {
      try {
        await insertRecording({
          id: recordingId,
          transcript: transcriptText,
          duration_ms: recorderState.durationMillis ?? 0,
        });
        setTodayCount((prev) => prev + 1);
      } catch (err) {
        console.error('Failed to save recording to DB:', err);
      }
    }

    if (transcriptText) {
      setIsExtracting(true);
      const extracted = await refineAndExtractEnititesFromTranscript(transcriptText);
      console.log({ extracted });
      setExpenseRecords(extracted ?? []);
      setPendingExpenses(extracted ?? []);

      if (extracted && extracted.length > 0) {
        const allGoodConfidence = extracted.every((r) => r.confidence >= 0.6);
        if (allGoodConfidence) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setIsExtracting(false);
    }
  };

  const stopRecordingOnly = async (): Promise<File | undefined> => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsPaused(false);
    const destFile = await stopRecording();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return destFile;
  };

  const finishRecording = async () => {
    const destFile = await stopRecordingOnly();
    if (destFile) {
      await processTranscription(destFile);
    }
    await loadRecordings();
  };

  const togglePauseRecording = async () => {
    if (isPaused) {
      audioRecorder.record();
      setIsPaused(false);
    } else {
      audioRecorder.pause();
      setIsPaused(true);
    }
  };

  const cancelRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsPaused(false);
    await audioRecorder.stop();
  };

  finishRecordingRef.current = finishRecording;

  useEffect(() => {
    if (recorderState.isRecording && recorderState.durationMillis >= MAX_RECORDING_MS) {
      finishRecordingRef.current?.();
    }
  }, [recorderState.durationMillis, recorderState.isRecording]);

  useEffect(() => {
    const initAudio = async () => {
      if (!recordingDir.exists) {
        recordingDir.create();
      }
      loadRecordings();
      const count = await getTodayRecordingCount();
      setTodayCount(count);
      const profile = await getProfile();
      if (profile) {
        setUserType(profile.user_type);
      }
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone is required!');
      }
    };
    initAudio();
  }, []);

  return {
    startRecording,
    finishRecording,
    stopRecordingOnly,
    processTranscription,
    cancelRecording,
    togglePauseRecording,
    isRecording,
    isPaused,
    recorderState,
    todayCount,
    isTranscribing,
    isExtracting,
    expenseRecords,
    transcriptionResult,
    userType,
  };
};
