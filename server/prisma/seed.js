const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function dateInMonth(monthsAgo, day) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(Math.min(day, 28));
  return d;
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.transaction.deleteMany();
  await prisma.recurringBill.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.pot.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();

  console.log('Creating categories...');
  const categoryData = [
    { name: 'Income', color: '#00b894' },
    { name: 'Groceries', color: '#0984e3' },
    { name: 'Entertainment', color: '#e17055' },
    { name: 'Bills', color: '#d63031' },
    { name: 'Transport', color: '#6c5ce7' },
    { name: 'Dining Out', color: '#fdcb6e' },
    { name: 'Personal Care', color: '#e84393' },
    { name: 'Shopping', color: '#00cec9' },
    { name: 'General', color: '#636e72' },
  ];

  const categories = {};
  for (const c of categoryData) {
    const created = await prisma.category.create({ data: c });
    categories[c.name] = created;
  }

  console.log('Creating accounts...');
  const checking = await prisma.account.create({
    data: { name: 'Checking Account', type: 'checking', balance: 2450.75 },
  });
  const savings = await prisma.account.create({
    data: { name: 'Savings Account', type: 'savings', balance: 8100.0 },
  });
  const creditCard = await prisma.account.create({
    data: { name: 'Credit Card', type: 'credit', balance: -320.4 },
  });

  console.log('Creating budgets...');
  await prisma.budget.createMany({
    data: [
      { categoryId: categories['Groceries'].id, limitAmount: 400, period: 'monthly' },
      { categoryId: categories['Entertainment'].id, limitAmount: 100, period: 'monthly' },
      { categoryId: categories['Bills'].id, limitAmount: 350, period: 'monthly' },
      { categoryId: categories['Transport'].id, limitAmount: 150, period: 'monthly' },
      { categoryId: categories['Dining Out'].id, limitAmount: 120, period: 'monthly' },
    ],
  });

  console.log('Creating pots...');
  await prisma.pot.createMany({
    data: [
      { name: 'Vacation', targetAmount: 2000, currentAmount: 750, color: '#0984e3' },
      { name: 'New Laptop', targetAmount: 1500, currentAmount: 1500, color: '#6c5ce7' },
      { name: 'Emergency Fund', targetAmount: 5000, currentAmount: 3200, color: '#d63031' },
      { name: 'Gift Fund', targetAmount: 300, currentAmount: 90, color: '#e84393' },
    ],
  });

  console.log('Creating recurring bills...');
  const recurringBillDefs = [
    { name: 'Netflix', amount: 15.99, dueDay: 5, categoryId: categories['Entertainment'].id, merchant: 'Netflix' },
    { name: 'Spotify', amount: 9.99, dueDay: 8, categoryId: categories['Entertainment'].id, merchant: 'Spotify' },
    { name: 'Rent', amount: 950, dueDay: 1, categoryId: categories['Bills'].id, merchant: 'Skyline Properties' },
    { name: 'Electricity', amount: 75.5, dueDay: 12, categoryId: categories['Bills'].id, merchant: 'City Power & Light' },
    { name: 'Gym Membership', amount: 34.0, dueDay: 20, categoryId: categories['Personal Care'].id, merchant: 'FitZone Gym' },
    { name: 'Phone Plan', amount: 45.0, dueDay: 15, categoryId: categories['Bills'].id, merchant: 'Nova Mobile' },
  ];

  for (const bill of recurringBillDefs) {
    await prisma.recurringBill.create({
      data: {
        name: bill.name,
        merchant: bill.merchant,
        amount: bill.amount,
        dueDay: bill.dueDay,
        categoryId: bill.categoryId,
      },
    });
  }

  console.log('Creating transactions...');
  const transactions = [];

  const today = new Date();
  for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo--) {
    for (const bill of recurringBillDefs) {
      if (monthsAgo === 0 && bill.dueDay > today.getDate()) continue; // not due yet this month
      transactions.push({
        amount: -bill.amount,
        description: bill.name,
        merchant: bill.merchant,
        date: dateInMonth(monthsAgo, bill.dueDay),
        isRecurring: true,
        accountId: checking.id,
        categoryId: bill.categoryId,
      });
    }
  }

  for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo--) {
    transactions.push({
      amount: 3200,
      description: 'Monthly Salary',
      merchant: 'Acme Corp',
      date: dateInMonth(monthsAgo, 25),
      accountId: checking.id,
      categoryId: categories['Income'].id,
    });
  }

  const everyday = [
    { description: 'Weekly grocery shop', merchant: 'FreshMart', category: 'Groceries', min: 40, max: 95 },
    { description: 'Grocery top-up', merchant: 'Corner Grocer', category: 'Groceries', min: 10, max: 30 },
    { description: 'Movie night', merchant: 'Cineplex', category: 'Entertainment', min: 12, max: 28 },
    { description: 'Coffee', merchant: 'Bean There Cafe', category: 'Dining Out', min: 3, max: 7 },
    { description: 'Lunch out', merchant: 'The Deli Spot', category: 'Dining Out', min: 8, max: 18 },
    { description: 'Dinner out', merchant: 'Trattoria Bella', category: 'Dining Out', min: 25, max: 60 },
    { description: 'Fuel', merchant: 'QuickFuel Station', category: 'Transport', min: 35, max: 60 },
    { description: 'Bus pass top-up', merchant: 'MetroTransit', category: 'Transport', min: 20, max: 40 },
    { description: 'Haircut', merchant: 'Style Studio', category: 'Personal Care', min: 20, max: 45 },
    { description: 'Online order', merchant: 'ShopHub', category: 'Shopping', min: 15, max: 90 },
    { description: 'Miscellaneous purchase', merchant: 'General Store', category: 'General', min: 5, max: 50 },
  ];

  function randomBetween(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo--) {
    const count = monthsAgo === 0 ? 10 : 14;
    for (let i = 0; i < count; i++) {
      const item = everyday[Math.floor(Math.random() * everyday.length)];
      const day = Math.floor(Math.random() * (monthsAgo === 0 ? today.getDate() : 28)) + 1;
      transactions.push({
        amount: -randomBetween(item.min, item.max),
        description: item.description,
        merchant: item.merchant,
        date: dateInMonth(monthsAgo, day),
        accountId: Math.random() > 0.3 ? checking.id : creditCard.id,
        categoryId: categories[item.category].id,
      });
    }
  }

  transactions.sort((a, b) => a.date - b.date);

  await prisma.transaction.createMany({ data: transactions });

  console.log(`Seed complete: ${transactions.length} transactions created.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
