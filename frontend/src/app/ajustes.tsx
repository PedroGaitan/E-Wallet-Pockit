import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, ThemeId } from "../context/ThemeContext";

// ----------------- APARIENCIA -----------------
type AccessibilityBooleanKey = "showBalance" | "highContrast";
type AccessibilityFontSize = "small" | "medium" | "large";
type ThemeOption = {
  id: ThemeId;
  name: string;
  description: string;
  colors: [string, string];
};

const THEMES: ThemeOption[] = [
  { id: "dark", name: "Oscuro", description: "Fondo oscuro con alto contraste.", colors: ["#121212", "#1E1E1E"] },
  { id: "light", name: "Claro", description: "Fondo claro y minimalista.", colors: ["#FFFFFF", "#F4F4F4"] },
  { id: "red", name: "Rojo", description: "Tono rojo suave.", colors: ["#B71C1C", "#D32F2F"] },
  { id: "blue", name: "Azul", description: "Azul fresco y profesional.", colors: ["#0D47A1", "#1565C0"] },
];

const STORAGE_KEYS = { THEME: "Pockit:theme" };

// ---------------- TIPOS MANUALES PARA TS ----------------

type NotificationKey = "transactionReceived" | "transactionSent" | "rechargeCompleted";
type AccessibilityKey = "showBalance" | "highContrast" | "fontSize";

// ---------------- COMPONENTE ----------------

