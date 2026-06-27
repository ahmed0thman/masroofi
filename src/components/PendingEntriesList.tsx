import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text as UIText } from '@/components/ui/text';
import type { NewExpense } from '@/db/expense-repo';
import type { TFunction } from 'i18next';

type ThemeColors = Record<string, string>;

interface PendingEntriesListProps {
  entries: NewExpense[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  colors: ThemeColors;
  t: TFunction;
}

export function PendingEntriesList({
  entries,
  onEdit,
  onRemove,
  colors,
  t,
}: PendingEntriesListProps) {
  if (entries.length === 0) return null;

  return (
    <View className="mt-5 gap-2">
      <UIText className="text-sm font-cairo-bold text-on-surface mb-1">
        {t('recordings.manualPending', { count: entries.length })}
      </UIText>
      {entries.map((entry, index) => (
        <View
          key={index}
          className="bg-surface-container-lowest rounded-xl p-3 flex-row items-center gap-2"
        >
          <View className="flex-1">
            <UIText
              className="text-sm font-cairo-semibold text-on-surface"
              numberOfLines={1}
            >
              {entry.item}
            </UIText>
            <UIText className="text-xs font-cairo text-muted-foreground">
              {entry.price} {entry.currency} · {entry.main_category}
            </UIText>
          </View>
          <View className="flex-row items-center gap-1">
            <TouchableOpacity onPress={() => onEdit(index)} className="p-1">
              <Ionicons name="create-outline" size={20} color={colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onRemove(index)} className="p-1">
              <Ionicons name="close-circle" size={20} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}
