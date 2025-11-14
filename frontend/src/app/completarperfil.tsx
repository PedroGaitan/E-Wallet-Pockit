import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ToastAndroid
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [form, setForm] = useState({
    name: "",
    document_id: "",
    birth_date: "",
    address: "",
    telefono: "",
  });

  const showToast = (msg: string) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert("Error", msg);
  };

  function formatDate(dateStr: string) {
    const parts = dateStr.split("/");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // VALIDACIONES IMPORTANTES
  const validateForm = () => {
    if (!form.name || !form.document_id || !form.birth_date || !form.address || !form.telefono) {
      showToast("Todos los campos son obligatorios.");
      return false;
    }

    if (!/^\d{8}$/.test(form.document_id)) {
      showToast("El documento debe tener exactamente 8 números.");
      return false;
    }

    if (!/^\d{9}$/.test(form.telefono)) {
      showToast("El teléfono debe tener exactamente 9 números.");
      return false;
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      showToast("No hay usuario autenticado.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        nombre: form.name,
        document_id: form.document_id,
        birth_date: formatDate(form.birth_date),
        direccion: form.address,
        telefono: form.telefono,
      })
      .eq("id", user.id)
      .select("*");

    setLoading(false);

    if (error) {
      showToast(error.message);
      return;
    }

    showToast("Perfil completado correctamente ✅");
    router.replace("/views/home");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Completa tu Perfil</Text>
      <Text style={styles.subtitle}>Necesitamos algunos datos adicionales</Text>

      {/* Nombre */}
      <View style={styles.inputGroup}>
        <Ionicons name="person" size={18} color={colors.mutedForeground} />
        <TextInput
          placeholder="Nombre completo"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
        />
      </View>

      {/* Documento */}
      <View style={styles.inputGroup}>
        <Ionicons name="card" size={18} color={colors.mutedForeground} />
        <TextInput
          placeholder="Documento de Identidad (8 dígitos)"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="number-pad"
          maxLength={8}
          style={styles.input}
          value={form.document_id}
          onChangeText={(v) => setForm({ ...form, document_id: v.replace(/[^0-9]/g, "") })}
        />
      </View>

      {/* Teléfono */}
      <View style={styles.inputGroup}>
        <Ionicons name="call" size={18} color={colors.mutedForeground} />
        <TextInput
          placeholder="Teléfono (9 dígitos)"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="number-pad"
          maxLength={9}
          style={styles.input}
          value={form.telefono}
          onChangeText={(v) => setForm({ ...form, telefono: v.replace(/[^0-9]/g, "") })}
        />
      </View>

      {/* Fecha */}
      <View style={styles.inputGroup}>
        <Ionicons name="calendar" size={18} color={colors.mutedForeground} />

        <TouchableOpacity
          style={{ flex: 1, marginLeft: 10 }}
          onPress={() => setShowPicker(true)}
        >
          <Text style={{ color: form.birth_date ? colors.foreground : colors.mutedForeground }}>
            {form.birth_date || "Seleccionar fecha de nacimiento"}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              const day = String(selectedDate.getDate()).padStart(2, "0");
              const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const year = selectedDate.getFullYear();
              setForm({ ...form, birth_date: `${day}/${month}/${year}` });
            }
          }}
        />
      )}

      {/* Dirección */}
      <View style={styles.inputGroup}>
        <Ionicons name="location" size={18} color={colors.mutedForeground} />
        <TextInput
          placeholder="Dirección"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { height: 70 }]}
          multiline
          value={form.address}
          onChangeText={(v) => setForm({ ...form, address: v })}
        />
      </View>

      <TouchableOpacity disabled={loading} style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>
          {loading ? "Guardando..." : "Guardar información"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const colors = {
  background: "#0a0a0a",
  card: "#1a1a1a",
  foreground: "#ffffff",
  mutedForeground: "#9ca3af",
  primary: "#ffffff",
  primaryForeground: "#000000"
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60 },
  title: { color: colors.foreground, fontSize: 22, fontWeight: "700", marginBottom: 6 },
  subtitle: { color: colors.mutedForeground, marginBottom: 24 },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: { flex: 1, marginLeft: 10, color: colors.foreground },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12
  },
  buttonText: {
    color: colors.primaryForeground,
    fontWeight: "600",
    fontSize: 16
  }
});
