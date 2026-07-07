export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return n.toString();
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const s = Math.floor(totalSeconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${String(days).padStart(2, '0')}:${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
