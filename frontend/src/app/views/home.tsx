import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

// ✅ Tipo para las transacciones
type Transaction = {
  id: string;
  type: "recarga" | "enviado" | "recibido";
  amount: number;
  date: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState(15420.75);

  const [transactions] = useState<Transaction[]>([
    { id: "1", type: "recarga", amount: 100.0, date: "27 Oct 2025" },
    { id: "2", type: "enviado", amount: 45.5, date: "25 Oct 2025" },
    { id: "3", type: "recibido", amount: 80.75, date: "23 Oct 2025" },
  ]);

  const toggleBalance = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBalance((prev) => !prev);
  };

  const onViewAllTransactions = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  router.push({
    pathname: "/historial",
    params: { animate: "slide" },
  });
};

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSend = item.type === "enviado";
    const isReceive = item.type === "recibido";
    const isTopUp = item.type === "recarga";

    const color =
      isSend ? "#ef4444" : isReceive ? "#3b82f6" : isTopUp ? "#10b981" : "#fff";
    const bgColor =
      isSend
        ? "rgba(239,68,68,0.15)"
        : isReceive
        ? "rgba(59,130,246,0.15)"
        : "rgba(16,185,129,0.15)";

    const icon =
      isSend
        ? "arrow-up-outline"
        : isReceive
        ? "arrow-down-outline"
        : "wallet-outline";

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
            {isSend ? "Envío de dinero" : isReceive ? "Dinero recibido" : "Recarga"}
          </Text>
          <Text style={styles.txDate}>{item.date}</Text>
        </View>
        <Text style={[styles.txAmount, { color }]}>
          {isSend ? "-" : "+"}${item.amount.toFixed(2)}
        </Text>
      </Animated.View>
    );
  };

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
          <Text style={styles.username}>Rio Storm</Text>
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
        <Text style={styles.balanceValue}>
          {showBalance
            ? `$${balance.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}`
            : "$•••••"}
        </Text>
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

        {transactions.length > 0 ? (
          <>
            <FlatList
              data={transactions.slice(0, 3)}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
              contentContainerStyle={{ paddingBottom: 12 }}
            />

            {/* ✅ Nuevo botón "Ver historial completo" */}
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
  container: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    paddingBottom: 24,
  },
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  actionText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },
  recentSection: {
    marginTop: 32,
    marginHorizontal: 20,
  },
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
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
  gap: 8,
},

  fullHistoryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});