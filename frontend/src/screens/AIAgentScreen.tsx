import { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { ChatBubble } from '@/components/ChatBubble'
import { VoiceButton } from '@/components/VoiceButton'
import { SmartTip } from '@/components/SmartTip'
import { aiService } from '@/services/ai'
import { useAppStore } from '@/store/useAppStore'
import { ChatMessage } from '@/types'

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm your Noir AI assistant. I can help you with:\n\n• Check your **balance**\n• **Send** and **Receive** funds\n• Manage **NFC devices**\n• View **transactions**\n• **Security** settings\n• **Stellar network** info\n\nTry tapping the **mic** button to speak, or type your question below!",
  timestamp: Date.now(),
}

const SUGGESTIONS = [
  'What is my balance?',
  'How do I send USDC?',
  'Show my recent transactions',
  'Help with security',
]

export function AIAgentScreen() {
  const router = useRouter()
  const { balance, transactions } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages])

  const speak = useCallback(async (text: string) => {
    try {
      const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1')
      await Speech.speak(cleanText, {
        language: 'en-US',
        pitch: 1,
        rate: 0.85,
      })
    } catch {}
  }, [])

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    }

    const typingMsg: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      isTyping: true,
    }

    setMessages((prev) => [...prev, userMsg, typingMsg])
    setInput('')
    setIsProcessing(true)

    try {
      const response = await aiService.sendMessage(text, messages)
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => prev.filter((m) => m.id !== typingMsg.id).concat(assistantMsg))

      if (voiceMode) {
        speak(response)
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => prev.filter((m) => m.id !== typingMsg.id).concat(errorMsg))
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, messages, voiceMode, speak])

  const handleVoiceTranscript = useCallback((text: string) => {
    handleSend(text)
  }, [handleSend])

  const handleSmartTipAction = useCallback((route: string) => {
    if (route.startsWith('/')) {
      router.push(route as any)
    }
  }, [router])

  const tips = aiService.getSmartTips()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color={Colors.black} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerStatus}>{isProcessing ? 'Thinking...' : 'Online'}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setVoiceMode(!voiceMode)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={voiceMode ? 'volume-high' : 'volume-mute'}
            size={22}
            color={voiceMode ? Colors.gold : Colors.mutedWhite}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tipsRow}>
        {tips.slice(0, 2).map((tip) => (
          <SmartTip
            key={tip.id}
            title={tip.title}
            description={tip.description}
            variant="tip"
            dismissible={tip.dismissible}
            action={
              tip.action
                ? { label: tip.action.label, onPress: () => handleSmartTipAction(tip.action!.route) }
                : undefined
            }
          />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {messages.length === 1 && (
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsLabel}>Try asking:</Text>
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestionChip}
                  onPress={() => handleSend(s)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={Colors.mutedWhite}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend(input)}
            editable={!isProcessing}
          />
          <View style={styles.inputActions}>
            <VoiceButton onTranscript={handleVoiceTranscript} disabled={isProcessing} />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isProcessing) && styles.sendBtnDisabled]}
              onPress={() => handleSend(input)}
              disabled={!input.trim() || isProcessing}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={18}
                color={(!input.trim() || isProcessing) ? Colors.mutedWhite : Colors.black}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerStatus: {
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  tipsRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chatContent: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  suggestions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  suggestionsLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginBottom: Spacing.sm,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  suggestionText: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
    backgroundColor: Colors.black,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.white,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.lightGrey,
  },
})
