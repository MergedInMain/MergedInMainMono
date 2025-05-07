/**
 * AppContext for the FundMoney app
 * Provides global state management for the app
 */

import { Account, Budget, Category, Transaction, TransactionSummary } from '@/models';
import * as Storage from '@/services/storageService';
import { calculateTransactionSummary } from '@/utils/helpers';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AppContextType {
  // Data
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];

  // Summary data
  summary: TransactionSummary;

  // Loading state
  isLoading: boolean;

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;

  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>;

  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Budget>;

  // Refresh data
  refreshData: () => Promise<void>;

  // Load test data
  loadTestData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    expensesByCategory: {},
    incomeByCategory: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);

        // Initialize app data if first launch
        await Storage.initializeAppData();

        // Load data from storage
        const loadedTransactions = await Storage.getTransactions();
        const loadedCategories = await Storage.getCategories();
        const loadedAccounts = await Storage.getAccounts();
        const loadedBudgets = await Storage.getBudgets();

        // Update state
        setTransactions(loadedTransactions);
        setCategories(loadedCategories);
        setAccounts(loadedAccounts);
        setBudgets(loadedBudgets);

        // Calculate summary
        const calculatedSummary = calculateTransactionSummary(loadedTransactions);
        setSummary(calculatedSummary);
      } catch (error) {
        console.error('Error initializing app data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    try {
      setIsLoading(true);

      // Load data from storage
      const loadedTransactions = await Storage.getTransactions();
      const loadedCategories = await Storage.getCategories();
      const loadedAccounts = await Storage.getAccounts();
      const loadedBudgets = await Storage.getBudgets();

      // Update state
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
      setAccounts(loadedAccounts);
      setBudgets(loadedBudgets);

      // Calculate summary
      const calculatedSummary = calculateTransactionSummary(loadedTransactions);
      setSummary(calculatedSummary);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transaction actions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction = await Storage.addTransaction(transaction);
    await refreshData();
    return newTransaction;
  };

  const updateTransaction = async (transaction: Transaction) => {
    await Storage.updateTransaction(transaction);
    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    await Storage.deleteTransaction(id);
    await refreshData();
  };

  // Category actions
  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory = await Storage.addCategory(category);
    await refreshData();
    return newCategory;
  };

  // Account actions
  const addAccount = async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount = await Storage.addAccount(account);
    await refreshData();
    return newAccount;
  };

  // Budget actions
  const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget = await Storage.addBudget(budget);
    await refreshData();
    return newBudget;
  };

  // Load test data function
  const loadTestData = async () => {
    try {
      console.log('AppContext: Loading test data...');

      // Use the storage service to load test data
      await Storage.loadTestData();

      // Refresh data to update the UI
      await refreshData();

      console.log('AppContext: Test data loaded successfully');
    } catch (error) {
      console.error('Error loading test data:', error);
      throw error;
    }
  };

  const value = {
    transactions,
    categories,
    accounts,
    budgets,
    summary,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    addAccount,
    addBudget,
    refreshData,
    loadTestData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
