import { View, Text, Image } from 'react-native';
import React from 'react';
import { Avatar } from './ui/avatar';

const Header = () => {
  const userInitials = 'AH'; // Replace with dynamic initials if available
  const [profileImageError, setProfileImageError] = React.useState(false);
  return (
    <View className="flex-row items-center gap-4 px-4 py-2">
      {profileImageError ? (
        <Avatar
          // src={require('/assets/images/user.png')}
          fallback={userInitials}
          className="w-16 h-16"
        />
      ) : (
        <Image
          source={require('@/assets/images/user.png')}
          className="w-16 h-16 rounded-full"
          onError={() => setProfileImageError(true)}
        />
      )}
      <View>
        <Text className="text-primary text-2xl font-cairo-bold">مرحبا, احمد</Text>
      </View>
    </View>
  );
};

export default Header;
