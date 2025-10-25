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
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000];

export default function RechargeScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(1250.5);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return Alert.alert("Error", "Ingresa un monto válido para recargar.");
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 1500));

      setBalance((prev) => prev + rechargeValue);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const message = `✅ Recarga de $${rechargeValue.toFixed(2)} exitosa`;
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert("Recarga completada", message);
      }

      router.replace("/(tabs)/home");
    } catch (err) {
      console.error(err);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "No se pudo procesar la recarga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
            </TouchableOpacity>

            <Text style={styles.pageTitle}>Recargar dinero</Text>
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
                    isSelected && styles.amountBoxSelected,
                  ]}
                  onPress={() => handlePresetPress(value)}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.amountText,
                      isSelected && styles.amountTextSelected,
                    ]}
                  >
                    ${value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input personalizado */}
          <Text style={styles.label}>Otro monto</Text>
          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Ingresa monto"
            keyboardType="number-pad"
            editable={!loading}
            style={styles.input}
          />

          {/* Método de pago */}
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={["#1e40af", "#2563eb"]}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.cardGradient}
            >
              <Ionicons name="card-outline" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.cardText}>•••• 4829</Text>
          </View>

          {/* Resumen animado */}
          {(selectedAmount || parseFloat(amount) > 0) && (
            <Animated.View
              style={[
                styles.summaryContainer,
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monto</Text>
                <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Comisión</Text>
                <Text style={styles.summaryValue}>$0.00</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>
                  Total
                </Text>
                <Text style={[styles.summaryValue, { fontWeight: "700" }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Botón confirmar */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.9}
            disabled={loading}
          >
            <LinearGradient
              colors={["#2563eb", "#1e40af"]}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.confirmButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirmar recarga</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingTop: Platform.OS === "ios" ? 60 : 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
