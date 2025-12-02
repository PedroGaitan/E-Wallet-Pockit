import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { router, Stack } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, Search } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function SupportScreen() {
  // 1. ESTADO
  const {theme} = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // 2. DATOS (8 FAQs con categoría)
  const faqs = [
    {
      question: "¿Cómo puedo recargar mi cuenta?",
      answer: "Puedes realizar recargas desde la pantalla principal utilizando el boton de Recargar Dinero",
      category: "Recargas",
    },
    {
      question: "¿Qué hago si no reconozco un pago?",
      answer: "Puedes reportarlo desde 'Movimientos recientes'. Nuestro equipo investigará el caso.",
      category: "Seguridad",
    },
    {
      question: "¿Cómo cambio mi contraseña?",
      answer: "Ve a Configuración > Seguridad > Cambiar contraseña.",
      category: "Seguridad",
    },
    {
      question: "¿Cuáles son los límites de mi cuenta?",
      answer: "Los límites dependen del nivel de verificación. Puedes revisarlos en la sección 'Límites de cuenta'.",
      category: "Límites",
    },
    {
      question: "¿Puedo enviar dinero a otro banco?",
      answer: "Sí, puedes realizar transferencias bancarias desde la sección 'Enviar Dinero'.",
      category: "Transferencias",
    },
    {
      question: "¿Qué costos tiene usar la app?",
      answer: "La mayoría de operaciones son gratuitas. Algunos servicios pueden tener comisión.",
      category: "Costos",
    },
    {
      question: "¿Cómo actualizo mis datos personales?",
      answer: "Desde Perfil > Información personal > Editar datos.",
      category: "Seguridad",
    },
    {
      question: "¿Cómo funciona Pockit?",
      answer: "Pockit funciona como una billetera digital que te permite gestionar pagos, recargas y transferencias.",
      category: "General",
    },
  ];

  // 3. FILTRADO DINÁMICO
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. FUNCIÓN ATRÁS
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
    <Stack.Screen options={{ headerShown: false }} />
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Soporte</Text>

        {/* Placeholder para centrar */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* SECCIÓN 1: CHAT EN VIVO */}
        <Pressable
          style={[styles.liveChatCard, { backgroundColor: theme.background }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/support/chat");
          }}
        >
          <View style={styles.chatIconWrapper}>
            <MessageCircle size={26} color="#fff" />
            {/* Badge verde */}
            <View style={styles.onlineBadge} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.liveChatTitle}>Chat en vivo</Text>
            <Text style={styles.liveChatSubtitle}>Habla con un agente ahora • Disponible 24/7</Text>
          </View>

          <Text style={styles.chevronRight}>›</Text>
        </Pressable>

        {/* SECCIÓN 2: OTROS MÉTODOS DE CONTACTO */}
        <Text style={[styles.sectionTitle, { color: theme.text}]}>Otros métodos de contacto</Text>

        {/* Teléfono */}
        <View style={styles.contactRow}>
          <View style={[styles.contactIcon, { backgroundColor: theme.card }]}>
            <Phone color={theme.text} size={20} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: theme.subText}]}>Llamar a soporte</Text>
            <Text style={[styles.contactValue, { color: theme.text }]}>800-123-4567</Text>
            <Text style={[styles.contactHours, { color: theme.subText }]}>Lunes a Viernes, 9:00 AM - 6:00 PM</Text>
          </View>
        </View>

        {/* Separador */}
        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Email */}
        <View style={styles.contactRow}>
          <View style={[styles.contactIcon, { backgroundColor: theme.card }]}>
            <Mail color={theme.text} size={20} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: theme.subText }]}>Correo de soporte</Text>
            <Text style={[styles.contactValue, { color: theme.text }]}>soporte@pockit.com</Text>
            <Text style={[styles.contactHours, { color: theme.subText }]}>Respuesta en menos de 24 horas</Text>
          </View>
        </View>

        {/* SECCIÓN 3: FAQ */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Preguntas frecuentes</Text>

        {/* Buscador */}
        <View style={[styles.searchContainer, { backgroundColor: theme.text }]}>
          <Search size={18} color={theme.background} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar en preguntas frecuentes..."
            placeholderTextColor={theme.background}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.background }]}
          />
        </View>

        {/* Lista FAQ */}
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedFaq(expandedFaq === index ? null : index);
                }}
                style={styles.faqQuestion}
              >
                <HelpCircle size={18} color={theme.text} style={styles.faqIcon} />

                <View style={styles.faqContent}>
                  <Text style={[styles.faqQuestionText, { color: theme.text }]}>
                    {faq.question}
                  </Text>
                  <Text style={[styles.faqCategory, { color: theme.subText }]}>
                    {faq.category}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.faqChevron,
                    { color: theme.text },
                    expandedFaq === index && styles.faqChevronExpanded,
                  ]}
                >
                  ›
                </Text>
              </Pressable>

              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, { color: theme.subText }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <HelpCircle size={48} color={theme.text} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No se encontraron resultados</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subText }]}>
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        )}

        {/* SECCIÓN 4: INFO CARD */}
        <View style={[styles.infoCard, { backgroundColor: theme.background }]}>
          <Text style={[styles.infoText, { color: theme.subText }]}>
            💬 Nuestro equipo está disponible 24/7 para ayudarte por chat en vivo.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ===================== ESTILOS ===================== //

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 22, fontWeight: "700" },

  // Chat
  liveChatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    gap: 16,
  },
  chatIconWrapper: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ade80",
    position: "absolute",
    top: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },
  liveChatTitle: { fontSize: 18, color: "#fff", fontWeight: "700" },
  liveChatSubtitle: { fontSize: 14, color: "#e0e0e0" },
  chevronRight: { color: "#fff", fontSize: 22 },

  // Contacto
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, marginTop: 10 },
  contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: { flexDirection: "column" },
  contactLabel: { fontSize: 12 },
  contactValue: { fontSize: 16, fontWeight: "600" },
  contactHours: { fontSize: 12, marginTop: 2 },
  separator: { height: 1, marginVertical: 16 },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  // FAQ
  faqItem: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqIcon: { marginRight: 12 },
  faqContent: { flex: 1 },
  faqQuestionText: { fontSize: 15, fontWeight: "600" },
  faqCategory: { fontSize: 12, marginTop: 2 },
  faqChevron: { fontSize: 22, transform: [{ rotate: "0deg" }] },
  faqChevronExpanded: { transform: [{ rotate: "90deg" }] },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 60,
  },
  faqAnswerText: { fontSize: 14, lineHeight: 20 },

  // Empty State
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  emptyIcon: { opacity: 0.5, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: "center" },

  // Info card
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 30,
  },
  infoText: {
    textAlign: "center",
    fontSize: 14,
  },
});