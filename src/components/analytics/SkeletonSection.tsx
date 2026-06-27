import React from 'react';
import { View } from 'react-native';

interface SkeletonSectionProps {
  type: 'hero' | 'kpi' | 'budget' | 'chart' | 'items' | 'insights';
}

export function SkeletonSection({ type }: SkeletonSectionProps) {
  const dimensions = {
    hero: 'h-40 w-full mx-5 rounded-[20px]',
    kpi: 'h-20 w-32 rounded-[18px]',
    budget: 'h-32 w-full mx-5 rounded-[20px]',
    chart: 'h-64 w-full mx-5 rounded-[20px]',
    items: 'h-48 w-full mx-5 rounded-[20px]',
    insights: 'h-32 w-full mx-5 rounded-[20px]',
  };

  return (
    <View className={cn('bg-surface-container-high animate-pulse', dimensions[type])} />
  );
}

// Added cn import locally as it was missing in my thought process but it's in lib/utils.ts
import { cn } from '@/lib/utils';