export default function AjustesScreen() {
  const router = useRouter();
  const { themeId, theme, setAppTheme } = useTheme();

  // ------------------ NOTIFICACIONES ------------------

  const [notifications, setNotifications] = useState({
    transactionReceived: true,
    transactionSent: true,
    rechargeCompleted: true,
  });

  function toggleNotification(key: NotificationKey) {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  const NOTIFICATION_ROWS: { key: NotificationKey; title: string }[] = [
    { key: "transactionReceived", title: "Dinero recibido" },
    { key: "transactionSent", title: "Dinero enviado" },
    { key: "rechargeCompleted", title: "Recargas completadas" },
  ];

  // ---------------- ACCESIBILIDAD -----------------

  const [accessibility, setAccessibility] = useState<{
  showBalance: boolean;
  highContrast: boolean;
  fontSize: AccessibilityFontSize;
  }>({
  showBalance: true,
  highContrast: false,
  fontSize: "medium",
  });

  function toggleAccess(key: AccessibilityBooleanKey) {
  setAccessibility(prev => ({
    ...prev,
    [key]: !prev[key],
  }));
}

  const ACCESS_ROWS: { label: string; key: AccessibilityBooleanKey }[] = [
  { label: "Siempre mostrar saldo", key: "showBalance" },
  { label: "Modo alto contraste", key: "highContrast" },
];

  function changeFontSize(size: AccessibilityFontSize) {
  setAccessibility(prev => ({ ...prev, fontSize: size }));
  }

  // ----------------- SEGURIDAD ----------------

  const limits = {
    transactionLimit: 500,
    dailyLimit: 1000,
    monthlyLimit: 30000,
  };

  // ----------------- TEMA ----------------

  async function applyTheme(id: ThemeId) {
    setAppTheme(id);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, id);
  }

  // ------------------ RENDER APARIENCIA ------------------

  function renderThemeItem({ item }: { item: ThemeOption }) {
    const selected = item.id === themeId;

    return (
      <Pressable
        onPress={() => applyTheme(item.id)}
        style={({ pressed }) => [
          styles.themeItem,
          {
            borderColor: selected ? "#3B82F6" : "transparent",
            backgroundColor: theme.card,
            opacity: pressed ? 0.7 : 1,
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

  // ------------------ SECCIONES DEL FLATLIST ------------------

  const SECTIONS = [
    { type: "appearance" },
    { type: "notifications" },
    { type: "security" },
    { type: "accessibility" },
    { type: "about" },
    { type: "note" },
  ];

  function renderSection({ item }: { item: { type: string } }) {
    switch (item.type) {
      case "appearance":
        return (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Apariencia</Text>
            <FlatList
              data={THEMES}
              keyExtractor={(t) => t.id}
              renderItem={renderThemeItem}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              scrollEnabled={false}
            />
          </>
        );

      case "notifications":
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notificaciones</Text>

            {NOTIFICATION_ROWS.map(row => (
              <View key={row.key} style={[styles.row, { borderColor: theme.border }]}>
                <Text style={[styles.rowText, { color: theme.text }]}>{row.title}</Text>

                <Switch
                  value={notifications[row.key]}
                  onValueChange={() => toggleNotification(row.key)}
                  thumbColor="#fff"
                  trackColor={{ false: theme.card, true: theme.subText }}
                />
              </View>
            ))}
          </View>
        );

      case "security":
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Seguridad</Text>

            {[
              ["Límite por transacción", limits.transactionLimit],
              ["Límite diario", limits.dailyLimit],
              ["Límite mensual", limits.monthlyLimit],
            ].map(([label, value], i) => (
              <View key={i} style={[styles.row, { borderColor: theme.border }]}>
                <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
                <Text style={{ color: theme.text, fontFamily: "Poppins-Medium" }}>
                  S/{Number(value).toLocaleString("es-PE")} PEN
                </Text>
              </View>
            ))}
          </View>
        );

      case "accessibility":
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesibilidad</Text>

            {ACCESS_ROWS.map(row => (
              <View key={row.key} style={[styles.row, { borderColor: theme.border }]}>
                <Text style={[styles.rowText, { color: theme.text }]}>{row.label}</Text>

                <Switch
                  value={accessibility[row.key]}
                  onValueChange={() => toggleAccess(row.key)}
                  thumbColor="#fff"
                  trackColor={{ false: theme.card, true: theme.subText }}
                />
              </View>
            ))}

            <Text style={[styles.subTitle, { color: theme.text }]}>Tamaño de fuente</Text>

            {["small", "medium", "large"].map(size => (
              <Pressable
                key={size}
                onPress={() => changeFontSize(size as any)}
                style={({ pressed }) => [
                  styles.row,
                  { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.rowText, { color: theme.text, textTransform: "capitalize" }]}>
                  {size}
                </Text>

                {accessibility.fontSize === size && (
                  <Ionicons name="checkmark" size={22} color={theme.text} />
                )}
              </Pressable>
            ))}
          </View>
        );

      case "about":
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Acerca de</Text>

            {[
              ["Versión", "1.0.0"],
              ["Última actualización", "2 Dic 2024"],
            ].map(([label, val], i) => (
              <View key={i} style={[styles.row, { borderColor: theme.border }]}>
                <Text style={[styles.rowMuted, { color: theme.text }]}>{label}</Text>
                <Text style={[styles.rowText, { color: theme.text }]}>{val}</Text>
              </View>
            ))}

            {["Términos y condiciones", "Política de privacidad"].map((txt, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.row,
                  { borderColor: theme.border, opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => {}}
              >
                <Text style={[styles.rowText, { color: theme.subText }]}>{txt}</Text>
              </Pressable>
            ))}
          </View>
        );

      case "note":
        return (
          <View style={[styles.noteBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.noteText, { color: theme.text }]}>
              Los cambios se guardan automáticamente.
            </Text>
          </View>
        );

      default:
        return null; // 👈 Necesario para TypeScript
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Ajustes</Text>
      </View>

      {/* CONTENIDO */}
      <FlatList
        data={SECTIONS}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

// ---------------- STYLES -----------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

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

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    marginBottom: 12,
    marginTop: 20,
  },

  subTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    marginTop: 14,
    marginBottom: 6,
  },

  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  rowMuted: {
    fontSize: 14,
    opacity: 0.6,
    fontFamily: "Poppins-Regular",
  },

  noteBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  noteText: {
    fontSize: 12,
    opacity: 0.8,
    fontFamily: "Poppins-Regular",
  },

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