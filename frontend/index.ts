// Background tasks must be defined before the app renders so Android can run
// them while the app is closed (see src/tasks/paymentTask.ts).
import './src/tasks/paymentTask'
import 'expo-router/entry'
