export function getPotEstimate(pot, today = new Date()) {
  const current = Number(pot.currentAmount);
  const target = Number(pot.targetAmount);

  if (current >= target) {
    return { status: "reached" };
  }

  if (current <= 0) {
    return { status: "no-data" };
  }

  const createdAt = new Date(pot.createdAt);
  if (isNaN(createdAt.getTime())) {
    return { status: "no-data" };
  }

  const createdAtUtc = Date.UTC(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysSinceCreated = Math.max(1, Math.round((todayUtc - createdAtUtc) / (1000 * 60 * 60 * 24)));
  const dailyRate = current / daysSinceCreated;
  const daysRemaining = Math.ceil((target - current) / dailyRate);

  const estimatedDate = new Date(today);
  estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);

  return { status: "estimated", date: estimatedDate };
}