import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

export default function QrScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQrCode = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("personal_qr")
        .eq("id", user.id)
        .single();

      if (!error && data?.personal_qr) {
        setQrUrl(data.personal_qr);
      }
      setLoading(false);
    };

    loadQrCode();
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.backText, { color: theme.text }]}>Atrás</Text>
      </TouchableOpacity>

      <View style={styles.inner}>
        <Text style={[styles.title, { color: theme.text }]}>Mi código QR</Text>

        <View style={[styles.qrCard, { backgroundColor: theme.card }]}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.text} />
          ) : qrUrl ? (
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={[styles.noQrText, { color: theme.subText }]}>
              Completa tu perfil para obtener tu código QR
            </Text>
          )}
        </View>

        <Text style={[styles.note, { color: theme.subText }]}>
          Comparte este QR para recibir pagos
        </Text>

        {user && (
          <View style={[styles.meta, { borderColor: theme.border }]}>
            <Text style={[styles.metaName, { color: theme.text }]}>
              {user.nombre ?? user.email}
            </Text>
            <Text style={[styles.metaEmail, { color: theme.subText }]}>
              {user.email}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  back: { alignSelf: "flex-start", padding: 8, marginBottom: 8 },
  backText: { fontSize: 14 },
  inner: { alignItems: "center", marginTop: 8 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  qrCard: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 250,
  },
  qrImage: { width: 230, height: 230 },
  noQrText: { fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
  note: { marginTop: 12, fontSize: 14 },
  meta: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  metaName: { fontSize: 16, fontWeight: "700" },
  metaEmail: { fontSize: 13, marginTop: 4 },
});
