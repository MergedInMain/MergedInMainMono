/**
 * Account model for the FundMoney app
 * Represents a financial account (e.g., cash, bank account, credit card)
 */

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'savings' | 'investment' | 'other';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isDefault?: boolean;
  isArchived?: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Default accounts for the app
export const DEFAULT_ACCOUNTS: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Cash', type: 'cash', balance: 0, currency: 'USD', icon: 'cash', color: '#4CAF50', isDefault: true },
  { name: 'Bank Account', type: 'bank', balance: 0, currency: 'USD', icon: 'bank', color: '#2196F3' },
  { name: 'Credit Card', type: 'credit', balance: 0, currency: 'USD', icon: 'credit-card', color: '#F44336' },
];
