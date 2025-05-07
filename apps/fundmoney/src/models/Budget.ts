/**
 * Budget model for the FundMoney app
 * Represents a budget for a specific category
 */

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  isRecurring: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface BudgetProgress {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number; // Percentage of budget used (0-100)
}
