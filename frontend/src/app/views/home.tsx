import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../providers/auth-provider";

type Transaction = {
  id: string;
  type: "recarga" | "enviado" | "recibido";
  cantidad: number;
  created_at: string;
  remitente_id: string;
  receptor_id: string;
  remitente_nombre?: string;
  receptor_nombre?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth(); // ⚡ ahora todo viene limpio y realtime
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.id ?? null; // ⚡ ya no guardamos estados duplicados

  // 🟢 Cargar saldo
  const fetchBalance = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setBalance(Number(data.balance));
    }
  }, [user]);

  // 🟡 Cargar transacciones con NOMBRE, no email
  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`remitente_id.eq.${userId},receptor_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) {
      setTransactions([]);
      return;
    }

    // Obtener nombres de remitente/receptor
    const ids = Array.from(
      new Set(data.flatMap((tx) => [tx.remitente_id, tx.receptor_id]))
    );

    const { data: usersData } = await supabase
      .from("users")
      .select("id, nombre")
      .in("id", ids);

    const nameMap = new Map(usersData?.map((u) => [u.id, u.nombre]));

    const formatted = data.map((tx) => {
      let type: Transaction["type"] = "recarga";

      if (tx.remitente_id === userId && tx.receptor_id !== userId) type = "enviado";
      else if (tx.receptor_id === userId && tx.remitente_id !== userId) type = "recibido";

      return {
        ...tx,
        type,
        remitente_nombre: nameMap.get(tx.remitente_id),
        receptor_nombre: nameMap.get(tx.receptor_id),
      };
    });

    setTransactions(formatted);
  }, [userId]);

  // 🔐 Validar perfil completado
  const checkProfileCompletion = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("nombre, document_id, birth_date, direccion")
      .eq("id", user.id)
      .single();

    if (!data?.nombre || !data?.document_id || !data?.birth_date || !data?.direccion) {
      router.replace("/completarperfil");
    }
  }, [user]);

  // 🔵 Carga inicial
  useEffect(() => {
    const init = async () => {
      if (!user) return;

      await checkProfileCompletion();
      await fetchBalance();
      await fetchTransactions();

      setLoading(false);
    };

    init();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    await fetchTransactions();
    setRefreshing(false);
  };

  const toggleBalance = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBalance((prev) => !prev);
  };

  const onViewAllTransactions = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/historial");
  };

  // 🎨 Render de cada transacción
  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSend = item.type === "enviado";
    const isReceive = item.type === "recibido";
    const isTopUp = item.type === "recarga";

    const color = isSend ? "#ef4444" : isReceive ? "#3b82f6" : "#10b981";
    const bgColor = isSend
      ? "rgba(239,68,68,0.15)"
      : isReceive
      ? "rgba(59,130,246,0.15)"
      : "rgba(16,185,129,0.15)";

    const icon = isSend ? "arrow-up-outline" : isReceive ? "arrow-down-outline" : "wallet-outline";

    const date = new Date(item.created_at).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // ✨ AHORA MOSTRAMOS NOMBRES, NO EMAILS
    let description = "";
    if (isSend) description = `Enviado a ${item.receptor_nombre ?? "Usuario"}`;
    else if (isReceive) description = `Recibido de ${item.remitente_nombre ?? "Usuario"}`;
    else description = "Recarga de saldo";

    return (
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.txItem}>
        <View style={[styles.txIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.txLabel}>{description}</Text>
          <Text style={styles.txDate}>{date}</Text>
        </View>

        <Text style={[styles.txAmount, { color }]}>
          {isSend ? "-" : "+"}S/. {item.cantidad.toFixed(2)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions.slice(0, 3)}
        keyExtractor={(i) => i.id}
        renderItem={renderTransaction}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={["#2563eb"]} />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <LinearGradient colors={["#0f172a", "#1e293b"]} start={[0, 0]} end={[1, 1]} style={styles.header}>
              <View>
                <Text style={styles.welcomeText}>Bienvenido,</Text>
                <Text style={styles.username}>{user?.nombre ?? "Usuario"}</Text>
              </View>
              <TouchableOpacity style={styles.eyeButton} onPress={toggleBalance}>
                <Ionicons name={showBalance ? "eye" : "eye-off"} size={24} color="#fff" />
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
                  {showBalance ? `S/. ${balance?.toFixed(2)}` : "S/.•••••"}
                </Text>
              )}
            </LinearGradient>

            {/* Acciones */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Acciones rápidas</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("/enviardinero")}
                >
                  <Ionicons name="send" size={22} color="#fff" />
                  <Text style={styles.actionText}>Enviar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#16a34a" }]}
                  onPress={() => router.push("/recargardinero")}
                >
                  <Ionicons name="add" size={26} color="#fff" />
                  <Text style={styles.actionText}>Recargar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Actividad reciente</Text>

                {transactions.length > 3 && (
                  <TouchableOpacity onPress={onViewAllTransactions}>
                    <Text style={styles.viewAll}>Ver todas</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        }
      />
    </View>
  );
}

/* 🎨 Estilos (NO LOS TOQUÉ) */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0b" },
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
  eyeButton: { backgroundColor: "rgba(255,255,255,0.1)", padding: 8, borderRadius: 50 },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  balanceLabel: { color: "#a1a1aa", fontSize: 14 },
  balanceValue: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 6 },
  actionsSection: { marginTop: 28, marginHorizontal: 20 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 14,
  },
  actionText: { color: "#fff", fontWeight: "700", marginLeft: 6 },
  recentSection: { marginTop: 32, marginHorizontal: 20, marginBottom: 12 },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewAll: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 20,
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
});