import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function StatisticScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Estadísticas</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: theme.subText }]}>
          Próximamente...
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
  },
});
