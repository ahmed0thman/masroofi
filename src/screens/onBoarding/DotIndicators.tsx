import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

interface DotIndicatorsProps {
  slidesCount: number;
  activeSlide: number;
}

const DotIndicators: React.FC<DotIndicatorsProps> = ({ slidesCount, activeSlide }) => {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row justify-center gap-2"
      accessibilityRole="progressbar"
      accessibilityLabel={t('onboarding.slide1.title')}
      accessibilityValue={{ now: activeSlide + 1, min: 1, max: slidesCount }}
    >
      {Array.from({ length: slidesCount }).map((_, i) => (
        <View
          key={i}
          className={cn(
            'h-2 rounded-full',
            i === activeSlide ? 'w-8 bg-secondary' : 'w-2 bg-secondary/20',
          )}
        />
      ))}
    </View>
  );
};

export default DotIndicators;
