import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter, Stack } from "expo-router";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";

type Transaction = {
  id: string;
  type: "recarga" | "envio" | "recibido";
  label: string;
  date: string;
  amount: number;
};

const mockData: Transaction[] = [
  { id: "1", type: "recarga", label: "Recarga saldo", date: "12 Oct 2025", amount: 50 },
  { id: "2", type: "envio", label: "Envío a Carlos", date: "11 Oct 2025", amount: -30 },
  { id: "3", type: "recibido", label: "Recibido de Ana", date: "10 Oct 2025", amount: 25 },
];

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockData);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => {
    const color =
      item.type === "recarga"
        ? "#4CAF50"
        : item.type === "envio"
        ? "#E53935"
        : "#2196F3";

    const iconName =
      item.type === "recarga"
        ? "add"
        : item.type === "envio"
        ? "arrow-up"
        : "arrow-down";

    return (
      <Animated.View entering={FadeInUp.delay(100).duration(300)} exiting={FadeOut}>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={({ pressed }) => [
            styles.itemContainer,
            {
              opacity: pressed ? 0.7 : 1,
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFFFFF",
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
            <Ionicons name={iconName as any} size={20} color={color} />
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                { color: colorScheme === "dark" ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.date,
                { color: colorScheme === "dark" ? "#BDBDBD" : "#757575" },
              ]}
            >
              {item.date}
            </Text>
          </View>

          <Text
            style={[
              styles.amount,
              {
                color:
                  item.amount > 0
                    ? "#4CAF50"
                    : item.amount < 0
                    ? "#E53935"
                    : "#1A1A1A",
              },
            ]}
          >
            {item.amount > 0 ? "+" : ""}
            S/ {item.amount}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const isEmpty = transactions.length === 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#121212" : "#FFFFFF" },
      ]}
    >
      {/* Ocultar header de Expo */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header con botón de regreso */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFFFFF",
            borderBottomColor: colorScheme === "dark" ? "#333" : "#E0E0E0",
          },
        ]}
      >
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/views/home");
          }}
          activeOpacity={0.7}
          style={styles.backIconButton}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffffff" />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: colorScheme === "dark" ? "#FFFFFF" : "#1A1A1A" },
          ]}
        >
          Historial
        </Text>
      </View>

      {/* Lista o estado vacío */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>Sin movimientos</Text>
          <Text style={styles.emptySubText}>Tus transacciones aparecerán aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4CAF50"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  backIconButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  label: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 13 },
  amount: { fontSize: 16, fontWeight: "700" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 10, fontSize: 18, color: "#757575", fontWeight: "600" },
  emptySubText: { fontSize: 14, color: "#9E9E9E", marginTop: 4 },
});