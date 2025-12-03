import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ToastAndroid,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  TouchableWithoutFeedback,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { recargarDineroBackend } from "../lib/recharge";
import { validarLimite } from "../lib/limites";

const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000];

export default function RechargeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [balance, setBalance] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🟢 Cargar saldo actual del usuario
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("id, balance")
        .eq("email", user.email)
        .single();

      if (!error && data) {
        setBalance(data.balance ?? 0);
        setUserId(data.id);}
    })();
  }, []);

  useEffect(() => {
    if (selectedAmount || parseFloat(amount) > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedAmount, amount]);

  const handlePresetPress = async (value: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedAmount(value);
    setAmount("");
    Keyboard.dismiss();
  };

  const handleAmountChange = (text: string) => {
    const sanitized = text.replace(/[^0-9]/g, "");
    setAmount(sanitized);
    if (selectedAmount) setSelectedAmount(null);
  };

  const total = selectedAmount || parseFloat(amount) || 0;

 const handleConfirm = async () => {
  const rechargeValue = total;

  if (rechargeValue <= 0) {
    return Alert.alert("Error", "Ingresa un monto válido.");
  }

  if (!userId) {
    return Alert.alert("Error", "Usuario no identificado.");
  }

  setLoading(true);

  try {
    // 1️⃣ Validación de límites
    await validarLimite(userId, rechargeValue, "recarga");

    // 2️⃣ Recarga en el backend real (tu función)
    await recargarDineroBackend(rechargeValue);

    // 3️⃣ Actualizar saldo
    const { data: userData } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    setBalance(userData?.balance ?? 0);

    ToastAndroid.show(
      `✅ Recarga de S/.${rechargeValue.toFixed(2)} exitosa`,
      ToastAndroid.LONG
    );

    setSelectedAmount(null);
    setAmount("");
    router.replace("/views/home");

  } catch (err: any) {
    Alert.alert("Límite superado", err.message || "Ocurrió un error.");
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView  style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={async () => {
                router.back();
              }}
              activeOpacity={0.7}
              style={[styles.backButton, { backgroundColor: theme.card }]}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
              <Text style={[styles.pageTitle, { color: theme.text }]}>Recargar dinero</Text>
          </View>

          {/* Saldo actual */}
          <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.balanceLabel, { color: theme.subText }]}>Saldo actual</Text>
             <Text style={[styles.balanceValue, { color: theme.text }]}>
              S/.{(balance ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Grid de montos */}
          <View style={styles.gridContainer}>
            {PRESET_AMOUNTS.map((value) => {
              const isSelected = selectedAmount === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.amountBox,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isSelected && { backgroundColor: "#eef2ff", borderColor: "#2563eb" }
                  ]}
                  onPress={() => handlePresetPress(value)}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.amountText,
                      { color: theme.text },
                      isSelected && styles.amountTextSelected,
                    ]}
                  >
                    S/.{value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input personalizado */}
          <Text style={[styles.label, { color: theme.text }]}>Otro monto</Text>
          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Ingresa monto"
            keyboardType="number-pad"
            editable={!loading}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          />

          {/* Método de pago */}
          <View style={[styles.cardContainer, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={["#1e40af", "#2563eb"]}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.cardGradient}
            >
              <Ionicons name="card-outline" size={28} color="#fff" />
            </LinearGradient>
             <Text style={[styles.cardText, { color: theme.text }]}>•••• 4829</Text>
          </View>

          {/* Resumen animado */}
          {(selectedAmount || parseFloat(amount) > 0) && (
            <Animated.View
              style={[
                styles.summaryContainer,{ backgroundColor: theme.card, borderColor: theme.border },
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.subText }]}>Monto</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>S/.{total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.subText }]}>Comisión</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>S/.0.00</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.summaryRow}>
               <Text style={[styles.summaryLabel, { color: theme.text, fontWeight: "700" }]}>
                  Total
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text, fontWeight: "700" }]}>
                  S/.{total.toFixed(2)}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Botón confirmar */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.9}
            disabled={loading || total <= 0}
          >
            <LinearGradient
              colors={
                total > 0 && !loading
                  ? ["#2563eb", "#1e40af"]
                  : ["#cbd5e1", "#cbd5e1"]
              }
              start={[0, 0]}
              end={[1, 1]}
              style={[styles.confirmButton, (loading || total <= 0) && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirmar recarga</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView >
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  balanceCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: {
    color: "#666",
    fontSize: 13,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
    color: "#111",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  amountBox: {
    width: "30%",
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  amountBoxSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eef2ff",
  },
  amountText: {
    fontWeight: "600",
    color: "#111",
  },
  amountTextSelected: {
    color: "#1e3a8a",
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardGradient: {
    width: 48,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardText: {
    fontWeight: "700",
    color: "#111",
    fontSize: 15,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#555",
  },
  summaryValue: {
    color: "#111",
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginVertical: 8,
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});