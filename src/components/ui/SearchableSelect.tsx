import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
} from "react-native";
import { useThemeColors } from "@/styles/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import { cn } from "@/lib/utils";

export interface SearchableSelectProps<T extends Record<string, any>> {
  items: T[];
  displayKey: keyof T;
  valueKey: keyof T;
  placeholder: string;
  selectedValue: any;
  selectedItem?: T | null;
  onSelect: (value: any, item: T) => void;
  onCreateNew?: (searchText: string) => void;
  emptyMessage?: string;
  showCreateNew?: boolean;
  searchThreshold?: number;
  maxResults?: number;
  disabled?: boolean;
}

export function SearchableSelect<T extends Record<string, any>>({
  items,
  displayKey,
  valueKey,
  placeholder,
  selectedValue,
  selectedItem,
  onSelect,
  onCreateNew,
  emptyMessage,
  showCreateNew = true,
  searchThreshold = 2,
  maxResults = 20,
  disabled = false,
}: SearchableSelectProps<T>) {
  const colors = useThemeColors();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const blurTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isSearching) {
      setInputValue(selectedItem ? String(selectedItem[displayKey]) : "");
    }
  }, [selectedItem, displayKey, isSearching]);

  const filteredItems = useMemo(() => {
    if (inputValue.length < searchThreshold) return [];
    const search = inputValue.toLowerCase();
    return items
      .filter((item) =>
        String(item[displayKey]).toLowerCase().includes(search)
      )
      .slice(0, maxResults);
  }, [items, inputValue, displayKey, searchThreshold, maxResults]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputValue(text);
      setIsSearching(true);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (text.length >= searchThreshold) {
        debounceTimer.current = setTimeout(() => {
          setIsOpen(true);
        }, 300);
      } else {
        close();
      }
    },
    [searchThreshold, close]
  );

  const handleFocus = useCallback(() => {
    if (inputValue.length >= searchThreshold) {
      setIsOpen(true);
    }
  }, [inputValue, searchThreshold]);

  const handleBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => {
      close();
    }, 200);
  }, [close]);

  const handleSelect = useCallback(
    (item: T) => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
      setIsSearching(false);
      setInputValue(String(item[displayKey]));
      onSelect(item[valueKey], item);
      close();
    },
    [displayKey, valueKey, onSelect, close]
  );

  const handleCreateNew = useCallback(() => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    onCreateNew?.(inputValue);
    close();
  }, [onCreateNew, inputValue, close]);

  const shouldShowDropdown = isOpen && inputValue.length >= searchThreshold;
  const showCreateNewOption =
    showCreateNew &&
    onCreateNew &&
    inputValue.length >= searchThreshold &&
    filteredItems.length === 0;

  return (
    <View className="relative z-10">
      <View className="bg-surface-bright rounded-xl px-3.5 py-3 flex-row items-center">
        <TextInput
          ref={inputRef}
          className="flex-1 text-on-surface font-cairo p-0"
          value={inputValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          editable={!disabled}
          autoCorrect={false}
        />
      </View>

      {shouldShowDropdown && (
        <View
          className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-xl shadow-2xl overflow-hidden"
          style={{ maxHeight: 200, zIndex: 1000, elevation: 10 }}
        >
          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              keyExtractor={(item, index) =>
                String(item[valueKey]) ?? String(index)
              }
              renderItem={({ item }) => {
                const isSelectedItem = item[valueKey] === selectedValue;
                return (
                  <TouchableOpacity
                    className={cn(
                      "px-3.5 py-3",
                      isSelectedItem && "bg-primary-container/30"
                    )}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      className={cn(
                        "text-on-surface font-cairo",
                        isSelectedItem && "font-cairo-semibold"
                      )}
                    >
                      {String(item[displayKey])}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              keyboardShouldPersistTaps="handled"
            />
          ) : emptyMessage ? (
            <View className="px-3.5 py-3">
              <Text className="text-muted-foreground font-cairo text-sm">
                {emptyMessage}
              </Text>
            </View>
          ) : null}

          {showCreateNewOption && (
            <TouchableOpacity
              className="border-t border-outline/30 px-3.5 py-3 flex-row items-center gap-2"
              onPress={handleCreateNew}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={colors.primary}
              />
              <Text className="text-primary font-cairo">إضافة جديد</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
