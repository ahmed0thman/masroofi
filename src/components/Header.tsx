import { View, Text, Image } from 'react-native';
import React, { useMemo } from 'react';
import { Avatar } from './ui/avatar';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  name?: string | null;
  avatarUri?: string | null;
}

const Header = ({ name, avatarUri }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const firstNameChar = name?.split(' ')[0]?.charAt(0) ?? '';
  const lastNameInitial = name?.split(' ')[1]?.charAt(0) ?? '';
  const userInitials = `${firstNameChar} ${lastNameInitial}` || '--';
  const [profileImageError, setProfileImageError] = React.useState(false);

  const todayFormatted = useMemo(() => {
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  }, [i18n.language]);

  return (
    <View className="flex-row items-center gap-4 px-4 py-2">
      {avatarUri && !profileImageError ? (
        <Image
          source={{ uri: avatarUri }}
          className="w-16 h-16 rounded-full"
          onError={() => setProfileImageError(true)}
        />
      ) : (
        <Avatar fallback={userInitials} className="w-16 h-16" />
      )}
      <View className="flex-1 items-start">
        {name ? (
          <Text className="text-secondary text-2xl font-cairo-bold">
            {t('home.title', { name: name.split(' ')[0] })}
          </Text>
        ) : null}
        <Text className="text-on-surface-variant font-cairo-semibold">{todayFormatted}</Text>
      </View>
    </View>
  );
};

export default Header;
