const durationMultipliers = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
};

export const parseDurationToMs = (duration = '') => {
  const match = String(duration).trim().match(/^(\d+)([smhd])$/i);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  return amount * durationMultipliers[unit];
};

export const getExpiryDateFromDuration = (duration) => {
  const durationMs = parseDurationToMs(duration);

  if (!durationMs) {
    return null;
  }

  return new Date(Date.now() + durationMs);
};
