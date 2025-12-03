import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { askGemini } from '../../lib/ai';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

const QUICK_REPLIES = ['💰 Saldo', '🔄 Transferencias', '👨‍💼 Hablar con un agente real'];

export default function ChatSupportScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      text: '¡Hola! Soy Pockit AI, tu agente de soporte. ¿En qué puedo ayudarte hoy?',
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const timeNow = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const pushMessage = (msg: Message) => setMessages(prev => [...prev, msg]);

  const handleSend = async () => {
    if (!message.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: timeNow(),
    };

    pushMessage(userMsg);
    setMessage('');
    setIsTyping(true);

    try {
      const aiText = await askGemini(userMsg.text);

      await new Promise(res => setTimeout(res, 1500));

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText ?? 'Hubo un problema procesando tu solicitud.',
        sender: 'agent',
        timestamp: timeNow(),
      };

      setIsTyping(false);
      pushMessage(aiMsg);
    } catch {
      setIsTyping(false);
      pushMessage({
        id: (Date.now() + 1).toString(),
        text: 'Error al conectar con soporte. Intenta nuevamente.',
        sender: 'agent',
        timestamp: timeNow(),
      });
    }
  };

  const handleQuickReply = async (text: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Mostrar como mensaje del usuario
  const userMsg: Message = {
    id: Date.now().toString(),
    text,
    sender: 'user',
    timestamp: timeNow(),
  };

  pushMessage(userMsg);

  // 👉 CASO: HABLAR CON AGENTE REAL
  if (text.includes('agente')) {
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: '📞 Puedes comunicarte con un agente real al número: 800-123-4267',
        sender: 'agent',
        timestamp: timeNow(),
      };
      pushMessage(agentMsg);
    }, 800);
    return;
  }

  // 👉 CASO SALDO O TRANSFERENCIAS → SE ENVÍA A GEMINI
  setIsTyping(true);

  try {
    const aiText = await askGemini(text);

    await new Promise(res => setTimeout(res, 1200));

    const aiMsg: Message = {
      id: (Date.now() + 2).toString(),
      text: aiText ?? 'No pude obtener respuesta.',
      sender: 'agent',
      timestamp: timeNow(),
    };

    setIsTyping(false);
    pushMessage(aiMsg);
  } catch {
    setIsTyping(false);
    pushMessage({
      id: (Date.now() + 3).toString(),
      text: 'Error al procesar tu solicitud.',
      sender: 'agent',
      timestamp: timeNow(),
    });
  }
};

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
    <Stack.Screen options={{ headerShown: false }} />

    {/* HEADER FIJO, CALCULADO */}
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          paddingBottom:25 
        },
      ]}
    >
      <Pressable onPress={handleBack} style={styles.headerButton}>
        <ArrowLeft color={theme.text} size={30} />
      </Pressable>

      <View style={styles.headerCenter}>
        <View style={[styles.avatar, { backgroundColor: theme.text }]}>
          <Text style={[styles.avatarText, { color: theme.background }]}>A</Text>
          <View style={styles.onlineDot} />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.agentName, { color: theme.text }]}>Pockit AI</Text>
          <Text style={[styles.agentStatus, { color: theme.subText }]}>En línea • Soporte</Text>
        </View>
      </View>

      <View style={{ width: 40 }} />
    </View>

    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
>
      <ScrollView
        ref={scrollRef}
        style={styles.messagesArea}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome card */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>💬 Chat en vivo</Text>
          <Text style={[styles.welcomeText, { color: theme.subText }]}>
            Estás chateando con nuestro equipo de soporte. Tiempo de respuesta: menos de 1 minuto.
          </Text>
        </View>

        {messages.map(m => (
          <View
            key={m.id}
            style={[
              styles.messageRow,
              m.sender === 'user' ? styles.rowUser : styles.rowAgent,
            ]}
          >
            {m.sender === 'agent' && (
              <View style={[styles.msgAvatar, { backgroundColor: theme.text }]}>
                <Text style={[styles.msgAvatarText, { color: theme.background }]}>A</Text>
              </View>
            )}

            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: m.sender === 'user' ? theme.card : theme.text,
                },
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  { color: m.sender === 'user' ? theme.text : theme.background },
                ]}
              >
                {m.text}
              </Text>
              <View style={styles.bubbleFooter}>
                <Text
                  style={[
                    styles.timestamp,
                    { color: m.sender === 'user' ? theme.subText : theme.background },
                  ]}
                >
                  {m.timestamp}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageRow, styles.rowAgent]}>
            <View style={[styles.msgAvatar, { backgroundColor: theme.text }]}>
              <Text style={[styles.msgAvatarText, { color: theme.background }]}>A</Text>
            </View>
            <View style={[styles.typingBubble, { backgroundColor: theme.card }]}>
              <Text style={[styles.typingDots, { color: theme.subText }]}>• • •</Text>
            </View>
          </View>
        )}

        {!isTyping && (
          <View style={styles.quickContainer}>
            <View style={styles.quickRow}>
              {QUICK_REPLIES.map(q => (
                <TouchableOpacity
                  key={q}
                  onPress={() => handleQuickReply(q)}
                  style={[styles.quickButton, { backgroundColor: theme.text }]}
                >
                  <Text style={[styles.quickText, { color: theme.background }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* INPUT FIXED Y QUE SUBE BIEN */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={theme.subText}
            style={[styles.input, { color: theme.text }]}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            { backgroundColor: message.trim() ? theme.text : theme.card },
          ]}
          disabled={!message.trim()}
        >
          <Ionicons
            name="send"
            size={18}
            color={message.trim() ? theme.background : theme.subText}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
  alignItems: 'flex-end',
  paddingHorizontal: 12,

  paddingTop: 6,
  paddingBottom: 2,  // 👈 ESTO LO SUBE EN TODOS LOS iPHONE

  borderTopWidth: 1,
  gap: 8,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: { fontWeight: '700', fontSize: 16 },

  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#fff',
  },

  agentName: { fontWeight: '600', fontSize: 15 },
  agentStatus: { fontSize: 12 },

  messagesArea: { flex: 1 },

  welcomeCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  welcomeTitle: { fontWeight: '600', fontSize: 15, marginBottom: 4 },
  welcomeText: { fontSize: 13 },

  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  rowAgent: { justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },

  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  msgAvatarText: { fontWeight: '700' },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '75%',
  },

  bubbleText: { fontSize: 14, lineHeight: 20 },

  bubbleFooter: { marginTop: 6, flexDirection: 'row', justifyContent: 'flex-end' },

  timestamp: { fontSize: 10, opacity: 0.7 },

  typingBubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  typingDots: { fontSize: 18, lineHeight: 18 },

  quickContainer: { marginTop: 8 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  quickText: { fontSize: 13 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },

  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },

  input: { fontSize: 15 },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});