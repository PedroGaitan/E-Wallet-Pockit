import React, { useCallback, useState, useEffect } from "react";
import {View,Text,FlatList,StyleSheet,RefreshControl,useColorScheme,Pressable,TouchableOpacity,ActivityIndicator,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter, Stack } from "expo-router";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

type Transaction = {
  id: string;
  type: "recarga" | "enviado" | "recibido";
  cantidad: number;
  created_at: string;
  remitente_id: string;
  receptor_id: string;
  receptor_nombre?: string;
  remitente_nombre?: string;
};

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // 🟢 Obtener usuario
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    const user = data.user;

    // Obtener ID del usuario desde la tabla users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      console.log("❌ Error al obtener user ID:", userError);
      return null;
    }

    console.log("🟢 User ID:", userData.id);
    return userData.id;
  };

  // 🟡 Cargar todas las transacciones
  const fetchTransactions = async (uid: string) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`remitente_id.eq.${uid},receptor_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const userIds = new Set<string>();
    data.forEach((tx) => {
      if (tx.remitente_id) userIds.add(tx.remitente_id);
      if (tx.receptor_id) userIds.add(tx.receptor_id);
    });

    const { data: usersData } = await supabase
      .from("users")
      .select("id, nombre")
      .in("id", Array.from(userIds));

    const userMap = new Map(usersData?.map((u) => [u.id, u.nombre]) || []);

    // Formatear transacciones
    const formatted: Transaction[] = data.map((tx) => {
      let type: Transaction["type"] = "recarga";

      if (tx.remitente_id === uid && tx.receptor_id !== uid) {
        type = "enviado";
      } else if (tx.receptor_id === uid && tx.remitente_id !== uid) {
        type = "recibido";
      } else if (tx.remitente_id === uid && tx.receptor_id === uid) {
        type = "recarga";
      }

      return {
        ...tx,
        type,
        remitente_nombre: userMap.get(tx.remitente_id),
        receptor_nombre: userMap.get(tx.receptor_id),
      };
    });
    return formatted;
  };

  // 🚀 Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const uid = await fetchUser();
      if (uid) {
        setUserId(uid);
        const txs = await fetchTransactions(uid);
        setTransactions(txs);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 🔄 Refrescar datos
  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    if (userId) {
      const txs = await fetchTransactions(userId);
      setTransactions(txs);
    }
    setRefreshing(false);
  }, [userId]);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isSend = item.type === "enviado";
    const isReceive = item.type === "recibido";
    const isTopUp = item.type === "recarga";

    const color = isSend
      ? "#E53935"
      : isReceive
      ? "#2196F3"
      : "#4CAF50";

    const bgColor = isSend
      ? "rgba(229,57,53,0.15)"
      : isReceive
      ? "rgba(33,150,243,0.15)"
      : "rgba(76,175,80,0.15)";

    const iconName = isSend
      ? "arrow-up"
      : isReceive
      ? "arrow-down"
      : "add";

    const date = new Date(item.created_at).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Descripción
    let label = "";
    if (isSend) {
      label = `Enviado a ${item.receptor_nombre || "Usuario"}`;
    } else if (isReceive) {
      label = `Recibido de ${item.remitente_nombre || "Usuario"}`;
    } else {
      label = "Recarga de saldo";
    }

    return (
      <Animated.View entering={FadeInUp.delay(100).duration(300)} exiting={FadeOut}>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={({ pressed }) => [
            styles.itemContainer,
            {
              opacity: pressed ? 0.7 : 1,
             backgroundColor: theme.card,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
            <Ionicons name={iconName as any} size={20} color={color} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            <Text style={[styles.date, { color: theme.subText }]}>{date}</Text>
          </View>

          <Text style={[styles.amount, { color }]}>
            {isSend ? "-" : "+"}S/ {item.cantidad.toFixed(2)}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const isEmpty = transactions.length === 0 && !loading;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background},
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/views/home");
          }}
          activeOpacity={0.7}
          style={styles.backIconButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Historial</Text>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text
            style={[
              styles.loadingText,
              { color: colorScheme === "dark" ? "#BDBDBD" : "#757575" },
            ]}
          >
            Cargando historial...
          </Text>
        </View>
      ) : isEmpty ? (
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
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
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
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
  textContainer: { flex: 1 },
  label: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 13, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyText: { marginTop: 10, fontSize: 18, fontWeight: "600" },
  emptySubText: { fontSize: 14, marginTop: 4, textAlign: "center" },
});