import * as TaskManager from 'expo-task-manager'
import * as BackgroundTask from 'expo-background-task'
import { checkIncomingPayments, PAYMENT_TASK } from '@/services/paymentNotifier'

// Background tasks must be defined at module scope, before the app renders,
// so the OS can run them when the app is closed. index.ts imports this first.
TaskManager.defineTask(PAYMENT_TASK, async () => {
  try {
    await checkIncomingPayments()
    return BackgroundTask.BackgroundTaskResult.Success
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed
  }
})
