import { useAppStore } from '@/store/useAppStore'
import { DashboardScreen } from '@/screens/DashboardScreen'
import { MerchantPosScreen } from '@/screens/MerchantPosScreen'

export default function TabIndex() {
  const activeRole = useAppStore((s) => s.activeRole)

  if (activeRole === 'merchant') {
    return <MerchantPosScreen />
  }

  return <DashboardScreen />
}
