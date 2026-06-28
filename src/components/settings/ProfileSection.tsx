import { BottomSheet } from '@/components/BottomSheet';
import { Avatar } from '@/components/ui/avatar';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { useThemeColors } from '@/styles/global';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../ui/button';

export function ProfileSection() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    profile,
    name,
    gender,
    location,
    age,
    avatarUri,
    setName,
    setGender,
    setLocation,
    setAge,
    setAvatarUri,
    saveProfile,
    isSaving,
    updateProfile,
  } = useProfileEditor();

  const [showSheet, setShowSheet] = useState(false);

  const openSheet = useCallback(() => {
    setShowSheet(true);
  }, []);

  const closeSheet = useCallback(() => {
    setShowSheet(false);
  }, []);

  const handleSave = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await saveProfile();
    setShowSheet(false);
  }, [saveProfile]);

  const userInitials = profile?.name ? profile.name.slice(0, 2).toUpperCase() : '--';

  const handleAvatarTap = useCallback(() => {
    Alert.alert(t('profile.avatar.changePhoto'), '', [
      {
        text: t('profile.avatar.takePhoto'),
        onPress: async () => {
          const { granted } = await ImagePicker.requestCameraPermissionsAsync();
          if (!granted) {
            Alert.alert(t('common.error'), t('profile.avatar.permissionDenied'));
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            const uri = result.assets[0].uri;
            setAvatarUri(uri);
            await updateProfile({ avatar_uri: uri });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      },
      {
        text: t('profile.avatar.chooseFromGallery'),
        onPress: async () => {
          const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!granted) {
            Alert.alert(t('common.error'), t('profile.avatar.permissionDenied'));
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            const uri = result.assets[0].uri;
            setAvatarUri(uri);
            await updateProfile({ avatar_uri: uri });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }, [t, setAvatarUri, updateProfile]);

  return (
    <View className="flex-col gap-4 mb-8">
      <View>
        <Text className="section-title">{t('settings.profile')}</Text>
      </View>

      <View className="bg-surface-bright rounded-[20px] p-4 flex-row items-center">
        <Pressable onPress={handleAvatarTap} className="active:opacity-80">
          <Avatar src={avatarUri ?? undefined} fallback={userInitials} className="w-16 h-16" />
        </Pressable>
        <View className="flex-1 mx-4 ">
          <Text className="text-foreground font-cairo-bold text-lg">{profile?.name ?? ''}</Text>
          {/* <Text className="text-muted-foreground font-cairo text-sm">
            {profile?.gender ? (profile.gender === 'male' ? t('profile.gender.male') : t('profile.gender.female')) : ''}
            {profile?.gender && profile?.location ? ' · ' : ''}
            {profile?.location ?? ''}
          </Text> */}
          {/* {profile?.age ? (
            <Text className="text-muted-foreground font-cairo text-sm">
              {t('profile.age')}: {profile.age}
            </Text>
          ) : null} */}
        </View>
        <Button
          onPress={openSheet}
          variant="ghost"
          hitSlop={8}
          icon={<FontAwesome name="pencil-square-o" size={20} color={colors.secondaryFixed} />}
        >
          {/* {t('profile.edit')} */}
        </Button>
      </View>

      <BottomSheet visible={showSheet} onClose={closeSheet} title={t('profile.edit')}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="gap-4">
            <View className="flex-1 gap-1 ">
              <Text className="text-muted-foreground font-cairo text-sm mb-1">
                {t('profile.enterName')}
              </Text>
              <TextInput
                className="bg-surface-container-high rounded-xl px-4 py-3 text-on-surface font-cairo"
                value={name}
                onChangeText={setName}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-muted-foreground font-cairo text-sm mb-1">
                {t('profile.gender')}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  className={`flex-1 py-3 rounded-xl items-center ${
                    gender === 'male' ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                  onPress={() => setGender('male')}
                >
                  <Text
                    className={`font-cairo ${gender === 'male' ? 'text-on-primary' : 'text-on-surface'}`}
                  >
                    {t('profile.gender.male')}
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 py-3 rounded-xl items-center ${
                    gender === 'female' ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                  onPress={() => setGender('female')}
                >
                  <Text
                    className={`font-cairo ${gender === 'female' ? 'text-on-primary' : 'text-on-surface'}`}
                  >
                    {t('profile.gender.female')}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-muted-foreground font-cairo text-sm mb-1">
                {t('profile.location')}
              </Text>
              <TextInput
                className="bg-surface-container-high rounded-xl px-4 py-3 text-on-surface font-cairo"
                value={location}
                onChangeText={setLocation}
                placeholder={t('profile.location')}
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-muted-foreground font-cairo text-sm mb-1">
                {t('profile.age')}
              </Text>
              <TextInput
                className="bg-surface-container-high rounded-xl px-4 py-3 text-on-surface font-cairo"
                value={age}
                onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
                placeholder={t('profile.age')}
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View className="flex-row gap-3 mt-6">
            <Pressable
              className="flex-1 py-3 rounded-xl bg-surface-container-high items-center"
              onPress={closeSheet}
            >
              <Text className="text-on-surface font-cairo">{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              className="flex-1 py-3 rounded-xl bg-primary items-center"
              onPress={handleSave}
            >
              <Text className="text-on-primary font-cairo-semibold">
                {isSaving ? t('common.loading') : t('common.save')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
