import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, ParsedSMS, Category, Budget, Goal } from '@/types/transaction';
import { smsParser } from './smsParser';

const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  BUDGETS: 'budgets',
  GOALS: 'goals',
  LAST_SMS_SYNC: 'lastSmsSync',
};

export class TransactionService {
  // Default categories for Indian users
  private defaultCategories: Category[] = [
    {
      id: 'food',
      name: 'Food & Dining',
      icon: '🍽️',
      color: '#F59E0B',
      subcategories: ['Restaurants', 'Groceries', 'Food Delivery', 'Snacks'],
      keywords: ['swiggy', 'zomato', 'restaurant', 'food', 'cafe', 'dining'],
    },
    {
      id: 'transport',
      name: 'Transportation',
      icon: '🚗',
      color: '#3B82F6',
      subcategories: ['Fuel', 'Taxi/Auto', 'Public Transport', 'Parking'],
      keywords: ['uber', 'ola', 'metro', 'bus', 'fuel', 'petrol', 'diesel'],
    },
    {
      id: 'shopping',
      name: 'Shopping',
      icon: '🛍️',
      color: '#EC4899',
      subcategories: ['Clothing', 'Electronics', 'Home', 'Personal Care'],
      keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'store'],
    },
    {
      id: 'bills',
      name: 'Bills & Utilities',
      icon: '⚡',
      color: '#EF4444',
      subcategories: ['Electricity', 'Water', 'Gas', 'Internet', 'Mobile'],
      keywords: ['electricity', 'water', 'gas', 'mobile', 'internet', 'bill'],
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎬',
      color: '#8B5CF6',
      subcategories: ['Movies', 'Subscriptions', 'Games', 'Events'],
      keywords: ['netflix', 'spotify', 'movie', 'entertainment', 'subscription'],
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: '🏥',
      color: '#10B981',
      subcategories: ['Doctor', 'Medicine', 'Hospital', 'Insurance'],
      keywords: ['hospital', 'doctor', 'medical', 'pharmacy', 'health'],
    },
    {
      id: 'investment',
      name: 'Investment',
      icon: '📈',
      color: '#059669',
      subcategories: ['Mutual Funds', 'Stocks', 'SIP', 'Fixed Deposit'],
      keywords: ['mutual', 'fund', 'sip', 'investment', 'stock', 'trading'],
    },
    {
      id: 'income',
      name: 'Income',
      icon: '💰',
      color: '#10B981',
      subcategories: ['Salary', 'Freelance', 'Business', 'Interest'],
      keywords: ['salary', 'income', 'payment', 'freelance', 'business'],
    },
  ];

  // Initialize default data
  async initializeDefaults(): Promise<void> {
    try {
      const existingCategories = await this.getCategories();
      if (existingCategories.length === 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.defaultCategories));
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
    }
  }

  // Process SMS messages and extract transactions
  async processSMSMessages(smsMessages: ParsedSMS[]): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    
    for (const sms of smsMessages) {
      if (smsParser.isBankSMS(sms.sender)) {
        const transaction = smsParser.parseTransaction(sms);
        if (transaction) {
          transactions.push(transaction);
        }
      }
    }

    // Save new transactions
    await this.saveTransactions(transactions);
    return transactions;
  }

  // Save transactions to local storage
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      const existingTransactions = await this.getTransactions();
      const allTransactions = [...existingTransactions];

      // Add new transactions, avoiding duplicates
      for (const transaction of transactions) {
        const exists = allTransactions.some(t => t.smsId === transaction.smsId);
        if (!exists) {
          allTransactions.push(transaction);
        }
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  // Get all transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) {
        const transactions = JSON.parse(data);
        // Convert date strings back to Date objects
        return transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Update transaction (for manual editing)
  async updateTransaction(updatedTransaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === updatedTransaction.id);
      
      if (index !== -1) {
        transactions[index] = { ...updatedTransaction, isEdited: true };
        await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Get monthly spending by category
  async getMonthlySpending(year: number, month: number): Promise<Record<string, number>> {
    const transactions = await this.getTransactions();
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month && t.type === 'debit';
    });

    const spending: Record<string, number> = {};
    monthlyTransactions.forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    });

    return spending;
  }

  // Get current balance (from latest transaction)
  async getCurrentBalance(): Promise<number | null> {
    const transactions = await this.getTransactions();
    const latestWithBalance = transactions.find(t => t.balance !== undefined);
    return latestWithBalance?.balance || null;
  }

  // AI-powered categorization enhancement
  enhanceCategorization(transaction: Transaction, categories: Category[]): { category: string; confidence: number } {
    const text = `${transaction.description} ${transaction.merchant || ''}`.toLowerCase();
    
    let bestMatch = { category: transaction.category, confidence: transaction.confidence };
    
    for (const category of categories) {
      let score = 0;
      
      // Check keyword matches
      for (const keyword of category.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 0.3;
        }
      }
      
      // Boost score for UPI transactions with relevant merchants
      if (transaction.isUpi && category.keywords.some(k => text.includes(k))) {
        score += 0.2;
      }
      
      if (score > bestMatch.confidence) {
        bestMatch = { category: category.name, confidence: Math.min(score, 1.0) };
      }
    }
    
    return bestMatch;
  }
}

export const transactionService = new TransactionService();