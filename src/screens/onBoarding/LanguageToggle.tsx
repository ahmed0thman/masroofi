import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  isArabic: boolean;
  onToggle: (lang: string) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ isArabic, onToggle }) => {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row h-12 rounded-xl border border-outline overflow-hidden"
      accessibilityRole="tablist"
      accessibilityLabel={t('onboarding.language.ar')}
    >
      <Pressable
        className={cn(
          'flex-1 items-center justify-center',
          isArabic ? 'bg-primary' : 'bg-transparent',
        )}
        onPress={() => onToggle('ar')}
        accessibilityRole="tab"
        accessibilityLabel={t('onboarding.language.ar')}
        accessibilityState={{ selected: isArabic }}
      >
        <Text
          className={cn(
            'font-cairo-medium text-sm text-center',
            isArabic ? 'text-on-primary' : 'text-muted-foreground',
          )}
        >
          {t('onboarding.language.ar')}
        </Text>
      </Pressable>

      <Pressable
        className={cn(
          'flex-1 items-center justify-center',
          !isArabic ? 'bg-primary' : 'bg-transparent',
        )}
        onPress={() => onToggle('en')}
        accessibilityRole="tab"
        accessibilityLabel={t('onboarding.language.en')}
        accessibilityState={{ selected: !isArabic }}
      >
        <Text
          className={cn(
            'font-cairo-medium text-sm text-center',
            !isArabic ? 'text-on-primary' : 'text-muted-foreground',
          )}
        >
          {t('onboarding.language.en')}
        </Text>
      </Pressable>
    </View>
  );
};

export default LanguageToggle;
