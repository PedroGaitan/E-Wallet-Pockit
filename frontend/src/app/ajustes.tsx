import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";

const STORAGE_KEYS = {
  THEME: "Pockit:theme",
};

type ThemeOption = {
  id: "dark" | "light" | "red" | "blue";
  name: string;
  description: string;
  colors: [string, string];
};

const THEMES: ThemeOption[] = [
  {
    id: "dark",
    name: "Oscuro",
    description: "Fondo oscuro con alto contraste. Ideal para uso nocturno.",
    colors: ["#0F1720", "#111827"],
  },
  {
    id: "light",
    name: "Blanco",
    description: "Fondo claro y minimalista. Máxima legibilidad diurna.",
    colors: ["#FFFFFF", "#F8FAFF"],
  },
  {
    id: "red",
    name: "Rojo",
    description: "Tono rojo suave para resaltar identidad Pockit.",
    colors: ["#FFF1F0", "#FFEFEF"],
  },
  {
    id: "blue",
    name: "Azul",
    description: "Azul claro con sensación fresca y profesional.",
    colors: ["#E6F0FF", "#F5FAFF"],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState<ThemeOption["id"]>("dark");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = (await AsyncStorage.getItem(STORAGE_KEYS.THEME)) as any;
        if (stored) setActiveTheme(stored);
      } catch (e) {
        console.warn("Error leyendo tema:", e);
      }
    })();
  }, []);

  async function applyTheme(id: ThemeOption["id"]) {
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTheme(id);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, id);
    } catch (e) {
      console.warn("No se pudo persistir el tema", e);
      Alert.alert("Error", "No se pudo aplicar el tema, intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function renderItem({ item }: { item: ThemeOption }) {
    const selected = item.id === activeTheme;
    return (
      <Pressable
        onPress={() => applyTheme(item.id)}
        style={({ pressed }) => [
          styles.themeItem,
          { borderColor: selected ? "#3B82F6" : "transparent", opacity: pressed ? 0.8 : 1 },
        ]}
      >

      <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.previewWrap}>
          <LinearGradient colors={item.colors} style={styles.previewGradient} />
        </View>
        <View style={styles.themeMeta}>
          <Text style={styles.themeName}>{item.name}</Text>
          <Text style={styles.themeDesc}>{item.description}</Text>
        </View>

        <View style={styles.themeRight}>
          {selected ? <Ionicons name="checkmark-circle" size={22} color="#10B981" /> : null}
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Botón de retroceso */}
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          router.back();
        }}
        style={({ pressed }) => [
          styles.backButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Ionicons name="chevron-back" size={24} color="#0B1220" />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.infoText}>El cambio es inmediato.</Text>

        <FlatList
          data={THEMES}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 24 : 0,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  content: {
    marginTop: 8,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 12,
  },
  themeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  previewWrap: {
    width: 72,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  previewGradient: {
    flex: 1,
  },
  themeMeta: {
    flex: 1,
  },
  themeName: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#0B1220",
  },
  themeDesc: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginTop: 4,
  },
  themeRight: {
    alignItems: "flex-end",
  },
});