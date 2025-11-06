import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { supabase } from "../../lib/supabase";

type Transaction = {
  id: string;
  type: "recarga" | "enviado" | "recibido";
  cantidad: number;
  created_at: string;
  remitente_id: string;
  receptor_id: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 🟢 Obtener usuario y saldo
  useEffect(() => {
    const fetchUserAndBalance = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.log("❌ No hay usuario autenticado");
        setLoading(false);
        return;
      }

      const user = data.user;
      setUserId(user.id);
      setUserEmail(user.email ?? null);

      // 🟢 Obtener saldo
      const { data: balanceData, error: balanceError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", user.id)
        .limit(1);

      if (balanceError) {
        console.log("❌ Error al obtener saldo:", balanceError);
      } else if (balanceData && balanceData.length > 0) {
        setBalance(Number(balanceData[0].balance));
        console.log("🟢 Saldo cargado:", balanceData[0].balance);
      } else{
        console.log("⚠️ No se encontró saldo para este usuario. balanceData:", balanceData);
        setBalance(0);
      }
      setLoading(false);
    };

    fetchUserAndBalance();
  }, []);

  // 🟡 Cargar transacciones
  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`remitente_id.eq.${userId},receptor_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.log("❌ Error al obtener transacciones:", error.message);
        setLoading(false);
        return;
      }

      const formatted = data.map((tx) => {
        let type: Transaction["type"] = "recarga";
        if (tx.remitente_id === userId && tx.type === "send") type = "enviado";
        else if (tx.receptor_id === userId && tx.type === "receive")
          type = "recibido";
        else if (tx.type === "recharge") type = "recarga";

        return { ...tx, type };
      });

      setTransactions(formatted);
      setLoading(false);
    };

    fetchTransactions();
  }, [userId]);

  const toggleBalance = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBalance((prev) => !prev);
  };

  const onViewAllTransactions = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("../historial");
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSend = item.type === "enviado";
    const isReceive = item.type === "recibido";
    const isTopUp = item.type === "recarga";

    const color = isSend
      ? "#ef4444"
      : isReceive
      ? "#3b82f6"
      : isTopUp
      ? "#10b981"
      : "#fff";

    const bgColor = isSend
      ? "rgba(239,68,68,0.15)"
      : isReceive
      ? "rgba(59,130,246,0.15)"
      : "rgba(16,185,129,0.15)";

    const icon = isSend
      ? "arrow-up-outline"
      : isReceive
      ? "arrow-down-outline"
      : "wallet-outline";

    const date = new Date(item.created_at).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <Animated.View
        entering={FadeInUp.duration(400).delay(100)}
        style={styles.txItem}
      >
        <View style={[styles.txIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.txLabel}>
            {isSend
              ? "Envío de dinero"
              : isReceive
              ? "Dinero recibido"
              : "Recarga"}
          </Text>
          <Text style={styles.txDate}>{date}</Text>
        </View>
        <Text style={[styles.txAmount, { color }]}>
          {isSend ? "-" : "+"}${item.cantidad.toFixed(2)}
        </Text>
      </Animated.View>
    );
  };

  // 🧑 Mostrar nombre derivado del correo
  const displayName = userEmail
    ? userEmail.split("@")[0].replace(/[._\-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Usuario";

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.header}
      >
        <View>
          <Text style={styles.welcomeText}>Bienvenido,</Text>
          <Text style={styles.username}>{displayName}</Text>
        </View>
        <TouchableOpacity
          style={styles.eyeButton}
          activeOpacity={0.8}
          onPress={toggleBalance}
        >
          <Ionicons
            name={showBalance ? "eye" : "eye-off"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Balance */}
      <LinearGradient
        colors={["#1e1e1e", "#2d2d2d"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
        ) : (
          <Text style={styles.balanceValue}>
            {showBalance
              ? `$${balance?.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}`
              : "$•••••"}
          </Text>
        )}
      </LinearGradient>

      {/* Acciones rápidas */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/enviardinero");
            }}
          >
            <Ionicons name="send" size={22} color="#fff" />
            <Text style={styles.actionText}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionButton, { backgroundColor: "#16a34a" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/recargardinero");
            }}
          >
            <Ionicons name="add" size={26} color="#fff" />
            <Text style={styles.actionText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actividad reciente */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          {transactions.length > 3 && (
            <TouchableOpacity activeOpacity={0.7} onPress={onViewAllTransactions}>
              <Text style={styles.viewAll}>Ver todas</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
        ) : transactions.length > 0 ? (
          <>
            <FlatList
              data={transactions.slice(0, 3)}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
              contentContainerStyle={{ paddingBottom: 12 }}
            />
            <TouchableOpacity
              style={styles.fullHistoryButton}
              activeOpacity={0.8}
              onPress={onViewAllTransactions}
            >
              <Text style={styles.fullHistoryText}>Ver historial completo</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="wallet-outline"
              size={64}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.emptyTitle}>Sin actividad reciente</Text>
            <Text style={styles.emptySubtitle}>
              Tus transacciones aparecerán aquí
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* 🎨 Estilos */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0b", paddingBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "ios" ? 50 : 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: { color: "#9ca3af", fontSize: 14 },
  username: { color: "#fff", fontSize: 20, fontWeight: "700" },
  eyeButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 50,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  balanceLabel: { color: "#a1a1aa", fontSize: 14 },
  balanceValue: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },
  actionsSection: { marginTop: 28, marginHorizontal: 20 },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 14,
  },
  actionText: { color: "#fff", fontWeight: "700", marginLeft: 6 },
  recentSection: { marginTop: 32, marginHorizontal: 20 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
  txDate: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 12 },
  emptySubtitle: { color: "#9ca3af", fontSize: 14, marginTop: 4 },
  fullHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  fullHistoryText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});