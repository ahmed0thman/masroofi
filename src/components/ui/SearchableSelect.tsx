import React, { useMemo, useCallback } from "react";
import { Select, SelectOption } from "@/components/ui/select";

export interface SearchableSelectProps<T extends Record<string, unknown>> {
  items: T[];
  displayKey: keyof T;
  valueKey: keyof T;
  placeholder: string;
  selectedValue: T[keyof T];
  selectedItem?: T | null;
  onSelect: (value: T[keyof T], item: T) => void;
  onCreateNew?: (searchText: string) => void;
  createNewLabel?: string;
  emptyMessage?: string;
  showCreateNew?: boolean;
  searchThreshold?: number;
  maxResults?: number;
  disabled?: boolean;
}

export function SearchableSelect<T extends Record<string, unknown>>({
  items,
  displayKey,
  valueKey,
  placeholder,
  selectedValue,
  onSelect,
  onCreateNew,
  createNewLabel,
  emptyMessage,
  showCreateNew = true,
  disabled = false,
}: SearchableSelectProps<T>) {
  const options: SelectOption[] = useMemo(
    () =>
      items.map((item) => ({
        label: String(item[displayKey]),
        value: String(item[valueKey]),
      })),
    [items, displayKey, valueKey],
  );

  const stringValue = selectedValue != null ? String(selectedValue) : undefined;

  const handleValueChange = useCallback(
    (stringVal: string) => {
      const item = items.find((i) => String(i[valueKey]) === stringVal);
      if (item) {
        onSelect(item[valueKey], item);
      }
    },
    [items, valueKey, onSelect],
  );

  return (
    <Select
      searchable
      placeholder={placeholder}
      options={options}
      value={stringValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      onCreateNew={showCreateNew && onCreateNew ? onCreateNew : undefined}
      createNewLabel={createNewLabel}
      emptyMessage={emptyMessage}
    />
  );
}
