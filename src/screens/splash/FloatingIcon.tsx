import React from 'react';
import { View } from 'react-native';

interface Props {
  children: React.ReactNode;
  size?: number;
  background?: string;
  opacity?: number;
}

export default function FloatingIcon({
  children,
  size = 54,
  background = 'rgba(137,213,192,.15)',
  opacity = 1,
}: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      {children}
    </View>
  );
}
