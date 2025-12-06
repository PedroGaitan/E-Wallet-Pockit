import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (email: string) => void;
}

export default function QRScanner({
  visible,
  onClose,
  onScanned,
}: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasPermission(false);
      }
    };

    if (visible) {
      getPermissions();
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    try {
      // The data should be a user ID
      const userId = data?.trim();

      console.log("QR Scanned data:", userId);

      if (!userId) {
        Alert.alert("Error", "Código QR inválido");
        setScanned(false);
        return;
      }

      // Fetch the user's email from Supabase
      const { data: userData, error } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      console.log("Supabase response:", { userData, error });

      if (error || !userData?.email) {
        Alert.alert("Error", `Usuario no encontrado. ID: ${userId}`);
        setScanned(false);
        return;
      }

      // Pass the email back to the parent component
      onScanned(userData.email);
      onClose();
    } catch (err) {
      console.error("QR Scan error:", err);
      Alert.alert("Error", "Código QR inválido");
      setScanned(false);
    }
  };

  if (!visible) return null;

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.text}>Solicitando permisos de cámara...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.text}>
            No tienes permisos para usar la cámara
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerOverlay}>
            <View style={styles.scanArea} />
          </View>

          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              Apunta la cámara al código QR
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "flex-end",
    padding: 20,
  },
  closeIcon: {
    marginTop: 20,
  },
  centerOverlay: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    marginHorizontal: "auto",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  closeButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
