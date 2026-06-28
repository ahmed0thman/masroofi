import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '../../lib/utils';
import { Input } from '@/components/ui/input';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  className?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  onCreateNew?: (searchText: string) => void;
  createNewLabel?: string;
  emptyMessage?: string;
}

export function Select({
  className,
  placeholder = 'Select...',
  options,
  value,
  onValueChange,
  label,
  searchable = false,
  searchPlaceholder = 'Search...',
  disabled = false,
  onCreateNew,
  createNewLabel,
  emptyMessage,
}: SelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<View>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const insets = useSafeAreaInsets();
  // Fabric (new arch, mandatory on Expo SDK 55+) reports measureInWindow
  // excluding the safe-area top inset on both iOS and Android edge-to-edge,
  // but Modal (with statusBarTranslucent) renders from the screen origin.
  // Add the inset back so the dropdown anchors to the trigger visually.
  const isNewArch = !!(globalThis as { nativeFabricUIManager?: unknown }).nativeFabricUIManager;
  const yOffset = isNewArch ? insets.top : 0;
  const selected = options.find((o) => o.value === value);
  const filtered =
    searchable && search
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options;

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setPos({ x, y, w: width, h: height });
      setOpen(true);
    });
  };

  const close = () => {
    setOpen(false);
    setSearch('');
  };
  const pick = (val: string) => {
    onValueChange?.(val);
    close();
  };

  const screenH = Dimensions.get('window').height;
  const triggerY = pos.y + yOffset;
  const belowY = triggerY + pos.h + 4;
  const listH = Math.min(filtered.length * 48, 264);
  const totalH = listH + (searchable ? 60 : 0);
  const fitsBelow = belowY + totalH < screenH;

  return (
    <View collapsable={false}>
      <Pressable
        ref={triggerRef}
        className={cn(
          'flex-row items-center justify-between h-12 px-4 border border-input rounded-lg active:bg-accent/30',
          disabled && 'opacity-50',
          'bg-surface-bright rounded-xl px-3.5 py-3 text-on-surface font-cairo',
          className,
        )}
        onPress={disabled ? undefined : handleOpen}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        <Text
          className={cn('text-base flex-1', selected ? 'text-foreground' : 'text-muted-foreground')}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#71717a"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="m6 9 6 6 6-6" />
        </Svg>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={close}
        />

        {/* Dropdown */}
        <View
          style={{
            position: 'absolute',
            left: pos.x,
            width: pos.w,
            ...(fitsBelow ? { top: belowY } : { bottom: screenH - triggerY + 4 }),
          }}
          className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        >
          {searchable && (
            <View className="px-3 pt-3 pb-2">
              <Input
                className="h-11 px-4 rounded-lg border border-input bg-background text-foreground text-base"
                placeholder={t('archive.search') || searchPlaceholder}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>
          )}

          <ScrollView style={{ height: listH }} bounces={false} keyboardShouldPersistTaps="handled">
            {filtered.map((o) => {
              const isSelected = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  className={cn(
                    'flex-row items-center h-12 px-4 active:bg-accent/50',
                    isSelected && 'bg-accent',
                  )}
                  onPress={() => pick(o.value)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className={cn(
                      'flex-1 text-base text-foreground',
                      isSelected && 'font-semibold',
                    )}
                    numberOfLines={1}
                  >
                    {o.label}
                  </Text>
                  {isSelected && <Text className="text-base text-primary font-bold">✓</Text>}
                </Pressable>
              );
            })}
            {filtered.length === 0 &&
              (onCreateNew && search ? (
                <Pressable
                  className="flex-row items-center h-12 px-4 active:bg-accent/50 gap-2"
                  onPress={() => {
                    onCreateNew(search);
                    close();
                  }}
                >
                  <Text className="text-base text-primary font-semibold">
                    {createNewLabel ?? `Create "${search}"`}
                  </Text>
                </Pressable>
              ) : (
                <View className="h-12 items-center justify-center">
                  <Text className="text-sm text-muted-foreground">
                    {emptyMessage ?? 'No results'}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
