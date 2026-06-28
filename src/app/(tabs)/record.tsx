import { View } from 'react-native';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import SafeAreaView from '@/components/layout/SafeAreaView';
import { RecordButton } from '@/components/recording/RecordButton';
import { RecordingHints } from '@/components/recording/RecordingHints';
import { ManualEntryCard } from '@/components/recording/ManualEntryCard';
import { useRecordings, MAX_DAILY_RECORDINGS } from '@/hooks/useRecordings';
import { setPendingLoading } from '@/lib/pending-expenses';

export default function Record() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();

  const {
    startRecording,
    stopRecordingOnly,
    processTranscription,
    cancelRecording,
    togglePauseRecording,
    isRecording,
    isPaused,
    recorderState,
    todayCount,
    userType,
  } = useRecordings();

  const handleRecordStart = () => {
    startRecording();
  };

  const handleSend = async () => {
    const file = await stopRecordingOnly();
    if (file) {
      setPendingLoading();
      router.replace('/review');
      processTranscription(file);
    }
  };

  const handleCancel = () => {
    cancelRecording();
  };

  const handleTogglePause = () => {
    togglePauseRecording();
  };

  return (
    <SafeAreaView className="bg-background flex-1 w-full">
      <View className="flex-1 gap-4 justify-center">
        <RecordingHints colors={colors} t={t} />
        <ManualEntryCard colors={colors} t={t} />
        <RecordButton
          onRecordStart={handleRecordStart}
          onSend={handleSend}
          onCancel={handleCancel}
          onTogglePause={handleTogglePause}
          isRecording={isRecording}
          isPaused={isPaused}
          durationMillis={recorderState.durationMillis ?? 0}
          todayCount={todayCount}
          atDailyLimit={userType === 'user' && todayCount >= MAX_DAILY_RECORDINGS}
          isUnlimited={userType !== 'user'}
          colors={colors}
          t={t}
        />
      </View>
    </SafeAreaView>
  );
}
