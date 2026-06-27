import { cn } from '@/lib/utils';
import type { ExpenseRecord } from '@/services/gemini';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TFunction } from 'i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface EditableExpense extends ExpenseRecord {
  localId: number;
}

interface ReviewCardProps {
  expense: EditableExpense;
  index: number;
  onEdit: (localId: number) => void;
  onDelete: (localId: number) => void;
  colors: Record<string, string>;
  t: TFunction;
}

function getConfidenceLabel(confidence: number, t: TFunction): string {
  if (confidence >= 0.8) return t('review.confidence.high');
  if (confidence >= 0.5) return t('review.confidence.medium');
  return t('review.confidence.low');
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-success';
  if (confidence >= 0.5) return 'text-warning';
  return 'text-destructive';
}

export function ReviewCard({
  expense,
  onEdit,
  onDelete,
  colors,
  t,
}: ReviewCardProps) {
  const handleDelete = () => {
    Alert.alert(t('review.delete'), t('review.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('review.delete'),
        style: 'destructive',
        onPress: () => onDelete(expense.localId),
      },
    ]);
  };

  return (
    <View className="bg-card rounded-2xl p-4 gap-1.5">
      {/* Row 1: Item name + Price */}
      <View className="flex-row justify-between items-start">
        <Text className="flex-1 font-cairo-bold text-base text-foreground" numberOfLines={2}>
          {expense.item}
        </Text>
        <Text
          className="font-cairo-bold text-lg"
          style={{ direction: 'ltr', color: colors.foreground }}
        >
          {expense.price} {expense.currency}
        </Text>
      </View>

      {/* Row 2: Category badge + Confidence indicator */}
      <View className="flex-row items-center gap-2 flex-wrap">
        <View className="bg-primary-container/70 rounded-full px-2.5 py-0.5">
          <Text className="text-xs font-cairo text-on-primary-container">
            {expense.mainCategory}
          </Text>
        </View>
        <Text
          className={cn(
            'text-xs font-cairo',
            getConfidenceColor(expense.confidence),
          )}
        >
          {t('review.confidence')}: {getConfidenceLabel(expense.confidence, t)}
        </Text>
      </View>

      {/* Row 3: SubCategory (if present) */}
      {expense.subCategory ? (
        <Text className="text-sm text-on-surface-variant font-cairo" numberOfLines={1}>
          {expense.subCategory}
        </Text>
      ) : null}

      {/* Row 4: Merchant (if present) */}
      {expense.merchant ? (
        <Text className="text-sm text-muted-foreground font-cairo" numberOfLines={1}>
          {expense.merchant}
        </Text>
      ) : null}

      {/* Row 5: Action buttons */}
      <View className="flex-row justify-end items-center gap-3 pt-1">
        <TouchableOpacity
          onPress={() => onEdit(expense.localId)}
          className="p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="create-outline" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          className="p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
