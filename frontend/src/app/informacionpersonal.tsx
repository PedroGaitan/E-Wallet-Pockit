import React, { useState, useEffect } from "react";
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
import { supabase } from "../lib/supabase";
import {useAuth } from "../providers/auth-provider";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    dni: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const { data: session } = await supabase.auth.getUser();
    if (!session?.user) return;

    const userEmail = session.user.email;

    const { data, error } = await supabase
      .from("users")
      .select("nombre, email, telefono, direccion, birth_date, document_id")
      .eq("email", userEmail)
      .single();

    if (error) {
      Alert.alert("Error", "No se pudo cargar la información del usuario");
      return;
    }

    setUserInfo({
      fullName: data.nombre || "",
      email: data.email || "",
      phone: data.telefono || "",
      address: data.direccion || "",
      birthDate: data.birth_date || "",
      dni: data.document_id || "",
    });
  }

  const showToast = (msg: string) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert(msg);
  };
  
  const [errors, setErrors] = useState({
    phone: "",
  });

  function handleTextWithoutSpecials(text: string) {
  const regex = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ ]*$/;
  return regex.test(text);
}

function validatePhone(phone: string) {
  if (!/^[0-9]*$/.test(phone)) {
    return "Solo se permiten números.";
  }
  if (phone.length !== 9) {
    return "El teléfono debe tener exactamente 9 dígitos.";
  }
  return "";
}

  async function handleSave() {
    const { data: session } = await supabase.auth.getUser();
    if (!session?.user) return;

    if (errors.phone) {
      showToast("Corrige los errores antes de guardar.");
      return;
    }

    if (userInfo.phone.length !== 9) {
      showToast("El teléfono debe tener 9 dígitos.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        nombre: userInfo.fullName,
        telefono: userInfo.phone,
        direccion: userInfo.address,
      })
      .eq("email", session.user.email);

    if (error) {
      Alert.alert("Error", "No se pudo actualizar");
      return;
    }

    setIsEditing(false);
    showToast("Información actualizada correctamente");
  }

  function handleCancel() {
    setIsEditing(false);
    loadUserData(); // recargar datos originales
  }

  function getInitials(name: string) {
    const p = name.trim().split(" ");
    return (p[0]?.[0] + (p[1]?.[0] ?? "")).toUpperCase();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ paddingBottom: 40 }}>

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

        {/* CARD */}
        <View style={styles.card}>

          {/* Nombre */}
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            editable={isEditing}
            value={userInfo.fullName}
            onChangeText={(v) =>{if (handleTextWithoutSpecials(v)) 
            {setUserInfo({ ...userInfo, fullName: v });}}}
            style={[styles.input, !isEditing && styles.inputDisabled]}
          />

          {/* Email (bloqueado siempre) */}
          <Text style={[styles.label, { marginTop: 14 }]}>Correo electrónico</Text>
          <TextInput
            editable={false}
            value={userInfo.email}
            style={[styles.input, styles.inputDisabledDark]}
          />
          <Text style={styles.helperText}>Contacta a soporte para cambiar</Text>

          {/* Teléfono */}
          <Text style={[styles.label, { marginTop: 14 }]}>Teléfono</Text>
          <TextInput
            editable={isEditing}
            value={userInfo.phone}
            keyboardType="numeric"
            onChangeText={(v) => { 
              setUserInfo({ ...userInfo, phone: v });
              setErrors({...errors, phone: validatePhone(v) });
            }}
            style={[styles.input, !isEditing && styles.inputDisabled,
              errors.phone ? { borderColor: "red"} : {}
            ]}
          />
          {errors.phone ? (
            <Text style={{ color: "red", marginTop: 6, marginLeft: 4 }}>{errors.phone}</Text>
          ) :null}

          {/* Dirección */}
          <Text style={[styles.label, { marginTop: 14 }]}>Dirección</Text>
          <TextInput
            editable={isEditing}
            multiline
            value={userInfo.address}
            onChangeText={(v) => { 
              if (handleTextWithoutSpecials(v)) { 
                setUserInfo({ ...userInfo, address: v });
              }
            }}
            style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
          />

          {/* Fecha de nacimiento (bloqueado) */}
          <Text style={[styles.label, { marginTop: 14 }]}>Fecha de nacimiento</Text>
          <TextInput
            editable={false}
            value={userInfo.birthDate}
            style={[styles.input, styles.inputDisabledDark]}
          />
          <Text style={styles.helperText}>Contacta a soporte para cambiar</Text>

          {/* DNI (bloqueado) */}
          <Text style={[styles.label, { marginTop: 14 }]}>DNI</Text>
          <TextInput
            editable={false}
            value={userInfo.dni}
            style={[styles.input, styles.inputDisabledDark]}
          />
          <Text style={styles.helperText}>Contacta a soporte para cambiar</Text>

        </View>

        {/* BOTONES */}
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
  inputDisabledDark: { backgroundColor: "#e5e7eb" },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
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