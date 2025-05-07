/**
 * Test data for the FundMoney app
 * Contains sample transactions, categories, and accounts for testing
 */

import { Account, Category, Transaction } from '@/models';
import { generateId } from '@/utils/helpers';

/**
 * Generate test transactions for the past month
 * @param categories - List of categories to use for transactions
 * @param accounts - List of accounts to use for transactions
 * @returns List of test transactions
 */
export const generateTestTransactions = (
  categories: Category[],
  accounts: Account[]
): Transaction[] => {
  console.log('Generating test transactions...');
  console.log(`Categories: ${categories.length}, Accounts: ${accounts.length}`);

  // Get category IDs by type
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');

  console.log(`Expense categories: ${expenseCategories.length}, Income categories: ${incomeCategories.length}`);
  console.log('Expense categories:', expenseCategories.map(c => c.name));
  console.log('Income categories:', incomeCategories.map(c => c.name));

  // Get default account ID
  const defaultAccount = accounts.find(a => a.isDefault) || accounts[0];
  const defaultAccountId = defaultAccount.id;
  console.log(`Default account: ${defaultAccount.name} (${defaultAccountId})`);

  // Generate transactions for the current and previous month
  const transactions: Transaction[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Also generate for previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Generate some recurring transactions

  // 1. Bi-weekly salary (income)
  const salaryCategory = incomeCategories.find(c => c.name === 'Salary') || incomeCategories[0];
  const payDay1 = new Date(currentYear, currentMonth, 15);
  const payDay2 = new Date(currentYear, currentMonth, 30);

  console.log(`Pay days: ${payDay1.toISOString()}, ${payDay2.toISOString()}`);

  // Always add these transactions regardless of date
  transactions.push({
    id: generateId(),
    amount: 2500,
    description: 'Bi-weekly Salary',
    categoryId: salaryCategory.id,
    date: payDay1.toISOString(),
    type: 'income',
    accountId: defaultAccountId,
    createdAt: payDay1.toISOString(),
    updatedAt: payDay1.toISOString(),
  });

  transactions.push({
    id: generateId(),
    amount: 2500,
    description: 'Bi-weekly Salary',
    categoryId: salaryCategory.id,
    date: payDay2.toISOString(),
    type: 'income',
    accountId: defaultAccountId,
    createdAt: payDay2.toISOString(),
    updatedAt: payDay2.toISOString(),
  });

  // 2. Monthly rent (expense)
  const housingCategory = expenseCategories.find(c => c.name === 'Housing') || expenseCategories[0];
  const rentDay = new Date(currentYear, currentMonth, 1);

  console.log(`Rent day: ${rentDay.toISOString()}`);

  // Always add rent transaction
  transactions.push({
    id: generateId(),
    amount: 1200,
    description: 'Monthly Rent',
    categoryId: housingCategory.id,
    date: rentDay.toISOString(),
    type: 'expense',
    accountId: defaultAccountId,
    createdAt: rentDay.toISOString(),
    updatedAt: rentDay.toISOString(),
  });

  // 3. Utilities (expense)
  const utilitiesCategory = expenseCategories.find(c => c.name === 'Bills & Utilities') || expenseCategories[0];
  const utilitiesDay = new Date(currentYear, currentMonth, 5);

  console.log(`Utilities day: ${utilitiesDay.toISOString()}`);

  // Always add utilities transaction
  transactions.push({
    id: generateId(),
    amount: 150,
    description: 'Electricity Bill',
    categoryId: utilitiesCategory.id,
    date: utilitiesDay.toISOString(),
    type: 'expense',
    accountId: defaultAccountId,
    createdAt: utilitiesDay.toISOString(),
    updatedAt: utilitiesDay.toISOString(),
  });

  // Generate fixed daily transactions for specific days
  const foodCategory = expenseCategories.find(c => c.name === 'Food & Dining') || expenseCategories[0];
  const transportCategory = expenseCategories.find(c => c.name === 'Transportation') || expenseCategories[0];
  const entertainmentCategory = expenseCategories.find(c => c.name === 'Entertainment') || expenseCategories[0];

  // Add food expenses on specific days
  const foodDays = [3, 7, 10, 14, 18, 21, 25, 28];
  foodDays.forEach(day => {
    const date = new Date(currentYear, currentMonth, day);
    const foodAmount = Math.floor(Math.random() * 30) + 10; // $10-$40

    transactions.push({
      id: generateId(),
      amount: foodAmount,
      description: Math.random() > 0.5 ? 'Lunch' : 'Dinner',
      categoryId: foodCategory.id,
      date: date.toISOString(),
      type: 'expense',
      accountId: defaultAccountId,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });

    console.log(`Added food expense on day ${day}: $${foodAmount}`);
  });

  // Add transportation expenses on specific days
  const transportDays = [2, 8, 12, 16, 22, 26];
  transportDays.forEach(day => {
    const date = new Date(currentYear, currentMonth, day);
    const transportAmount = Math.floor(Math.random() * 20) + 5; // $5-$25

    transactions.push({
      id: generateId(),
      amount: transportAmount,
      description: Math.random() > 0.5 ? 'Gas' : 'Public Transit',
      categoryId: transportCategory.id,
      date: date.toISOString(),
      type: 'expense',
      accountId: defaultAccountId,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });

    console.log(`Added transportation expense on day ${day}: $${transportAmount}`);
  });

  // Add entertainment expenses on specific days
  const entertainmentDays = [6, 20];
  entertainmentDays.forEach(day => {
    const date = new Date(currentYear, currentMonth, day);
    const entertainmentAmount = Math.floor(Math.random() * 50) + 20; // $20-$70

    transactions.push({
      id: generateId(),
      amount: entertainmentAmount,
      description: Math.random() > 0.5 ? 'Movie' : 'Concert',
      categoryId: entertainmentCategory.id,
      date: date.toISOString(),
      type: 'expense',
      accountId: defaultAccountId,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });

    console.log(`Added entertainment expense on day ${day}: $${entertainmentAmount}`);
  });

  // Generate transactions for previous month
  // 1. Previous month salary
  const prevPayDay1 = new Date(prevMonthYear, prevMonth, 15);
  const prevPayDay2 = new Date(prevMonthYear, prevMonth, 30);

  transactions.push({
    id: generateId(),
    amount: 2500,
    description: 'Bi-weekly Salary',
    categoryId: salaryCategory.id,
    date: prevPayDay1.toISOString(),
    type: 'income',
    accountId: defaultAccountId,
    createdAt: prevPayDay1.toISOString(),
    updatedAt: prevPayDay1.toISOString(),
  });

  transactions.push({
    id: generateId(),
    amount: 2500,
    description: 'Bi-weekly Salary',
    categoryId: salaryCategory.id,
    date: prevPayDay2.toISOString(),
    type: 'income',
    accountId: defaultAccountId,
    createdAt: prevPayDay2.toISOString(),
    updatedAt: prevPayDay2.toISOString(),
  });

  // 2. Previous month rent
  const prevRentDay = new Date(prevMonthYear, prevMonth, 1);
  transactions.push({
    id: generateId(),
    amount: 1200,
    description: 'Monthly Rent',
    categoryId: housingCategory.id,
    date: prevRentDay.toISOString(),
    type: 'expense',
    accountId: defaultAccountId,
    createdAt: prevRentDay.toISOString(),
    updatedAt: prevRentDay.toISOString(),
  });

  // 3. Previous month utilities
  const prevUtilitiesDay = new Date(prevMonthYear, prevMonth, 5);
  transactions.push({
    id: generateId(),
    amount: 150,
    description: 'Electricity Bill',
    categoryId: utilitiesCategory.id,
    date: prevUtilitiesDay.toISOString(),
    type: 'expense',
    accountId: defaultAccountId,
    createdAt: prevUtilitiesDay.toISOString(),
    updatedAt: prevUtilitiesDay.toISOString(),
  });

  // Generate some random transactions for previous month
  for (let day = 10; day <= 28; day += 3) {
    const date = new Date(prevMonthYear, prevMonth, day);

    // Food expense
    const foodCategory = expenseCategories.find(c => c.name === 'Food & Dining') || expenseCategories[0];
    const foodAmount = Math.floor(Math.random() * 30) + 10; // $10-$40

    transactions.push({
      id: generateId(),
      amount: foodAmount,
      description: Math.random() > 0.5 ? 'Lunch' : 'Dinner',
      categoryId: foodCategory.id,
      date: date.toISOString(),
      type: 'expense',
      accountId: defaultAccountId,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });

    // Transportation expense
    if (Math.random() > 0.3) {
      const transportCategory = expenseCategories.find(c => c.name === 'Transportation') || expenseCategories[0];
      const transportAmount = Math.floor(Math.random() * 20) + 5; // $5-$25

      transactions.push({
        id: generateId(),
        amount: transportAmount,
        description: Math.random() > 0.5 ? 'Gas' : 'Public Transit',
        categoryId: transportCategory.id,
        date: date.toISOString(),
        type: 'expense',
        accountId: defaultAccountId,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }
  }

  console.log(`Generated ${transactions.length} test transactions`);
  console.log('First few transactions:', transactions.slice(0, 3));
  console.log('Last few transactions:', transactions.slice(-3));

  // Verify dates are in the correct format
  const sampleDates = transactions.map(t => t.date).slice(0, 5);
  console.log('Sample dates:', sampleDates);

  return transactions;
};
