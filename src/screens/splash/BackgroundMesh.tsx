import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BackgroundMesh() {
  return (
    <>
      <LinearGradient
        colors={['#19342E', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.6 }}
        style={[
          styles.circle,
          {
            width: 420,
            height: 420,
            left: -170,
            top: -120,
          },
        ]}
      />

      <LinearGradient
        colors={['#0F241F', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.circle,
          {
            width: 380,
            height: 380,
            top: -180,
            alignSelf: 'center',
          },
        ]}
      />

      <LinearGradient
        colors={['#16302A', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.6 }}
        style={[
          styles.circle,
          {
            width: 420,
            height: 420,
            right: -170,
            top: -120,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.65,
  },
});
