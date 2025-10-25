import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const balance = 1546.00;
  const userName = "Juan Pérez";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenido,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowBalance(!showBalance)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showBalance ? "eye" : "eye-off"}
            size={22}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceText}>
          {showBalance
            ? `$${balance.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}`
            : "••••••"}
        </Text>
        <View style={styles.cardChip} />
        <Text style={styles.cardNumber}>•••• 4829</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/enviardinero");
            }}
          >
            <Ionicons name="send" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/recargardinero");
            }}
          >
            <Ionicons name="add" size={22} color="#333" />
            <Text style={styles.secondaryButtonText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="add" size={20} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.activityTitle}>Recarga</Text>
              <Text style={styles.activityTime}>Hace 2 días</Text>
            </View>
          </View>
          <Text style={styles.activityAmount}>+$500.00</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeText: {
    color: "#555",
    fontSize: 16,
  },
  userName: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  balanceLabel: {
    color: "#666",
    fontSize: 14,
  },
  balanceText: {
    color: "#000",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 8,
  },
  cardChip: {
    position: "absolute",
    top: 15,
    right: 20,
    width: 40,
    height: 25,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
  },
  cardNumber: {
    color: "#555",
    marginTop: 8,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "#f1f1f1",
  },
  secondaryButtonText: {
    color: "#333",
    fontWeight: "600",
    marginLeft: 8,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    backgroundColor: "#dcfce7",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: {
    color: "#000",
    fontWeight: "600",
  },
  activityTime: {
    color: "#777",
    fontSize: 12,
  },
  activityAmount: {
    color: "#16a34a",
    fontWeight: "bold",
  },
});