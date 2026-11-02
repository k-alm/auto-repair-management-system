export function averageExecutionMinutes(durations: number[]) {
  if (durations.length === 0) return null;
  return Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length);
}
