import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const steps = [
  {
    title: "Welcome",
    description:
      "Discover a new way to manage your tasks and boost productivity.",
    icon: <Ionicons name="footsteps" size={24} color="black" />,
  },
  {
    title: "Stay Focused",
    description: "Set goals, track progress, and achieve more every day.",
    icon: <MaterialIcons name="monetization-on" size={24} color="black" />,
  },
  {
    title: "Connect",
    description: "Collaborate with your team and share updates in real-time.",
    icon: <Ionicons name="people" size={24} color="black" />,
  },
];

const OnboardingScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <View className="flex-1 justify-between px-6 py-8">
      {/* Skip */}
      <View className="items-end">
        <Pressable
          onPress={() => setStep(steps.length - 1)}
          accessible={true}
          accessibilityRole="button"
        >
          <Text className="text-sm text-muted-foreground">Skip</Text>
        </Pressable>
      </View>

      {/* Slide content */}
      <View className="flex-1 items-center justify-center gap-8">
        <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
          {current.icon}
        </View>
        <View className="items-center gap-3">
          <Text variant="h2" className="text-center">
            {current.title}
          </Text>
          <Text variant="muted" className="text-center px-4">
            {current.description}
          </Text>
        </View>
      </View>

      {/* Dots */}
      <View className="flex-row justify-center gap-2 mb-6">
        {steps.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${
              i === step ? "w-8 bg-primary" : "w-2 bg-primary/20"
            }`}
          />
        ))}
      </View>

      {/* Next / Get Started */}
      <Button
        className="h-12 rounded-xl"
        onPress={() => {
          if (isLast) {
            onFinish?.();
          } else {
            setStep((s) => s + 1);
          }
        }}
      >
        {isLast ? "Get Started" : "Next"}
      </Button>
    </View>
  );
};

export default OnboardingScreen;
