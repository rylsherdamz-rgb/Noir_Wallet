import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { ChatMessage } from '@/types'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  if (message.isTyping) {
    return (
      <View className="bg-cardBg border border-borderGrey max-w-[78%] p-4 rounded-2xl rounded-bl-lg">
        <View className="flex-row gap-1 py-1">
          <View className="w-2 h-2 rounded-full bg-mutedWhite opacity-40" />
          <View className="w-2 h-2 rounded-full bg-mutedWhite opacity-60" />
          <View className="w-2 h-2 rounded-full bg-mutedWhite opacity-80" />
        </View>
      </View>
    )
  }

  return (
    <View className={`flex-row mb-2 px-4 ${isUser ? 'justify-end' : 'justify-start gap-2'}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full items-center justify-center self-end" style={{ backgroundColor: Colors.gold + '20' }}>
          <Ionicons name="sparkles" size={16} color={Colors.gold} />
        </View>
      )}
      <View className={`max-w-[78%] p-4 rounded-2xl ${isUser ? 'bg-gold rounded-br-lg' : 'bg-cardBg border border-borderGrey rounded-bl-lg'}`}>
        <Text className={`text-sm leading-5 ${isUser ? 'text-black' : 'text-white'}`}>
          {message.text}
        </Text>
        <Text className={`text-xs mt-1 self-end ${isUser ? 'text-black/50' : 'text-mutedWhite'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  )
}
