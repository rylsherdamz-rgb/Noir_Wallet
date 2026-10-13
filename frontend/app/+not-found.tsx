import { View, Text, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/Button'
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme'

const NOIR_MARK = require('../assets/noir-mark.png')

export default function NotFoundScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={NOIR_MARK} style={styles.mark} resizeMode="contain" accessibilityLabel="Noir" />
        <Text style={styles.title}>Nothing here</Text>
        <Text style={styles.description}>This page doesn’t exist or has moved.</Text>
        <Button label="Back to wallet" onPress={() => router.replace('/(tabs)')} style={styles.button} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: 12 },
  mark: { width: 72, height: 76, opacity: 0.9, marginBottom: Spacing.sm },
  title: { fontFamily: Fonts.display, fontSize: 26, color: Colors.cream },
  description: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 22 },
  button: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl },
})
