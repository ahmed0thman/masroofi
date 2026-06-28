import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Input } from '@/components/ui/input';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/styles/global';
import { cn } from '@/lib/utils';
import { SCREEN_WIDTH, SLIDES } from './constants';
import LanguageToggle from './LanguageToggle';
import ReminderSection from './ReminderSection';

interface SlideContentProps {
  slideIndex: number;
  slide: (typeof SLIDES)[number];
  isArabic: boolean;
  onLanguageChange: (lang: string) => void;
  reminders: string[];
  onAddReminder: () => void;
  onRemoveReminder: (time: string) => void;
  notifDenied: boolean;
  name?: string;
  onNameChange?: (name: string) => void;
  showNameError?: boolean;
  onNameErrorDismiss?: () => void;
  nameAutoFocus?: boolean;
  avatarUri?: string | null;
  onAvatarPress?: () => void;
}

const SlideContent: React.FC<SlideContentProps> = ({
  slideIndex,
  slide,
  isArabic,
  onLanguageChange,
  reminders,
  onAddReminder,
  onRemoveReminder,
  notifDenied,
  name,
  onNameChange,
  showNameError,
  onNameErrorDismiss,
  nameAutoFocus,
  avatarUri,
  onAvatarPress,
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={{ width: SCREEN_WIDTH }} className="px-5 flex-1 items-center justify-center">
      <View className="flex-1" />

      {slideIndex === 1 ? (
        <Pressable onPress={onAvatarPress} className="relative">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Ionicons name="person-outline" size={48} color={colors.secondary} />
            )}
          </View>
          <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-background">
            <Ionicons name="add" size={16} color="white" />
          </View>
        </Pressable>
      ) : (
        <View
          className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center"
          accessibilityLabel={t(slide.iconLabelKey)}
          accessibilityRole="image"
        >
          <Ionicons name={slide.icon} size={48} color={colors.secondary} />
        </View>
      )}

      <View className="h-6" />

      <Text
        variant="h2"
        className="text-center font-cairo-bold leading-10"
        accessibilityRole="header"
      >
        {t(slide.titleKey)}
      </Text>

      <View className="h-3" />

      <Text variant="muted" className="text-center font-cairo max-w-75">
        {t(slide.descKey)}
      </Text>

      {slideIndex === 0 && (
        <View className="w-full mt-8 gap-6">
          <LanguageToggle isArabic={isArabic} onToggle={onLanguageChange} />
        </View>
      )}

      {slideIndex === 1 && (
        <View className="w-full mt-8 gap-6">
          <Input
            className={cn(
              'font-cairo p-4 rounded-xl text-foreground',
              showNameError
                ? 'bg-surface-bright border border-destructive'
                : 'bg-surface-container-low',
            )}
            placeholder={t('profile.namePlaceholder')}
            value={name}
            onChangeText={(text) => {
              onNameChange?.(text);
              onNameErrorDismiss?.();
            }}
            autoFocus={nameAutoFocus}
            textAlign="center"
          />
        </View>
      )}

      {slideIndex === 3 && (
        <View className="w-full mt-8 gap-6">
          <ReminderSection
            reminders={reminders}
            onAddReminder={onAddReminder}
            onRemoveReminder={onRemoveReminder}
            maxReminders={3}
            notifDenied={notifDenied}
          />
        </View>
      )}

      <View className="flex-1" />
    </View>
  );
};

export default SlideContent;
