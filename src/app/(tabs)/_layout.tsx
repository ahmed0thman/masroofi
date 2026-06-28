import { cn } from '@/lib/utils';
import { useThemeColors } from '@/styles/global';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabConfig = {
  index: { iconFilled: 'home', iconOutline: 'home-outline', labelKey: 'tabs.home' as const },
  history: {
    iconFilled: 'archive',
    iconOutline: 'archive-outline',
    labelKey: 'tabs.archive' as const,
  },
  record: { iconFilled: 'mic', iconOutline: 'mic', labelKey: 'tabs.record' as const },
  analytics: {
    iconFilled: 'bar-chart',
    iconOutline: 'bar-chart-outline',
    labelKey: 'tabs.analytics' as const,
  },
  settings: {
    iconFilled: 'settings',
    iconOutline: 'settings-outline',
    labelKey: 'tabs.settings' as const,
  },
} as const;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const recordRoute = state.routes.find((r) => r.name === 'record');
  const otherRoutes = state.routes.filter((r) => r.name !== 'record');

  const renderTab = (route: (typeof state.routes)[number]) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const config = tabConfig[route.name as keyof typeof tabConfig];
    if (!config) return null;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({ type: 'tabLongPress', target: route.key });
    };

    const iconName = isFocused ? config.iconFilled : config.iconOutline;

    return (
      <TouchableOpacity
        key={route.key}
        className="flex-col items-center min-w-12 min-h-12"
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={isFocused ? colors.secondary : colors.foreground}
        />
        <Text
          className={cn(
            'mt-1 text-[11px]',
            isFocused
              ? 'text-on-surface font-cairo-semibold'
              : 'text-muted-foreground font-cairo-regular',
          )}
        >
          {t(config.labelKey)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      className="dark px-1 pb-1.5 border-t border-border bg-card items-center"
      style={{
        height: 50 + insets.bottom,
        paddingBottom: insets.bottom - 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <View className="flex-row w-full justify-around gap-16 items-center flex-1 px-4">
        <View className="flex-row  w-full justify-between items-center flex-1 px-4">
          {otherRoutes.slice(0, 2).map(renderTab)}
        </View>
        <View className="flex-row  w-full justify-between items-center flex-1 px-4">
          {otherRoutes.slice(2, 4).map(renderTab)}
        </View>
      </View>

      {recordRoute && (
        <TouchableOpacity
          className="absolute -top-5 shadow-sm shadow-border bg-card w-14 h-14 rounded-full items-center justify-center rotate-180"
          activeOpacity={0.7}
          onPress={() => {
            const event = navigation.emit({
              type: 'tabPress',
              target: recordRoute.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(recordRoute.name);
            }
          }}
          onLongPress={() => {
            navigation.emit({ type: 'tabLongPress', target: recordRoute.key });
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: state.index === state.routes.indexOf(recordRoute) }}
        >
          <Ionicons name="mic" size={28} color={colors.secondaryContainer} className="rotate-180" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="record" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
