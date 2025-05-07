/**
 * Category model for the FundMoney app
 * Represents a category for transactions
 */

export interface Category {
  id: string;
  name: string;
  icon: string; // Icon name from the icon library
  color: string; // Hex color code
  type: 'expense' | 'income' | 'both';
  parentId?: string; // For subcategories
  isDefault?: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Default categories for the app
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Expense categories
  { name: 'Food & Dining', icon: 'food-variant', color: '#FF5722', type: 'expense' },
  { name: 'Transportation', icon: 'car', color: '#2196F3', type: 'expense' },
  { name: 'Housing', icon: 'home', color: '#4CAF50', type: 'expense' },
  { name: 'Entertainment', icon: 'movie', color: '#9C27B0', type: 'expense' },
  { name: 'Shopping', icon: 'shopping', color: '#E91E63', type: 'expense' },
  { name: 'Health', icon: 'medical-bag', color: '#00BCD4', type: 'expense' },
  { name: 'Education', icon: 'school', color: '#3F51B5', type: 'expense' },
  { name: 'Personal Care', icon: 'face-man', color: '#FF9800', type: 'expense' },
  { name: 'Bills & Utilities', icon: 'lightning-bolt', color: '#607D8B', type: 'expense' },
  { name: 'Other Expenses', icon: 'cash', color: '#795548', type: 'expense' },
  
  // Income categories
  { name: 'Salary', icon: 'briefcase', color: '#4CAF50', type: 'income' },
  { name: 'Freelance', icon: 'laptop', color: '#2196F3', type: 'income' },
  { name: 'Investments', icon: 'chart-line', color: '#9C27B0', type: 'income' },
  { name: 'Gifts', icon: 'gift', color: '#E91E63', type: 'income' },
  { name: 'Other Income', icon: 'cash-plus', color: '#607D8B', type: 'income' },
];
