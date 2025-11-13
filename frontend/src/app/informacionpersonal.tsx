import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [userInfo, setUserInfo] = useState({
    fullName: "Juan Pérez García",
    email: "juan.perez@email.com",
    phone: "+52 55 1234 5678",
    address: "Av. Insurgentes Sur 123, Col. Roma Norte, CDMX",
  });

  const showToast = (msg: string) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert(msg);
  };

  function handleSave() {
    setIsEditing(false);
    showToast("Información actualizada correctamente");
  }

  function handleCancel() {
    setIsEditing(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Información Personal</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{getInitials(userInfo.fullName)}</Text>
          </View>
          <Text style={styles.name}>{userInfo.fullName}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            editable={isEditing}
            value={userInfo.fullName}
            onChangeText={(v) => setUserInfo({ ...userInfo, fullName: v })}
            style={[styles.input, !isEditing && styles.inputDisabled]}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Teléfono</Text>
          <TextInput
            editable={isEditing}
            value={userInfo.phone}
            onChangeText={(v) => setUserInfo({ ...userInfo, phone: v })}
            keyboardType="phone-pad"
            style={[styles.input, !isEditing && styles.inputDisabled]}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Dirección</Text>
          <TextInput
            editable={isEditing}
            value={userInfo.address}
            onChangeText={(v) => setUserInfo({ ...userInfo, address: v })}
            multiline={true}
            numberOfLines={2}
            style={[
              styles.input,
              styles.textArea,
              !isEditing && styles.inputDisabled
            ]}
          />
        </View>

        {/* Buttons */}
        <View style={{ marginTop: 30, marginHorizontal: 20 }}>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <LinearGradient colors={["#2563eb", "#1e40af"]} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Editar información</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSave}>
                <LinearGradient colors={["#2563eb", "#1e40af"]} style={styles.primaryBtn}>
                  <Text style={styles.primaryText}>Guardar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getInitials(name: string) {
  const p = name.trim().split(" ");
  return (p[0][0] + (p[1]?.[0] ?? "")).toUpperCase();
}

/* -------- STYLES -------- */

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  backButton: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 10 },
  pageTitle: { fontSize: 18, fontWeight: "700", marginLeft: 10, color: "#111" },

  avatarContainer: { alignItems: "center", marginTop: 10 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center"
  },
  avatarInitials: { color: "#fff", fontSize: 34, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700", color: "#111", marginTop: 8 },
  email: { fontSize: 14, color: "#666", marginTop: 4 },

  card: {
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 14,
    marginTop: 25,
    marginHorizontal: 20,
    elevation: 2
  },

  label: { fontSize: 13, color: "#666", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    color: "#111",
  },
  inputDisabled: { backgroundColor: "#f1f5f9" },
  textArea: { minHeight: 60 },

  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  editActions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#e2e8f0", alignItems: "center",
  },
  cancelText: { color: "#1e293b", fontWeight: "700" },
});
