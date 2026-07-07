export function validateEfficiency(value: number, min: number, max: number): string | null {
  if (value < min) return `不能低于 ${min * 100}%`;
  if (value > max) return `不能超过 ${max * 100}%`;
  return null;
}

export function validatePositive(value: number, label: string): string | null {
  if (value <= 0) return `${label}必须大于 0`;
  return null;
}

export function validateRuns(value: number, max: number): string | null {
  if (value < 1) return '流程数最少为 1';
  if (value > max) return `流程数最多为 ${max}`;
  return null;
}
