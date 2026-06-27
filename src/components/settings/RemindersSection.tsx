import { ReminderCard } from '@/components/ReminderCard';
import { Button } from '@/components/ui/button';
import { getEnabledReminders } from '@/db/reminder-repo';
import { useReminders } from '@/hooks/useReminders';
import i18n from '@/i18n';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Text, View } from 'react-native';

async function rescheduleAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('masroofi-reminders', {
      name: i18n.t('onboarding.reminder.notificationChannelName'),
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100, 100, 100],
      lightColor: '#4CAF50',
    });
  }
  const enabled = await getEnabledReminders();
  for (const reminder of enabled) {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const hour24 =
      reminder.meridiem === 'PM' && hours !== 12
        ? hours + 12
        : reminder.meridiem === 'AM' && hours === 12
          ? 0
          : hours;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('onboarding.reminder.notificationTitle'),
        subtitle: i18n.t('onboarding.reminder.notificationSubtitle'),
        body: i18n.t('onboarding.reminder.notificationBody'),
        data: { type: 'reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour24,
        minute: minutes,
      },
    });
  }
}

export function RemindersSection() {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const { reminders, addReminder, toggleReminder, deleteReminder } = useReminders();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerDate, setTimePickerDate] = useState(new Date());

  const openAddReminderSheet = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('settings.notifications'), t('onboarding.reminder.notifDenied'));
      return;
    }
    setTimePickerDate(new Date());
    setShowTimePicker(true);
  }, [t]);

  const handleTimeValueChange = useCallback(
    async (_: DateTimePickerChangeEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
        if (!selectedDate) return;
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const meridiem = hours >= 12 ? 'PM' : 'AM';
        const hour12 = (hours % 12 || 12).toString();
        await addReminder({ time: `${hour12}:${minutes}`, meridiem });
        await rescheduleAllReminders();
      } else {
        if (!selectedDate) return;
        setTimePickerDate(selectedDate);
      }
    },
    [addReminder],
  );

  const handleTimeCancel = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  const handleToggleReminder = useCallback(
    async (id: number, enabled: boolean) => {
      await toggleReminder(id, enabled);
      await rescheduleAllReminders();
    },
    [toggleReminder],
  );

  const handleDeleteReminder = useCallback(
    (id: number) => {
      Alert.alert(t('settings.reminders.deleteConfirm'), '', [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await deleteReminder(id);
            await rescheduleAllReminders();
          },
        },
      ]);
    },
    [deleteReminder, t],
  );

  return (
    <>
      <View>
        <Text className="section-title">{t('settings.reminders')}</Text>
      </View>
      <View className="mx-5 gap-5">
        {reminders.length === 0 ? (
          <View className="bg-surface-bright rounded-[20px] p-4 w-full">
            <Text className="text-muted-foreground font-cairo text-center">
              {t('settings.reminders.noReminders')}
            </Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              time={reminder.time}
              meridiem={reminder.meridiem}
              enabled={reminder.enabled === 1}
              onToggle={(enabled) => handleToggleReminder(reminder.id, enabled)}
              onDelete={() => handleDeleteReminder(reminder.id)}
            />
          ))
        )}
        <Button
          variant="default"
          onPress={openAddReminderSheet}
          icon={<Ionicons name="add" size={20} color={colors.onPrimary} />}
        >
          {t('settings.reminders.add')}
        </Button>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={timePickerDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onValueChange={handleTimeValueChange}
          textColor={colors.onPrimary}
        />
      )}
    </>
  );
}
