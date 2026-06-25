import { Modal, View, Pressable } from 'react-native';
import React from 'react';
import { Text } from '@/components/ui/text';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
        <View className="bg-surface rounded-t-[20px] p-5 pb-8">
          <View className="w-8 h-1 bg-outline rounded-full self-center mb-4" />
          <Text className="text-lg font-cairo-bold text-on-surface text-center mb-4">{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}
