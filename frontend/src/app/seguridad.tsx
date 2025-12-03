import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { ArrowLeft, Lock, History, ShieldCheck, AlertCircle, Shield, ChevronRight } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../providers/auth-provider";
import { supabase } from "../lib/supabase";
import { router, Stack } from "expo-router";
import * as Haptics from "expo-haptics";

interface Activity {
  id: string;
  action: string;
  device_name: string | null;
  device_model: string | null;
  platform: string | null;
  os_version: string | null;
  ip_address: string | null;
  status: string;
  created_at: string;
}

export default function SeguridadScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
  if (!user) return;
  setLoading(true);

  const { data: logs, error } = await supabase
    .from("security_activity")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.log("❌ Error al obtener logs:", error);
  } else {
    console.log("🟢 Logs recibidos:", logs);
    setActivity(logs || []);
  }

  setLoading(false);
};
  useEffect(() => {
    fetchActivity();
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header Bonito */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 60,
          paddingBottom: 16,
          backgroundColor: theme.card,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft color={theme.text} size={24} />
        </Pressable>

        <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.text }}>
          Seguridad
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {/* Autenticación */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
            <Shield color={theme.background} size={24} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>
              Autenticación
            </Text>
          </View>

          <View style={{ borderRadius: 16, backgroundColor: theme.card }}>
            <Pressable
              onPress={() => router.push("/change-password")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.border,
                }}
              >
                <Lock color={theme.subText} size={18} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text }}>
                  Cambiar contraseña
                </Text>
                <Text style={{ fontSize: 12, marginTop: 2, color: theme.subText }}>
                  Recomendado cada 90 días
                </Text>
              </View>

              <ChevronRight color={theme.subText} size={16} />
            </Pressable>
          </View>
        </View>

        {/* Actividad reciente */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
            <History color={theme.background} size={24} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>
              Actividad reciente
            </Text>
          </View>

          <View style={{ borderRadius: 16, backgroundColor: theme.card }}>
            {loading ? (
              <ActivityIndicator style={{ padding: 20 }} color={theme.text} />
            ) : activity.length === 0 ? (
              <Text style={{ padding: 16, color: theme.subText }}>
                No hay actividad reciente.
              </Text>
            ) : (
              activity.map((item, index) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    padding: 16,
                    gap: 12,
                    borderBottomWidth: index < activity.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor:
                        item.status === "success" ? "#14532d50" : "#78350f50",
                    }}
                  >
                    {item.status === "success" ? (
                      <ShieldCheck color="#4ade80" size={16} />
                    ) : (
                      <AlertCircle color="#fbbf24" size={16} />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text }}>
                      {item.action}
                    </Text>

                    <Text style={{ fontSize: 12, color: theme.subText }}>
                      {item.device_name || "Dispositivo desconocido"} •{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </Text>

                    <Text style={{ fontSize: 12, color: theme.subText }}>
                      OS: {item.platform} {item.os_version} — IP: {item.ip_address ?? "N/A"}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Consejos */}
        <View
          style={{
            flexDirection: "row",
            borderRadius: 16,
            padding: 16,
            gap: 12,
            borderWidth: 1,
            backgroundColor: "#1e3a8a30",
            borderColor: "#3b82f680",
            marginBottom: 32,
          }}
        >
          <Shield color="#60a5fa" size={20} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text }}>
              Consejos de seguridad
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 18, color: theme.subText }}>
              • Usa una contraseña única y segura{"\n"}
              • Activa la autenticación de dos factores{"\n"}
              • Revisa tu actividad regularmente{"\n"}
              • No compartas tu contraseña con nadie
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 12,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  tipsIcon: {
    marginTop: 2,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
  },
});