import { BillingService } from '@repo/domain';

export interface SchedulerStatus {
  isRunning: boolean;
  intervalSeconds: number;
  lastRunAt: string | null;
  lastGeneratedCount: number;
  lastSkippedCount: number;
  totalRuns: number;
  lastError: string | null;
}

let schedulerTimer: NodeJS.Timeout | null = null;
const status: SchedulerStatus = {
  isRunning: false,
  intervalSeconds: 60,
  lastRunAt: null,
  lastGeneratedCount: 0,
  lastSkippedCount: 0,
  totalRuns: 0,
  lastError: null
};

export function getSchedulerStatus(): SchedulerStatus {
  return { ...status };
}

export function startBillingScheduler(intervalSeconds: number = 60) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  status.isRunning = true;
  status.intervalSeconds = intervalSeconds;
  console.log(`⏱️ [Scheduler] Automatic recurring billing scheduler started (interval: ${intervalSeconds}s)...`);

  // Run initial scan on startup
  runScheduledBilling();

  schedulerTimer = setInterval(() => {
    runScheduledBilling();
  }, intervalSeconds * 1000);
}

export function stopBillingScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  status.isRunning = false;
  console.log('🛑 [Scheduler] Automatic recurring billing scheduler stopped.');
}

async function runScheduledBilling() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const result = await BillingService.runBillingScan(todayStr);

    status.lastRunAt = new Date().toISOString();
    status.lastGeneratedCount = result.generatedCount;
    status.lastSkippedCount = result.skippedCount;
    status.totalRuns++;
    status.lastError = null;

    if (result.generatedCount > 0) {
      console.log(`🔔 [Scheduler] Automatic billing generated ${result.generatedCount} invoices automatically.`);
    }
  } catch (error: any) {
    status.lastError = error?.message || String(error);
    console.error('❌ [Scheduler] Error during automatic billing scan:', error);
  }
}
