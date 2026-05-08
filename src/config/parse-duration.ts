const durationPattern = /^(\d+)([smhd])$/;

const durationUnitsInSeconds: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
};

export function parseDurationToSeconds(
  value: string | undefined,
  fallbackInSeconds: number,
): number {
  if (!value) {
    return fallbackInSeconds;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(durationPattern);

  if (!match) {
    return fallbackInSeconds;
  }

  const [, amount, unit] = match;
  return Number(amount) * durationUnitsInSeconds[unit];
}
