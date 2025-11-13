import React, { useEffect, useState } from "react";
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

type Transaction = {
  id: string;
  type: "recarga" | "enviado" | "recibido";
  cantidad: number;
  created_at: string;
  remitente_id: string;
  receptor_id: string;
  receptor_email?: string;
  remitente_email?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("Usuario");

  // 🟢 Obtener usuario y saldo
  const fetchUserAndBalance = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      console.log("❌ No hay usuario autenticado");
      setLoading(false);
      return;
    }

    const user = data.user;
    setUserEmail(user.email ?? null);
    console.log("🔐 Auth User ID:", user.id);
    console.log("📧 Auth User Email:", user.email);


  const checkProfileCompletion = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("users")
    .select("name, document_id, birth_date, address")
    .eq("email", user.email)
    .single();

  // 👇 Si falta algo, redirigir
  if (!data?.name || !data?.document_id || !data?.birth_date || !data?.address) {
    router.replace( "../completarperfil)");
  }
};

const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, balance, email, nombre")
      .eq("email", user.email)
      .single();

    if (userError) {
      console.log("❌ Error al obtener datos del usuario:", userError);
    } else if (userData) {
      setBalance(Number(userData.balance));
      setUserId(userData.id); // Usar el ID de la tabla users
      console.log("🟢 Saldo cargado:", userData.balance);
      console.log("🟢 User ID de tabla users:", userData.id);
      console.log("🟢 Email en users:", userData.email);
    } else {
      console.log("⚠️ No se encontró usuario en la tabla users");
      setBalance(0);
    }
    if (userData?.nombre) {
  setDisplayName(userData.nombre);
} else if (user.email) {
  setDisplayName(
    user.email
      .split("@")[0]
      .replace(/[._\-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
  };

  // 🟡 Cargar transacciones
  const fetchTransactions = async () => {
    if (!userId) {
      console.log("⚠️ No hay userId, no se pueden cargar transacciones");
      return;
    }

    console.log("📊 Cargando transacciones para user ID:", userId);

    // 🔍 DEBUG: Ver TODAS las transacciones primero
    const { data: allTx, error: allError } = await supabase
      .from("transactions")
      .select("*");
    
    console.log("🔍 TODAS las transacciones en la BD:", allTx);
    console.log("🔍 Total de transacciones:", allTx?.length || 0);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`remitente_id.eq.${userId},receptor_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.log("❌ Error al obtener transacciones:", error.message);
      return;
    }

    console.log("📦 Transacciones filtradas para el usuario:", data?.length || 0);
    console.log("📦 Datos de transacciones:", data);

    if (!data || data.length === 0) {
      setTransactions([]);
      return;
    }

    // Obtener emails de remitentes y receptores
    const userIds = new Set<string>();
    data.forEach((tx) => {
      if (tx.remitente_id) userIds.add(tx.remitente_id);
      if (tx.receptor_id) userIds.add(tx.receptor_id);
    });

    const { data: usersData } = await supabase
      .from("users")
      .select("id, email")
      .in("id", Array.from(userIds));

    const userMap = new Map(usersData?.map((u) => [u.id, u.email]) || []);

    const formatted: Transaction[] = data.map((tx) => {
      let type: Transaction["type"] = "recarga";

      // Determinar el tipo de transacción según quién es el usuario actual
      if (tx.remitente_id === userId && tx.receptor_id !== userId) {
        // El usuario actual envió dinero
        type = "enviado";
      } else if (tx.receptor_id === userId && tx.remitente_id !== userId) {
        // El usuario actual recibió dinero
        type = "recibido";
      } else if (tx.remitente_id === userId && tx.receptor_id === userId) {
        // Es una recarga (remitente y receptor son el mismo)
        type = "recarga";
      }

      return {
        ...tx,
        type,
        remitente_email: userMap.get(tx.remitente_id),
        receptor_email: userMap.get(tx.receptor_id),
      };
    });

    console.log("✅ Transacciones formateadas:", formatted);
    setTransactions(formatted);
  };

  const checkProfileCompletion = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("users")
    .select("name, document_id, birth_date, address")
    .eq("email", user.email)
    .single();

  if (!data?.name || !data?.document_id || !data?.birth_date || !data?.address) {
    router.replace("../completarperfil");
  }
};

  useEffect(() => {
  const loadData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("users")
      .select("nombre, document_id, birth_date, direccion")
      .eq("email", user.email) // 👈 Mejor por email
      .single();

    console.log("🔍 Datos del perfil:", data);

    if (!data?.nombre || !data?.document_id || !data?.birth_date || !data?.direccion) {
      console.log("⚠️ Perfil incompleto → Redirigiendo");
      router.replace("/completarperfil"); // 👈 ESTA ES LA CORRECTA
      return;
    }

    await fetchUserAndBalance();
    setLoading(false);
  };

  loadData();
}, []);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserAndBalance();
    if (userId) {
      await fetchTransactions();
    }
    setRefreshing(false);
  };

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

    // 🔴 Rojo para envíos (pérdida)
    // 🔵 Azul para recibidos (ganancia)
    // 🟢 Verde para recargas
    const color = isSend
      ? "#ef4444"
      : isReceive
      ? "#3b82f6"
      : "#10b981";

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

    const date = new Date(item.created_at).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Descripción más detallada
    let description = "";
    if (isSend) {
      description = `Enviado a ${item.receptor_email || "Usuario"}`;
    } else if (isReceive) {
      description = `Recibido de ${item.remitente_email || "Usuario"}`;
    } else {
      description = "Recarga de saldo";
    }

    return (
      <Animated.View
        entering={FadeInUp.duration(400).delay(100)}
        style={styles.txItem}
      >
        <View style={[styles.txIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.txLabel}>{description}</Text>
          <Text style={styles.txDate}>{date}</Text>
        </View>
        <Text style={[styles.txAmount, { color }]}>
          {isSend ? "-" : "+"}S/.{item.cantidad.toFixed(2)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions.slice(0, 3)}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#2563eb"]}
          />
        }
        ListHeaderComponent={
          <>
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
                    ? `S/.${balance?.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}`
                    : "S/.•••••"}
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
                    await Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium
                    );
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
                    await Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium
                    );
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
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onViewAllTransactions}
                  >
                    <Text style={styles.viewAll}>Ver todas</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              color="#fff"
              style={{ marginTop: 20 }}
              size="large"
            />
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
          )
        }
        ListFooterComponent={
          transactions.length > 0 ? (
            <TouchableOpacity
              style={styles.fullHistoryButton}
              activeOpacity={0.8}
              onPress={onViewAllTransactions}
            >
              <Text style={styles.fullHistoryText}>
                Ver historial completo
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

/* 🎨 Estilos */
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
  recentSection: { marginTop: 32, marginHorizontal: 20, marginBottom: 12 },
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
  emptyState: { alignItems: "center", paddingVertical: 40, marginHorizontal: 20 },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptySubtitle: { color: "#9ca3af", fontSize: 14, marginTop: 4 },
  fullHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 12,
    marginHorizontal: 20,
    gap: 8,
  },
  fullHistoryText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});