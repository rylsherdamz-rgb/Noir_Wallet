import { View, Text, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'

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
    merchant: 'person-circle-outline' as const,
  }

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className="border border-borderGrey"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    )
  }

  return (
    <View
      className="items-center justify-center border"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.gold + '15',
        borderColor: Colors.gold + '30',
      }}
    >
      {name ? (
        <Text className="text-gold font-bold" style={{ fontSize: size * 0.4 }}>{initials}</Text>
      ) : (
        <Ionicons name={iconMap[variant]} size={size * 0.5} color={Colors.gold} />
      )}
    </View>
  )
}
