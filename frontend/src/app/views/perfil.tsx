import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { supabase } from "@/src/lib/supabase"; // Asegúrate de que la ruta coincida

export default function PerfilScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Datos de usuario simulados
  const user = {
    name: "Juan Pérez",
    email: "juanperez@example.com",
  };

  // Generar iniciales
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleOptionPress = (action: string) => {
    Haptics.selectionAsync();
    if (action === "ajustes") router.push("/ajustes");
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      await supabase.auth.signOut(); // 🔒 cerrar sesión
      router.replace("/auth/login"); // 🚀 redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const menuOptions = [
    { icon: "person-outline", label: "Información personal" },
    { icon: "shield-outline", label: "Seguridad" },
    { icon: "notifications-outline", label: "Notificaciones" },
    { icon: "settings-outline", label: "Ajustes", action: "ajustes" },
    { icon: "call-outline", label: "Soporte" },
  ];

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colorScheme === "dark" ? "#121212" : "#FFFFFF",
        },
      ]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Tarjeta de usuario */}
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[
          styles.userCard,
          {
            backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FAFAFA",
          },
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text
          style={[
            styles.userName,
            { color: colorScheme === "dark" ? "#FFFFFF" : "#1A1A1A" },
          ]}
        >
          {user.name}
        </Text>
        <View style={styles.emailRow}>
          <Ionicons name="mail-outline" size={16} color="#9E9E9E" />
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </Animated.View>

      {/* Opciones de menú */}
      <View style={styles.menuContainer}>
        {menuOptions.map((item, index) => (
          <Animated.View
            key={item.label}
            entering={FadeInUp.delay(index * 80)}
          >
            <Pressable
              onPress={() => handleOptionPress(item.action || "")}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: pressed
                    ? colorScheme === "dark"
                      ? "#2A2A2A"
                      : "#F0F0F0"
                    : "transparent",
                },
              ]}
            >
              <View style={styles.menuLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#1A1A1A"}
                />
                <Text
                  style={[
                    styles.menuLabel,
                    { color: colorScheme === "dark" ? "#FFFFFF" : "#1A1A1A" },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colorScheme === "dark" ? "#9E9E9E" : "#757575"}
              />
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* Botón cerrar sesión */}
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

      {/* Versión */}
      <Text style={styles.versionText}>Pockit v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userCard: {
    alignItems: "center",
    paddingVertical: 40,
    marginTop: 10,
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
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Poppins-Bold",
  },
  userName: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  email: {
    marginLeft: 6,
    fontSize: 14,
    color: "#9E9E9E",
    fontFamily: "Poppins-Regular",
  },
  menuContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
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
  menuLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: "Poppins-Medium",
  },
  logoutContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutText: {
    color: "#E53935",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  versionText: {
    marginTop: 30,
    textAlign: "center",
    color: "#9E9E9E",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
});