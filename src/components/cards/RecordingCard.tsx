import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/styles/global';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useAudioPlayer } from 'expo-audio';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { IRecording } from '@/schemas';

function formatRelativeTime(isoString: string, t: TFunction): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return t('recordings.justNow', 'Just now');
  if (diffMins < 60) return t('recordings.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('recordings.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('recordings.daysAgo', { count: diffDays });
  return date.toLocaleDateString('ar-EG');
}

const RecordingCard = ({
  recording,
  onDelete,
}: {
  recording: IRecording;
  onDelete: (id: string) => void;
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const player = useAudioPlayer(recording.uri);
  const [isPlaying, setIsPlaying] = useState(false);
  const didJustFinishRef = useRef(false);
  const lastToggleRef = useRef(0);
  const relativeTime = formatRelativeTime(recording.createdAt, t);
  const durationSeconds = Math.round(recording.durationMs / 1000);

  const handlePlayPause = () => {
    const now = Date.now();
    if (now - lastToggleRef.current < 1000) return;
    lastToggleRef.current = now;

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      if (didJustFinishRef.current) {
        player.seekTo(0);
        didJustFinishRef.current = false;
      }
      player.play();
      setIsPlaying(true);
    }
  };

  const handleDelete = async () => {
    onDelete(recording.id);
  };

  useEffect(() => {
    player.volume = 10;
    const listener = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        didJustFinishRef.current = true;
        setIsPlaying(false);
      }
    });
    return () => {
      listener.remove();
    };
  }, [player]);

  return (
    <View className="flex-col bg-surface-bright rounded-[20px] p-4 mb-3 items-center gap-3">
      <View className="flex-row items-center gap-2 w-full">
        <Ionicons name="mic-outline" size={18} color={colors.secondary} />
        <Text className="text-xs text-muted-foreground">
          {relativeTime}
        </Text>
        {durationSeconds > 0 && (
          <Text className="text-xs text-muted-foreground ml-1">
            {durationSeconds}s
          </Text>
        )}
        <View className="ms-auto flex-row items-center gap-4">
          <TouchableOpacity onPress={handleDelete}>
            <FontAwesome name="trash-o" size={18} color={colors.destructive} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePlayPause}>
            {isPlaying ? (
              <FontAwesome name="pause" size={18} color={colors.secondary} />
            ) : (
              <FontAwesome name="play" size={18} color={colors.secondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-sm text-on-surface font-cairo" numberOfLines={2}>
        {recording.transcript}
      </Text>
    </View>
  );
};

export default RecordingCard;
