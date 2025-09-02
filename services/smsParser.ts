import { Transaction, ParsedSMS, BankConfig } from '@/types/transaction';

// Indian bank SMS patterns and configurations
const BANK_CONFIGS: BankConfig[] = [
  {
    name: 'State Bank of India',
    senderIds: ['SBIALERT', 'SBIUPI', 'SBIPAY'],
    patterns: {
      debit: [
        /debited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /withdrawn.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /spent.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      credit: [
        /credited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /deposited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /received.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      balance: [
        /balance.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /bal.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      upi: [
        /upi/i,
        /@\w+/i,
        /paytm|gpay|phonepe|amazon.*pay|bhim/i,
      ],
    },
  },
  {
    name: 'HDFC Bank',
    senderIds: ['HDFCBK', 'HDFCUPI'],
    patterns: {
      debit: [
        /debited.*?inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /spent.*?inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      credit: [
        /credited.*?inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /received.*?inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      balance: [
        /balance.*?inr\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      upi: [
        /upi/i,
        /@\w+/i,
        /paytm|gpay|phonepe|amazon.*pay|bhim/i,
      ],
    },
  },
  {
    name: 'ICICI Bank',
    senderIds: ['ICICIB', 'ICICIUPI'],
    patterns: {
      debit: [
        /debited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /withdrawn.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      credit: [
        /credited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /deposited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      balance: [
        /balance.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      upi: [
        /upi/i,
        /@\w+/i,
        /paytm|gpay|phonepe|amazon.*pay|bhim/i,
      ],
    },
  },
  {
    name: 'Axis Bank',
    senderIds: ['AXISBK', 'AXISUPI'],
    patterns: {
      debit: [
        /debited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /spent.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      credit: [
        /credited.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /received.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      balance: [
        /balance.*?rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      ],
      upi: [
        /upi/i,
        /@\w+/i,
        /paytm|gpay|phonepe|amazon.*pay|bhim/i,
      ],
    },
  },
];

export class SMSParser {
  private bankConfigs: BankConfig[];

  constructor() {
    this.bankConfigs = BANK_CONFIGS;
  }

  // Check if SMS is from a bank
  isBankSMS(sender: string): boolean {
    return this.bankConfigs.some(config => 
      config.senderIds.some(id => sender.toUpperCase().includes(id))
    );
  }

  // Get bank config from sender
  getBankConfig(sender: string): BankConfig | null {
    return this.bankConfigs.find(config => 
      config.senderIds.some(id => sender.toUpperCase().includes(id))
    ) || null;
  }

  // Parse amount from text, handling Indian number formatting
  parseAmount(text: string): number | null {
    const amountMatch = text.match(/(?:rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    if (amountMatch) {
      return parseFloat(amountMatch[1].replace(/,/g, ''));
    }
    return null;
  }

  // Determine transaction type
  getTransactionType(text: string, bankConfig: BankConfig): 'debit' | 'credit' | null {
    const lowerText = text.toLowerCase();
    
    // Check debit patterns
    if (bankConfig.patterns.debit.some(pattern => pattern.test(lowerText))) {
      return 'debit';
    }
    
    // Check credit patterns
    if (bankConfig.patterns.credit.some(pattern => pattern.test(lowerText))) {
      return 'credit';
    }
    
    return null;
  }

  // Check if transaction is UPI
  isUPITransaction(text: string, bankConfig: BankConfig): boolean {
    const lowerText = text.toLowerCase();
    return bankConfig.patterns.upi.some(pattern => pattern.test(lowerText));
  }

  // Extract merchant/payee information
  extractMerchant(text: string): string | null {
    // Common patterns for merchant extraction
    const patterns = [
      /(?:to|at|from)\s+([A-Z\s]+?)(?:\s+on|\s+ref|\s+upi|\s+transaction|$)/i,
      /@(\w+)/i, // UPI ID
      /merchant\s+([A-Z\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  // Extract UPI ID
  extractUPIId(text: string): string | null {
    const upiMatch = text.match(/([a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+)/);
    return upiMatch ? upiMatch[1] : null;
  }

  // Extract balance from SMS
  extractBalance(text: string, bankConfig: BankConfig): number | null {
    for (const pattern of bankConfig.patterns.balance) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    return null;
  }

  // Main parsing function
  parseTransaction(sms: ParsedSMS): Transaction | null {
    const bankConfig = this.getBankConfig(sms.sender);
    if (!bankConfig) return null;

    const amount = this.parseAmount(sms.body);
    const type = this.getTransactionType(sms.body, bankConfig);
    
    if (!amount || !type) return null;

    const isUpi = this.isUPITransaction(sms.body, bankConfig);
    const merchant = this.extractMerchant(sms.body);
    const upiId = isUpi ? this.extractUPIId(sms.body) : undefined;
    const balance = this.extractBalance(sms.body, bankConfig);

    return {
      id: `txn_${sms.id}_${Date.now()}`,
      amount,
      type,
      description: this.generateDescription(sms.body, merchant, isUpi),
      category: this.getInitialCategory(sms.body, merchant, isUpi),
      date: sms.date,
      account: this.extractAccountInfo(sms.body),
      balance,
      merchant,
      upiId,
      isUpi,
      smsId: sms.id,
      bankName: bankConfig.name,
      confidence: this.calculateConfidence(sms.body, amount, type),
      isEdited: false,
      rawSms: sms.body,
    };
  }

  private generateDescription(text: string, merchant: string | null, isUpi: boolean): string {
    if (merchant) {
      return isUpi ? `UPI payment to ${merchant}` : `Transaction with ${merchant}`;
    }
    
    // Extract key words for description
    const words = text.toLowerCase().split(/\s+/);
    const relevantWords = words.filter(word => 
      !['rs', 'inr', 'debited', 'credited', 'account', 'ref', 'upi'].includes(word) &&
      word.length > 2
    );
    
    return relevantWords.slice(0, 4).join(' ') || 'Bank transaction';
  }

  private getInitialCategory(text: string, merchant: string | null, isUpi: boolean): string {
    const lowerText = text.toLowerCase();
    const merchantLower = merchant?.toLowerCase() || '';

    // Food & Dining
    if (/swiggy|zomato|restaurant|food|dining|cafe|pizza|burger/i.test(lowerText + merchantLower)) {
      return 'Food & Dining';
    }

    // Transportation
    if (/uber|ola|metro|bus|taxi|fuel|petrol|diesel|parking/i.test(lowerText + merchantLower)) {
      return 'Transportation';
    }

    // Shopping
    if (/amazon|flipkart|myntra|shopping|store|mall|purchase/i.test(lowerText + merchantLower)) {
      return 'Shopping';
    }

    // Entertainment
    if (/netflix|spotify|movie|entertainment|game|subscription/i.test(lowerText + merchantLower)) {
      return 'Entertainment';
    }

    // Bills & Utilities
    if (/electricity|water|gas|mobile|internet|recharge|bill/i.test(lowerText + merchantLower)) {
      return 'Bills & Utilities';
    }

    // Healthcare
    if (/hospital|doctor|medical|pharmacy|health|medicine/i.test(lowerText + merchantLower)) {
      return 'Healthcare';
    }

    // Investment
    if (/mutual|fund|sip|investment|stock|trading/i.test(lowerText + merchantLower)) {
      return 'Investment';
    }

    // Default category
    return isUpi ? 'UPI Payment' : 'Other';
  }

  private extractAccountInfo(text: string): string {
    // Extract last 4 digits of account
    const accountMatch = text.match(/(\d{4})/);
    return accountMatch ? `****${accountMatch[1]}` : 'Unknown Account';
  }

  private calculateConfidence(text: string, amount: number, type: string): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for clear amount patterns
    if (/rs\.?\s*\d+/i.test(text)) confidence += 0.2;
    
    // Higher confidence for clear transaction type words
    if (/(debited|credited|spent|received)/i.test(text)) confidence += 0.2;
    
    // Higher confidence for account information
    if (/account.*\d{4}/i.test(text)) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}

export const smsParser = new SMSParser();