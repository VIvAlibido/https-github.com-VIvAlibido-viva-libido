export async function register() {
  // Only run the scheduler on the server side (not in the browser)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('./lib/scheduler');
    startScheduler();
  }
}
