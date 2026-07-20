import { View, Text } from 'react-native'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
  variant?: 'dots' | 'line' | 'numbered'
  testID?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels = [],
  variant = 'dots',
  testID,
}: ProgressIndicatorProps) {
  if (variant === 'dots') {
    return (
      <View
        className="flex-row items-center justify-center gap-2 py-4"
        testID={testID}
        accessibilityRole="progressbar"
        accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
        accessibilityValue={{ now: currentStep, min: 1, max: totalSteps }}
      >
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <View
            key={step}
            className={`w-2 h-2 rounded-full ${step === currentStep ? 'w-6 bg-gold' : step < currentStep ? 'bg-gold/50' : 'bg-borderGrey'}`}
          />
        ))}
      </View>
    )
  }

  if (variant === 'line') {
    const progress = (currentStep / totalSteps) * 100

    return (
      <View className="py-4 gap-2" testID={testID}>
        <View className="h-1 bg-borderGrey rounded-full overflow-hidden">
          <View className="h-full bg-gold rounded-full" style={{ width: `${progress}%` }} />
        </View>
        <Text className="text-xs text-mutedWhite text-center font-medium">
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-row items-center py-4 px-4" testID={testID}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isActive = step === currentStep
        const isCompleted = step < currentStep
        const label = stepLabels[step - 1]

        return (
          <View key={step} className="flex-1 items-center relative">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mb-1 border-2 ${isActive ? 'bg-gold border-gold' : isCompleted ? 'bg-gold/20 border-gold' : 'bg-midGrey border-borderGrey'}`}
            >
              <Text className={`text-sm font-bold ${isActive ? 'text-black' : isCompleted ? 'text-gold' : 'text-mutedWhite'}`}>
                {step}
              </Text>
            </View>
            {label && (
              <Text
                className={`text-xs text-center max-w-[80] ${isActive ? 'text-gold font-semibold' : 'text-mutedWhite'}`}
                numberOfLines={1}
              >
                {label}
              </Text>
            )}
            {step < totalSteps && (
              <View className="absolute top-4 left-1/2 right-[-50%] h-0.5 bg-borderGrey z-[-1]" />
            )}
          </View>
        )
      })}
    </View>
  )
}
