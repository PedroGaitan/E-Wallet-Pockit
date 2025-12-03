import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { router, Stack } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Lock } from "lucide-react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { logActivity } from "../lib/security";
import { ScrollView } from "react-native";


export default function ChangePasswordScreen() {
  const { theme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const validate =
    newPassword.length >= 6 &&
    repeatPassword.length >= 6 &&
    newPassword === repeatPassword &&
    currentPassword.length > 0;

  const handleChangePassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!validate) {
      Alert.alert("Error", "Revisa los campos.");
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      Alert.alert("Error", "No hay sesión activa.");
      setLoading(false);
      return;
    }

    // ⬅⚠ Supabase NO verifica contraseña actual directamente.
    // La validación correcta consiste en intentar reautenticar:

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (reauthError) {
      setLoading(false);
      Alert.alert("Contraseña incorrecta", "La contraseña actual no coincide.");
      return;
    }

    // Cambiar la contraseña:
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // Registrar Log de seguridad
    await logActivity(user.id, "password_change", "success");

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert("Éxito", "Tu contraseña ha sido actualizada.");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <Stack.Screen
        options={{
          title: "Cambiar contraseña",
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ padding: 8 }}
              hitSlop={12}
            >
              <ArrowLeft size={24} color={theme.text} />
            </Pressable>
          ),
          headerTitleStyle: { color: theme.text },
        }}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 40,
        }}
      >
        {/* TÍTULO */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: theme.text,
              marginBottom: 5,
            }}
          >
            Cambiar contraseña
          </Text>
          <Text style={{ color: theme.subText, marginBottom: 30 }}>
            Por seguridad, ingresa tu contraseña actual.
          </Text>
        </Animated.View>

        {/* CAMPOS */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={{ color: theme.text, marginBottom: 6 }}>
            Contraseña actual
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={theme.subText}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            style={{
              backgroundColor: theme.card,
              color: theme.text,
              padding: 14,
              borderRadius: 14,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          />

          <Text style={{ color: theme.text, marginBottom: 6 }}>
            Nueva contraseña
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={theme.subText}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={{
              backgroundColor: theme.card,
              color: theme.text,
              padding: 14,
              borderRadius: 14,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          />

          <Text style={{ color: theme.text, marginBottom: 6 }}>
            Repetir contraseña
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={theme.subText}
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            style={{
              backgroundColor: theme.card,
              color: theme.text,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          />
        </Animated.View>

        {/* BOTÓN */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleChangePassword}
            disabled={loading || !validate}
            style={{
              marginTop: 30,
              paddingVertical: 15,
              borderRadius: 14,
              alignItems: "center",
              backgroundColor: validate ? "#4A90E2" : theme.card,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Guardar cambios
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
