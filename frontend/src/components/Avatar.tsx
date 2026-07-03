import { View, Text, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface AvatarProps {
  uri?: string | null
  name?: string
  size?: number
  variant?: 'user' | 'device' | 'merchant'
}

export function Avatar({ uri, name, size = 40, variant = 'user' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const iconMap = {
    user: 'person-outline' as const,
    device: 'hardware-chip-outline' as const,
    merchant: 'storefront-outline' as const,
  }

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    )
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.gold + '15',
        },
      ]}
    >
      {name ? (
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
      ) : (
        <Ionicons name={iconMap[variant]} size={size * 0.5} color={Colors.gold} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  initials: {
    color: Colors.gold,
    fontWeight: FontWeight.bold,
  },
})
