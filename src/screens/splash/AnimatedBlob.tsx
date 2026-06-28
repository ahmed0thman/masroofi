import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function AnimatedBlob() {
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 18000,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate: rotation }, { scale }],
      }}
    >
      <AnimatedSvg width={240} height={240} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="blob" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#89D5C0" />
            <Stop offset="100%" stopColor="#0E6655" />
          </LinearGradient>
        </Defs>

        <Path
          fill="url(#blob)"
          d="
M44.8,-72.6C58.2,-68.4,69.3,-58.4,76.4,-45.4
C83.5,-32.3,86.5,-16.1,84.6,-1
C82.6,14.2,75.8,28.3,67.6,40.8
C59.4,53.2,49.8,63.9,37.8,71
C25.8,78.1,12.9,81.6,-1.4,84
C-15.8,86.4,-31.5,87.6,-44.5,81.2
C-57.5,74.8,-67.7,60.7,-74.3,45.6
C-80.8,30.5,-83.8,15.2,-81.4,1.4
C-79,-12.4,-71.2,-24.8,-64,-39
C-56.8,-53.2,-50.3,-69.2,-39.5,-75.5
C-28.7,-81.8,-14.4,-78.5,0.4,-79.1
C15.2,-79.8,30.4,-84.4,44.8,-72.6
"
          transform="translate(100 100)"
        />
      </AnimatedSvg>
    </Animated.View>
  );
}
