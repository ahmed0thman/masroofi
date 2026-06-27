import type { ExpenseRecord } from '@/services/gemini';
import type { TFunction } from 'i18next';
import { View } from 'react-native';
import { ReviewCard } from './ReviewCard';
import { ReviewEditForm } from './ReviewEditForm';

interface EditableExpense extends ExpenseRecord {
  localId: number;
}

interface ReviewListProps {
  expenses: EditableExpense[];
  editingIndex: number | null;
  onEdit: (localId: number) => void;
  onDelete: (localId: number) => void;
  onSaveCard: (localId: number, updates: Partial<ExpenseRecord>) => void;
  onCancelEdit: (localId: number) => void;
  onCategoryPress: (localId: number) => void;
  colors: Record<string, string>;
  t: TFunction;
}

export function ReviewList({
  expenses,
  editingIndex,
  onEdit,
  onDelete,
  onSaveCard,
  onCancelEdit,
  onCategoryPress,
  colors,
  t,
}: ReviewListProps) {
  return (
    <View className="gap-4 px-4 pb-4">
      {expenses.map((expense, index) => (
        <View key={expense.localId}>
          {editingIndex === index ? (
            <ReviewEditForm
              expense={expense}
              index={index}
              onSave={onSaveCard}
              onCancel={onCancelEdit}
              onCategoryPress={onCategoryPress}
              colors={colors}
              t={t}
            />
          ) : (
            <ReviewCard
              expense={expense}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              colors={colors}
              t={t}
            />
          )}
        </View>
      ))}
    </View>
  );
}
