import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View className="gap-3 px-5">
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          style={{ opacity }}
          className="bg-surface-container-high rounded-[20px] h-24"
        />
      ))}
    </View>
  );
}
