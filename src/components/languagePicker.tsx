import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
];

export function LanguagePicker() {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
  };

  return (
    <View style={styles.container}>
      <Text>
        {t("settings.language")}
      </Text>
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.option,
            i18n.language === lang.code && styles.activeOption,
          ]}
          onPress={() =>
         changeLanguage(lang.code)}
         
        >
          <Text className="text-foreground">
            {lang.nativeLabel}
          {lang.label}
          </Text>
        </TouchableOpacity>
          
        
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  activeOption: {
    backgroundColor: "#e0f0ff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  nativeLabel: { fontSize: 16, fontWeight: "500" },
  label: { fontSize: 14, color: "#888" },
});