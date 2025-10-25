import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // ← agregado

const QUICK_AMOUNTS = [50, 100, 500];

export default function SendMoneyScreen() {
  const router = useRouter();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(15420.75);

  const amountNum = parseFloat(amount.replace(",", ".")) || 0;
  const isEmailValid = /^\S+@\S+\.\S+$/.test(recipient.trim());
  const exceedsBalance = amountNum > balance;
  const isFormValid = isEmailValid && amountNum > 0 && !exceedsBalance;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonProgress = useRef(new Animated.Value(0)).current;

  const animatePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const animatePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(buttonProgress, {
          toValue: 1,
          duration: 700,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      buttonProgress.stopAnimation();
      buttonProgress.setValue(0);
    }
  }, [loading]);

  const fakeSendRequest = (recipientEmail: string, amountValue: number) =>
    new Promise<{ success: boolean }>((resolve) =>
      setTimeout(() => resolve({ success: true }), 1200)
    );

  const onQuickSelect = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(String(val));
    Keyboard.dismiss();
  };

  const handleSend = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animatePressIn();
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 250));
      const res = await fakeSendRequest(recipient.trim(), amountNum);

      if (res.success) {
        setBalance((b) => +(b - amountNum).toFixed(2));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const message = `💸 $${amountNum.toFixed(2)} enviados a ${recipient}`;
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Enviado", message);
        }

        router.replace("/(tabs)/home");
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "No se pudo completar la transacción.");
      }
    } catch (err) {
      console.error(err);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Ocurrió un error. Reintenta más tarde.");
    } finally {
      setLoading(false);
      animatePressOut();
    }
  };

  const rotate = buttonProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Header con botón de regreso */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/(tabs)/home");
            }}
            activeOpacity={0.7}
            style={styles.backIconButton}
          >
            <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Enviar dinero</Text>
        </View>

        {/* Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceValue}>
            ${balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Inputs */}
        <Text style={styles.label}>Correo del destinatario</Text>
        <TextInput
          value={recipient}
          onChangeText={setRecipient}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={[
            styles.input,
            recipient.length > 0 && !isEmailValid ? styles.inputError : null,
          ]}
          returnKeyType="next"
          editable={!loading}
        />
        {recipient.length > 0 && !isEmailValid && (
          <Text style={styles.errorText}>Introduce un correo válido</Text>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>Monto a enviar</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            value={amount}
            onChangeText={(t) => {
              const sanitized = t.replace(/[^0-9.,]/g, "").replace(",", ".");
              setAmount(sanitized);
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            style={[styles.input, styles.amountInput]}
            editable={!loading}
          />
        </View>
        {exceedsBalance && <Text style={styles.errorText}>Saldo insuficiente</Text>}

        {/* Monto rápido */}
        <View style={styles.quickContainer}>
          {QUICK_AMOUNTS.map((q) => (
            <TouchableOpacity
              key={q}
              activeOpacity={0.85}
              onPress={() => onQuickSelect(q)}
              style={styles.quickButton}
              disabled={loading}
            >
              <Text style={styles.quickText}>${q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumen */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Resumen</Text>
          <Text style={styles.summaryAmount}>
            A enviar: ${amountNum > 0 ? amountNum.toFixed(2) : "0.00"}
          </Text>
        </View>

        {/* Botón enviar */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSend}
            disabled={!isFormValid || loading}
          >
            <LinearGradient
              colors={isFormValid ? ["#2563eb", "#1e40af"] : ["#cbd5e1", "#cbd5e1"]}
              start={[0, 0]}
              end={[1, 1]}
              style={[styles.sendButton, !isFormValid && { opacity: 0.7 }]}
            >
              {loading ? (
                <Animated.View style={{ transform: [{ rotate }] }}>
                  <ActivityIndicator color="#fff" />
                </Animated.View>
              ) : (
                <Text style={styles.sendButtonText}>Enviar dinero</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    marginBottom: 16,
  },
  backIconButton: {
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
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: { color: "#666", fontSize: 13 },
  balanceValue: { fontSize: 26, fontWeight: "700", marginTop: 6, color: "#111" },
  label: { color: "#333", fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currency: {
    fontSize: 18,
    marginRight: 8,
    color: "#111",
  },
  amountInput: {
    flex: 1,
  },
  quickContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 18,
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    alignItems: "center",
  },
  quickText: {
    color: "#1e3a8a",
    fontWeight: "700",
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eef2ff",
  },
  summaryText: { color: "#666", fontSize: 13 },
  summaryAmount: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  errorText: { color: "#ef4444", marginTop: 6, marginBottom: 6 },
});