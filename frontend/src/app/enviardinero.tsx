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
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import QRScanner from "../components/QRScanner";
import { SafeAreaView } from "react-native-safe-area-context";
import { validarLimite } from "../lib/limites";
import { enviarDineroBackend } from "../lib/sendMoney";


const QUICK_AMOUNTS = [50, 100, 500];

export default function SendMoneyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [showScanner, setShowScanner] = useState(false);

  const amountNum = parseFloat(amount.replace(",", ".")) || 0;
  const isEmailValid = /^\S+@\S+\.\S+$/.test(recipient.trim());
  const input = recipient.trim();
  const isEmailInput = /\S+@\S+\.\S+/.test(input);
  const isRecipientValid = isEmailInput || input.length >= 2;
  const exceedsBalance = amountNum > balance;
  const isFormValid = isRecipientValid && amountNum > 0 && !exceedsBalance;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonProgress = useRef(new Animated.Value(0)).current;

  // Cargar saldo
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("balance")
        .eq("email", user.email)
        .single();

      if (!error && data) setBalance(data.balance ?? 0);
    })();
  }, []);

  const animatePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
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

  const onQuickSelect = (val: number) => {
    setAmount(String(val));
    Keyboard.dismiss();
  };

  const handleQRScanned = (email: string) => {
    setRecipient(email);
  };

  const handleSend = async () => {
    animatePressIn();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró usuario activo");

      const { data: remitenteData, error: remitenteError } = await supabase
        .from("users")
        .select("id, email, nombre, balance")
        .eq("email", user.email)
        .single();

      if (remitenteError || !remitenteData)
        throw new Error("Remitente no encontrado");

      const input = recipient.trim();

// 1. Verificar si es email
const isEmailInput = /\S+@\S+\.\S+/.test(input);

// 2. Construir query
let query = supabase.from("users").select("id, email, nombre");

if (isEmailInput) {
  // Buscar por email EXACTO
  query = query.eq("email", input.toLowerCase());
} else {
  // Buscar por nombre usando coincidencia parcial
  query = query.ilike("nombre", `%${input}%`);
}

// 3. Ejecutar búsqueda
const { data: receptorList, error: receptorError } = await query;

if (receptorError) {
  console.error(receptorError);
  Alert.alert("Error", "Hubo un problema buscando al usuario.");
  throw new Error("Error buscando receptor");
}

// 4. Ningún usuario encontrado
if (!receptorList || receptorList.length === 0) {
  Alert.alert("Error", "No existe ningún usuario con ese nombre o correo.");
  throw new Error("Usuario no encontrado");
}

// 5. Si el nombre coincide con varios usuarios
if (!isEmailInput && receptorList.length > 1) {
  Alert.alert(
    "Nombre duplicado",
    "Hay varias personas con ese nombre. Ingresa el correo para identificarlo."
  );
  throw new Error("Nombre ambiguo");
}

const receptorData = receptorList[0]; // ← Usuario definitivo

      if (amountNum > (remitenteData.balance ?? 0)) {
        Alert.alert("Error", "Saldo insuficiente");
        return;
      }

      if (remitenteData.id === receptorData.id) {
        Alert.alert("Error", "No puedes enviarte dinero a ti mismo");
        return;
      }

      await validarLimite(remitenteData.id, amountNum, "transferencia");

      await enviarDineroBackend(
  remitenteData.id,
  receptorData.id,
  amountNum
);

      setBalance((prev) => +(prev - amountNum).toFixed(2));

      const message = `💸 S/.${amountNum.toFixed(2)} enviados a ${
        receptorData.email
      }`;
      Platform.OS === "android"
        ? ToastAndroid.show(message, ToastAndroid.SHORT)
        : Alert.alert("Enviado", message);

      setRecipient("");
      setAmount("");
      router.replace("/views/home");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Ocurrió un problema al enviar dinero."
      );
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={async () => {
              router.back();
            }}
            activeOpacity={0.7}
            style={[styles.backIconButton, { backgroundColor: theme.card }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.text }]}>
            Enviar dinero
          </Text>
        </View>

        {/* Balance */}
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.balanceLabel, { color: theme.subText }]}>
            Saldo disponible
          </Text>
          <Text style={[styles.balanceValue, { color: theme.text }]}>
            S/.{(balance ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Inputs */}
        <Text style={[styles.label, { color: theme.text }]}>
          Correo del destinatario
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={recipient}
            onChangeText={setRecipient}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={[
              styles.input,
              styles.inputFlex,
              { backgroundColor: theme.text },
              recipient.length > 0 && !isEmailValid ? styles.inputError : null,
            ]}
            returnKeyType="next"
            editable={!loading}
          />
        </View>
        {recipient.length > 0 &&
 !isEmailValid && recipient.trim().length < 3 && (
  <Text style={styles.errorText}>
    Introduce un correo o nombre válido
  </Text>
)}

        <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>
          Monto a enviar
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currency, { color: theme.text }]}>S/.</Text>
          <TextInput
            value={amount}
            onChangeText={(t) =>
              setAmount(t.replace(/[^0-9.,]/g, "").replace(",", "."))
            }
            placeholder="0.00"
            placeholderTextColor={theme.subText}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              styles.amountInput,
              { backgroundColor: theme.text },
            ]}
            editable={!loading}
          />
        </View>
        {exceedsBalance && (
          <Text style={styles.errorText}>Saldo insuficiente</Text>
        )}

        {/* Botones rápidos */}
        <View style={styles.quickContainer}>
          {QUICK_AMOUNTS.map((q) => (
            <TouchableOpacity
              key={q}
              onPress={() => onQuickSelect(q)}
              style={[styles.quickButton, { backgroundColor: theme.card }]}
              disabled={loading}
            >
              <Text
                style={[styles.quickText, { color: theme.text }]}
              >{`S/.${q}`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumen */}
        <View
          style={[
            styles.summary,
            { borderColor: theme.border, backgroundColor: theme.card },
          ]}
        >
          <Text style={[styles.summaryText, { color: theme.subText }]}>
            Resumen
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.text }]}>
            A enviar: S/.{amountNum > 0 ? amountNum.toFixed(2) : "0.00"}
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
              colors={
                isFormValid ? ["#2563eb", "#1e40af"] : ["#cbd5e1", "#cbd5e1"]
              }
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
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={async () => {
            setShowScanner(true);
          }}
        >
          <LinearGradient
            colors={["#2563eb", "#1e40af"]}
            start={[0, 0]}
            end={[1, 1]}
            style={[styles.sendButton, { marginTop: 12 }]}
          >
            <Text style={styles.sendButtonText}>Escanear QR</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      <QRScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanned={handleQRScanned}
      />
    </KeyboardAvoidingView>
  );
}

/* 💅 Styles */
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
  balanceLabel: {
    color: "#666",
    fontSize: 13,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 6,
    color: "#111",
  },
  label: {
    color: "#333",
    fontWeight: "600",
    marginBottom: 6,
  },
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
  summaryText: {
    color: "#666",
    fontSize: 13,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
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
  errorText: {
    color: "#ef4444",
    marginTop: 6,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputFlex: {
    flex: 1,
  },
  scanButton: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
