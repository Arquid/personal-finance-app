const prisma = require("../prismaClient");

async function getBudgetAlert(categoryId) {
  if (!categoryId) return null;

  const budget = await prisma.budget.findUnique({
    where: { categoryId },
    include: { category: true },
  });
  if (!budget) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const spendAgg = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { categoryId, amount: { lt: 0 }, date: { gte: start, lt: end } },
  });

  const spent = Math.abs(Number(spendAgg._sum.amount || 0));
  const limit = Number(budget.limitAmount);
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  if (percentage < 80) return null;

  return {
    category: budget.category.name,
    limitAmount: limit,
    spent,
    percentage,
    level: percentage >= 100 ? "over" : "warning",
  };
}

module.exports = { getBudgetAlert };