import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, ThemeId } from "../context/ThemeContext";

type ThemeOption = {
  id: ThemeId;
  name: string;
  description: string;
  colors: [string, string];
};

const THEMES: ThemeOption[] = [
  { id: "dark", name: "Oscuro", description: "Fondo oscuro con alto contraste. Ideal para uso nocturno.", colors: ["#121212", "#1E1E1E"] },
  { id: "light", name: "Claro", description: "Fondo claro y minimalista. Máxima legibilidad diurna.", colors: ["#FFFFFF", "#F4F4F4"] },
  { id: "red", name: "Rojo", description: "Tono rojo suave para resaltar identidad Pockit.", colors: ["#B71C1C", "#D32F2F"] },
  { id: "blue", name: "Azul", description: "Azul claro con sensación fresca y profesional.", colors: ["#0D47A1", "#1565C0"] },
];

const STORAGE_KEYS = { THEME: "Pockit:theme" };

export default function AjustesScreen() {
  const router = useRouter();
  const { themeId, theme, setAppTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  async function applyTheme(id: ThemeId) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);

    try {
      setAppTheme(id);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, id);
    } finally {
      setSaving(false);
    }
  }

  function renderItem({ item }: { item: ThemeOption }) {
    const selected = item.id === themeId;

    return (
      <Pressable
        onPress={() => applyTheme(item.id)}
        style={({ pressed }) => [
          styles.themeItem,
          {
            borderColor: selected ? "#3B82F6" : "transparent",
            opacity: pressed ? 0.7 : 1,
            backgroundColor: theme.card,
          },
        ]}
      >
        <View style={styles.previewWrap}>
          <LinearGradient
            colors={item.colors}
            style={styles.previewGradient}
          />
        </View>

        <View style={styles.themeMeta}>
          <Text style={[styles.themeName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.themeDesc, { color: theme.text }]}>{item.description}</Text>
        </View>

        {selected && <Ionicons name="checkmark-circle" size={22} color="#10B981" />}
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Ajustes</Text>
      </View>

      {/* CONTENIDO */}
      <View style={styles.content}>
        <Text style={[styles.infoText, { color: theme.text }]}>
          Selecciona un tema para la aplicación
        </Text>

        <FlatList
          data={THEMES}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // HEADER
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
  },

  content: { flex: 1 },
  infoText: { fontSize: 14, marginBottom: 12, fontFamily: "Poppins-Regular" },

  // ITEMS DE TEMA
  themeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    elevation: 1,
  },
  previewWrap: { width: 70, height: 45, borderRadius: 8, overflow: "hidden", marginRight: 12 },
  previewGradient: { flex: 1 },
  themeMeta: { flex: 1 },
  themeName: { fontSize: 15, fontFamily: "Poppins-Medium" },
  themeDesc: { fontSize: 12, marginTop: 4, fontFamily: "Poppins-Regular" },
});
