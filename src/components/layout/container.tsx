import { View, Text } from "react-native";
import React from "react";
import { cn } from "@/lib/utils";

const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <View className={cn("container", className)}>{children}</View>;
};

export default Container;
