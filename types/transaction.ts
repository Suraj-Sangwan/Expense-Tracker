export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  category: string;
  subcategory?: string;
  date: Date;
  account: string;
  balance?: number;
  merchant?: string;
  upiId?: string;
  isUpi: boolean;
  smsId: string;
  bankName: string;
  confidence: number; // AI confidence in categorization
  isEdited: boolean;
  rawSms: string;
}

export interface ParsedSMS {
  id: string;
  body: string;
  sender: string;
  date: Date;
  isProcessed: boolean;
  transaction?: Transaction;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
  keywords: string[];
}

export interface BankConfig {
  name: string;
  senderIds: string[];
  patterns: {
    debit: RegExp[];
    credit: RegExp[];
    balance: RegExp[];
    upi: RegExp[];
  };
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
  year: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  isCompleted: boolean;
}