/**
 * Storage service for the FundMoney app
 * Handles saving and retrieving data from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Budget, Category, Transaction, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from '@/models';
import { generateId } from '@/utils/helpers';

// Storage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'fundmoney_transactions',
  CATEGORIES: 'fundmoney_categories',
  ACCOUNTS: 'fundmoney_accounts',
  BUDGETS: 'fundmoney_budgets',
  SETTINGS: 'fundmoney_settings',
  FIRST_LAUNCH: 'fundmoney_first_launch',
};

// Initialize default data on first launch
export const initializeAppData = async (): Promise<void> => {
  try {
    const isFirstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    
    if (isFirstLaunch === null) {
      // Initialize default categories
      const defaultCategories: Category[] = DEFAULT_CATEGORIES.map(category => ({
        ...category,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Initialize default accounts
      const defaultAccounts: Account[] = DEFAULT_ACCOUNTS.map(account => ({
        ...account,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Save default data
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
      await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(defaultAccounts));
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
      
      // Mark as initialized
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
};

// Generic get function
const getItems = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return [];
  }
};

// Generic save function
const saveItems = async <T>(key: string, items: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
};

// Transactions
export const getTransactions = (): Promise<Transaction[]> => 
  getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS);

export const saveTransactions = (transactions: Transaction[]): Promise<void> => 
  saveItems<Transaction>(STORAGE_KEYS.TRANSACTIONS, transactions);

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
  const transactions = await getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await saveTransactions([...transactions, newTransaction]);
  return newTransaction;
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  const transactions = await getTransactions();
  const updatedTransactions = transactions.map(t => 
    t.id === transaction.id ? { ...transaction, updatedAt: new Date().toISOString() } : t
  );
  
  await saveTransactions(updatedTransactions);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const transactions = await getTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== id);
  
  await saveTransactions(filteredTransactions);
};

// Categories
export const getCategories = (): Promise<Category[]> => 
  getItems<Category>(STORAGE_KEYS.CATEGORIES);

export const saveCategories = (categories: Category[]): Promise<void> => 
  saveItems<Category>(STORAGE_KEYS.CATEGORIES, categories);

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
  const categories = await getCategories();
  const newCategory: Category = {
    ...category,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await saveCategories([...categories, newCategory]);
  return newCategory;
};

// Accounts
export const getAccounts = (): Promise<Account[]> => 
  getItems<Account>(STORAGE_KEYS.ACCOUNTS);

export const saveAccounts = (accounts: Account[]): Promise<void> => 
  saveItems<Account>(STORAGE_KEYS.ACCOUNTS, accounts);

export const addAccount = async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> => {
  const accounts = await getAccounts();
  const newAccount: Account = {
    ...account,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await saveAccounts([...accounts, newAccount]);
  return newAccount;
};

// Budgets
export const getBudgets = (): Promise<Budget[]> => 
  getItems<Budget>(STORAGE_KEYS.BUDGETS);

export const saveBudgets = (budgets: Budget[]): Promise<void> => 
  saveItems<Budget>(STORAGE_KEYS.BUDGETS, budgets);

export const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
  const budgets = await getBudgets();
  const newBudget: Budget = {
    ...budget,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await saveBudgets([...budgets, newBudget]);
  return newBudget;
};

/**
 * Load test data without resetting existing data
 * This adds test transactions to the existing data
 */
export const loadTestData = async (): Promise<void> => {
  try {
    console.log('Loading test data...');

    // Get existing categories and accounts
    const categories = await getCategories();
    const accounts = await getAccounts();

    console.log(`Found ${categories.length} categories and ${accounts.length} accounts`);

    if (categories.length === 0 || accounts.length === 0) {
      console.error('Cannot load test data: No categories or accounts found');
      return;
    }

    // Get category IDs by type
    const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
    const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');

    console.log(`Expense categories: ${expenseCategories.length}, Income categories: ${incomeCategories.length}`);

    // Get default account ID
    const defaultAccount = accounts.find(a => a.isDefault) || accounts[0];
    const defaultAccountId = defaultAccount.id;

    // Generate transactions for the current month
    const testTransactions: Transaction[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Generate some recurring transactions
    for (let i = 0; i < 30; i++) {
      // Random day in current month (1-28 to avoid edge cases)
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(currentYear, currentMonth, day);
      
      // Random amount between 10 and 1000
      const amount = Math.floor(Math.random() * 990) + 10;
      
      // Random type (70% expense, 30% income)
      const type = Math.random() > 0.7 ? 'income' : 'expense';
      
      // Random category based on type
      const categoryPool = type === 'expense' ? expenseCategories : incomeCategories;
      const categoryId = categoryPool.length > 0 
        ? categoryPool[Math.floor(Math.random() * categoryPool.length)].id
        : categories[0].id;
      
      // Create transaction
      testTransactions.push({
        id: generateId(),
        amount,
        description: `Test ${type} ${i + 1}`,
        categoryId,
        date: date.toISOString(),
        type,
        accountId: defaultAccountId,
        notes: `This is a test ${type} transaction`,
        tags: ['test', type],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`Generated ${testTransactions.length} test transactions`);
    console.log('Sample test transaction:', testTransactions[0]);

    // Get existing transactions
    const existingTransactions = await getTransactions();
    console.log(`Found ${existingTransactions.length} existing transactions`);

    // Combine existing and test transactions
    const allTransactions = [...existingTransactions, ...testTransactions];

    // Save combined transactions
    await saveTransactions(allTransactions);

    // Verify the transactions were saved
    const savedTransactions = await getTransactions();
    console.log(`Now have ${savedTransactions.length} total transactions`);

    console.log(`Added ${testTransactions.length} test transactions`);
  } catch (error) {
    console.error('Error loading test data:', error);
    throw error; // Re-throw to propagate to UI
  }
};
