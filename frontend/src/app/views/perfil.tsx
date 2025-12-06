import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/providers/auth-provider";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

export default function PerfilScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, mounting } = useAuth();

  if (mounting || !user) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  const initials = user.nombre
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleOptionPress = (action: string) => {
    Haptics.selectionAsync();
    if (action === "ajustes") router.push("/ajustes");
    if (action === "Informacion Personal") router.push("/informacionpersonal");
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  const menuOptions = [
    {
      icon: "person-outline",
      label: "Información personal",
      action: "Informacion Personal",
    },
    { icon: "shield-outline", label: "Seguridad" },
    { icon: "notifications-outline", label: "Notificaciones" },
    { icon: "settings-outline", label: "Ajustes", action: "ajustes" },
    { icon: "call-outline", label: "Soporte" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* TARJETA SIN ANIMACIÓN - HEADER MÁS ABAJO */}
      <View
        style={[
          styles.userCard,
          { backgroundColor: theme.card, marginTop: 40 },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.text }]}>
          <Text style={[styles.avatarText, { color: theme.card }]}>
            {initials}
          </Text>
        </View>

        <Text style={[styles.userName, { color: theme.text }]}>
          {user.nombre}
        </Text>

        <View style={styles.emailRow}>
          <Ionicons name="mail-outline" size={16} color={theme.text} />
          <Text style={[styles.email, { color: theme.text }]}>
            {user.email}
          </Text>
        </View>
      </View>

      {/* MENÚ SIN ANIMACIONES */}
      <View style={styles.menuContainer}>
        {menuOptions.map((item) => (
          <View key={item.label}>
            <Pressable
              onPress={() => handleOptionPress(item.action || "")}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: pressed ? theme.card : "transparent",
                },
              ]}
            >
              <View style={styles.menuLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={theme.text}
                />
                <Text style={[styles.menuLabel, { color: theme.text }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color="#E53935" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <Text style={styles.versionText}>Pockit v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },

  userCard: {
    alignItems: "center",
    paddingVertical: 40,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 32, fontWeight: "700" },

  userName: { fontSize: 20, fontWeight: "600" },

  emailRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },

  email: { marginLeft: 6, fontSize: 14 },

  menuContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 10,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuLabel: { fontSize: 16, marginLeft: 12, fontWeight: "500" },

  logoutContainer: { marginTop: 30, alignItems: "center" },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  logoutText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "600",
  },

  versionText: {
    color: "#FFFFFF",
    marginTop: 30,
    textAlign: "center",
    fontSize: 13,
  },
});