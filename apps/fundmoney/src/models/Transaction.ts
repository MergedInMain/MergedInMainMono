/**
 * Transaction model for the FundMoney app
 * Represents an expense or income transaction
 */

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO date string
  type: TransactionType;
  accountId: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  tags?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface TransactionSummary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  expensesByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}
