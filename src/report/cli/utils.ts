import chalk from "chalk";

export function renderMetricValue(
  value: number,
  thresholds = {
    green: 0.85,
    yellow: 0.5,
    red: 0,
  }
): string {
  for (const [color, threshold] of Object.entries(thresholds)) {
    if (value >= threshold) {
      // @ts-ignore
      return chalk[color](value.toFixed(2));
    }
  }
  return chalk(value.toFixed(2));
}
