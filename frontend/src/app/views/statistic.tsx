// This screen requires RevenueCat which is commented out
/*
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function StatisticScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>
        Estadísticas - Próximamente
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
});
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases from "react-native-purchases";
import { checkSubscriptionStatus } from "../../lib/revenueCat";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

const screenWidth = Dimensions.get("window").width;

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type Transaction = {
  id: string;
  cantidad: number;
  created_at: string;
  remitente_id: string;
  receptor_id: string;
};

type MonthlyData = {
  labels: string[];
  income: number[];
  expenses: number[];
};

export default function StatisticScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    labels: [],
    income: [],
    expenses: [],
  });
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useFocusEffect(
    useCallback(() => {
      initializeScreen();
    }, [])
  );

  const initializeScreen = async () => {
    try {
      setLoading(true);
      const premium = await checkSubscriptionStatus();

      if (premium) {
        setIsPremium(true);
        await fetchUserAndStats();
        setLoading(false);
      } else {
        setIsPremium(false);
        setLoading(false);
        await showPaywall();
      }
    } catch (error) {
      console.error("Error initializing screen:", error);
      setIsPremium(false);
      setLoading(false);
      await showPaywall();
    }
  };

  const showPaywall = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      if (!offerings) {
        console.error("No offerings available");
        return;
      }

      const pockitOffering =
        offerings.all?.["pockit-premium"] ?? offerings.current;

      if (!pockitOffering) {
        console.error("No offering found for pockit-premium");
        return;
      }

      const result = await RevenueCatUI.presentPaywallIfNeeded({
        offering: pockitOffering,
        requiredEntitlementIdentifier: "Pockit Premium",
      });

      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED
      ) {
        setIsPremium(true);
        await fetchUserAndStats();
      } else {
        // User dismissed paywall without purchasing - navigate to home
        router.replace("/views/home");
      }
    } catch (error) {
      console.error("Paywall error:", error);
    }
  };

  const fetchUserAndStats = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", authData.user.email)
      .single();

    if (!userData) return;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .or(`remitente_id.eq.${userData.id},receptor_id.eq.${userData.id}`)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    if (transactions) {
      processTransactions(transactions, userData.id);
    }
  };

  const processTransactions = (transactions: Transaction[], uid: string) => {
    const monthlyIncome: Record<string, number> = {};
    const monthlyExpenses: Record<string, number> = {};

    const labels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      labels.push(MONTH_NAMES[date.getMonth()]);
      monthlyIncome[key] = 0;
      monthlyExpenses[key] = 0;
    }

    let totalInc = 0;
    let totalExp = 0;

    for (const tx of transactions) {
      const date = new Date(tx.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const isSend = tx.remitente_id === uid && tx.receptor_id !== uid;
      const isReceive = tx.receptor_id === uid && tx.remitente_id !== uid;
      const isTopUp = tx.remitente_id === uid && tx.receptor_id === uid;

      if (key in monthlyIncome) {
        if (isReceive || isTopUp) {
          monthlyIncome[key] += tx.cantidad;
          totalInc += tx.cantidad;
        } else if (isSend) {
          monthlyExpenses[key] += tx.cantidad;
          totalExp += tx.cantidad;
        }
      }
    }

    setMonthlyData({
      labels,
      income: Object.values(monthlyIncome),
      expenses: Object.values(monthlyExpenses),
    });
    setTotalIncome(totalInc);
    setTotalExpenses(totalExp);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: theme.subText }]}>
          Verificando suscripción...
        </Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: () => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#4CAF50",
    },
  };

  const hasData = totalIncome > 0 || totalExpenses > 0;

  return (
    <ScrollView
      style={[styles.premiumContainer, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.premiumContent}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Estadísticas de tu cuenta
      </Text>
      <Text style={styles.premiumText}>¡Bienvenido!</Text>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.subText }]}>
            Ingresos recientes
          </Text>
          <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
            +S/. {totalIncome.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.subText }]}>
            Gastos recientes
          </Text>
          <Text style={[styles.summaryValue, { color: "#E53935" }]}>
            -S/. {totalExpenses.toFixed(2)}
          </Text>
        </View>
      </View>
      {hasData && (
        <>
          <View
            style={[styles.chartContainer, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Ingresos mensuales
            </Text>
            <LineChart
              data={{
                labels: monthlyData.labels,
                datasets: [
                  {
                    data: monthlyData.income.some((v) => v > 0)
                      ? monthlyData.income
                      : [0, 0, 0, 0, 0, 0],
                  },
                ],
              }}
              width={screenWidth - 60}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
          <View
            style={[styles.chartContainer, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Gastos mensuales
            </Text>
            <LineChart
              data={{
                labels: monthlyData.labels,
                datasets: [
                  {
                    data: monthlyData.expenses.some((v) => v > 0)
                      ? monthlyData.expenses
                      : [0, 0, 0, 0, 0, 0],
                    color: () => "#E53935",
                  },
                ],
              }}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(229, 57, 53, ${opacity})`,
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#E53935",
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </>
      )}

      {!hasData && (
        <View style={[styles.noDataContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.noDataText, { color: theme.subText }]}>
            No hay datos suficientes para mostrar estadísticas.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  premiumText: {
    fontSize: 18,
    color: "#34C759",
    marginBottom: 20,
  },
  premiumContainer: {
    flex: 1,
  },
  premiumContent: {
    padding: 20,
    paddingTop: 40,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 14,
    textAlign: "center",
  },
});
*/
