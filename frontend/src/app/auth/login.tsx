import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      router.replace("/views/home");
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (!session) {
      Alert.alert("Please check your inbox for email verification!");
    } else {
      // If session exists, user is automatically signed in
      router.replace("/views/home");
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/Logo.png")}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>Pockit</Text>
        <Text style={styles.subText}>Tu billetera digital</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          onChangeText={(text: string) => setEmail(text)}
          value={email}
          placeholder="Correo electrónico"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          onChangeText={(text: string) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => signInWithEmail()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => signUpWithEmail()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Registrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 100,
    marginBottom: 50,
  },
  logoText: {
    fontSize: 48,
    color: "#000000",
    fontWeight: "bold",
  },
  subText: {
    fontSize: 18,
    color: "#666666",
    marginTop: 10,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    width: "100%",
  },
  button: {
    backgroundColor: "#000000",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 20,
  },
});
