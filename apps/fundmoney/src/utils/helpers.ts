/**
 * Helper functions for the FundMoney app
 */

import { Budget, BudgetProgress, Category, Transaction, TransactionSummary } from '@/models';
import { eachDayOfInterval, endOfMonth, format, isToday, isYesterday, startOfMonth } from 'date-fns';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Format currency amount
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param compact - Whether to use compact notation (default: false)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  compact: boolean = false
): string => {
  console.log(`Formatting amount: ${amount}, compact: ${compact}`);

  if (compact) {
    // For compact display (e.g. on calendar)
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${Math.round(amount)}`;
  }

  // Full currency format
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date, formatString: string = 'MMM d, yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return 'Today';
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  }

  return format(dateObj, formatString);
};

/**
 * Calculate transaction summary for a given period
 */
export const calculateTransactionSummary = (
  transactions: Transaction[],
  startDate?: Date,
  endDate?: Date
): TransactionSummary => {
  // Filter transactions by date range if provided
  let filteredTransactions = transactions;
  if (startDate && endDate) {
    filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  // Calculate totals
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const expensesByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};

  filteredTransactions.forEach(t => {
    if (t.type === 'expense') {
      expensesByCategory[t.categoryId] = (expensesByCategory[t.categoryId] || 0) + t.amount;
    } else {
      incomeByCategory[t.categoryId] = (incomeByCategory[t.categoryId] || 0) + t.amount;
    }
  });

  return {
    totalExpenses,
    totalIncome,
    balance: totalIncome - totalExpenses,
    expensesByCategory,
    incomeByCategory,
  };
};

/**
 * Calculate budget progress
 */
export const calculateBudgetProgress = (
  budget: Budget,
  transactions: Transaction[],
  categories: Category[]
): BudgetProgress => {
  // Find the category
  const category = categories.find(c => c.id === budget.categoryId);

  if (!category) {
    throw new Error(`Category not found for budget: ${budget.id}`);
  }

  // Filter transactions by category and date range
  const startDate = new Date(budget.startDate);
  const endDate = budget.endDate ? new Date(budget.endDate) : new Date();

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      t.categoryId === budget.categoryId &&
      t.type === 'expense' &&
      transactionDate >= startDate &&
      transactionDate <= endDate
    );
  });

  // Calculate spent amount
  const spentAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingAmount = Math.max(0, budget.amount - spentAmount);
  const percentage = (spentAmount / budget.amount) * 100;

  return {
    budgetId: budget.id,
    categoryId: budget.categoryId,
    categoryName: category.name,
    budgetAmount: budget.amount,
    spentAmount,
    remainingAmount,
    percentage: Math.min(100, percentage), // Cap at 100%
  };
};

/**
 * Get all days in a month
 */
export const getDaysInMonth = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return eachDayOfInterval({ start, end });
};

/**
 * Group transactions by date
 */
export const groupTransactionsByDate = (
  transactions: Transaction[]
): Record<string, Transaction[]> => {
  const grouped: Record<string, Transaction[]> = {};

  transactions.forEach(transaction => {
    const date = transaction.date.split('T')[0]; // Get YYYY-MM-DD part

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(transaction);
  });

  return grouped;
};

/**
 * Calculate daily totals for a month
 */
export const calculateDailyTotals = (
  transactions: Transaction[],
  year: number,
  month: number
): Record<number, { expenses: number; income: number }> => {
  console.log(`Calculating daily totals for ${year}-${month} with ${transactions.length} transactions`);

  const result: Record<number, { expenses: number; income: number }> = {};

  // Initialize all days of the month with zero values
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    result[day] = { expenses: 0, income: 0 };
  }

  // Filter transactions for the specified month
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    const matches = date.getFullYear() === year && date.getMonth() === month - 1;

    if (matches) {
      console.log(`Transaction matches ${year}-${month}: ${t.description} on ${date.toISOString()}`);
    }

    return matches;
  });

  console.log(`Found ${monthTransactions.length} transactions for ${year}-${month}`);

  // Calculate totals for each day
  monthTransactions.forEach(t => {
    const date = new Date(t.date);
    const day = date.getDate();

    if (t.type === 'expense') {
      result[day].expenses += t.amount;
      console.log(`Added expense: $${t.amount} on day ${day} (${t.description})`);
    } else {
      result[day].income += t.amount;
      console.log(`Added income: $${t.amount} on day ${day} (${t.description})`);
    }
  });

  // Log the final result
  console.log(`Daily totals for ${year}-${month}:`, result);

  return result;
};
