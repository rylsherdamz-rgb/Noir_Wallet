import { useRef, useState, useEffect } from 'react'
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface VoiceButtonProps {
  onTranscript?: (text: string) => void
  disabled?: boolean
}

export function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      )
      pulse.start()
      return () => pulse.stop()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isListening])

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true)
      setTimeout(() => {
        setIsListening(false)
        onTranscript?.('Send 10 USDC to my saved wallet')
      }, 2000)
    } else {
      setIsListening(false)
    }
  }

  return (
    <TouchableOpacity
      onPress={toggleListening}
      disabled={disabled}
      activeOpacity={0.7}
      style={styles.wrap}
    >
      <Animated.View style={[styles.ring, { transform: [{ scale: pulseAnim }] }]} />
      <View style={[styles.btn, isListening && styles.btnActive]}>
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={22}
          color={isListening ? Colors.black : Colors.gold}
        />
      </View>
      {isListening && <Text style={styles.label}>Listening...</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.gold + '40',
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  btnActive: {
    backgroundColor: Colors.gold,
  },
  label: {
    position: 'absolute',
    top: -20,
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
  },
})
