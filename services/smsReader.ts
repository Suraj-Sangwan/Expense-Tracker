import { Platform } from 'react-native';
import { ParsedSMS } from '@/types/transaction';

interface SMSMessage {
  _id: string;
  thread_id: string;
  address: string;
  body: string;
  date: number;
  type: number;
}

export class SMSReader {
  // Check SMS permissions
  async requestSMSPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.warn('SMS reading not available on web platform');
      return false;
    }

    try {
      // For actual mobile implementation, you would use:
      // const { status } = await SMS.requestPermissionsAsync();
      // return status === 'granted';
      
      // For demo purposes, we'll simulate permission granted
      return true;
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      return false;
    }
  }

  // Read SMS messages
  async readSMSMessages(limit: number = 100): Promise<ParsedSMS[]> {
    if (Platform.OS === 'web') {
      // Return mock data for web demonstration
      return this.getMockSMSData();
    }

    try {
      // For actual mobile implementation, you would use:
      // const messages = await SMS.getMessagesAsync({
      //   limit,
      //   type: 'inbox'
      // });

      // For now, return mock data
      return this.getMockSMSData();
    } catch (error) {
      console.error('Error reading SMS messages:', error);
      return [];
    }
  }

  // Get bank-related SMS messages
  async getBankSMSMessages(): Promise<ParsedSMS[]> {
    const allMessages = await this.readSMSMessages();
    
    // Filter for bank-related senders
    const bankSenders = [
      'SBIALERT', 'SBIUPI', 'SBIPAY',
      'HDFCBK', 'HDFCUPI',
      'ICICIB', 'ICICIUPI',
      'AXISBK', 'AXISUPI',
      'KOTAKBK', 'YESBNK',
      'PAYTM', 'GPAY', 'PHONEPE', 'AMAZONPAY'
    ];

    return allMessages.filter(sms =>
      bankSenders.some(sender => 
        sms.sender.toUpperCase().includes(sender)
      )
    );
  }

  // Start background SMS monitoring
  startSMSMonitoring(callback: (sms: ParsedSMS) => void): void {
    if (Platform.OS === 'web') {
      console.warn('Background SMS monitoring not available on web platform');
      return;
    }

    // For actual mobile implementation, you would set up:
    // 1. SMS listener using react-native-sms-retriever
    // 2. Background task processing
    // 3. Real-time SMS parsing

    console.log('SMS monitoring started (mock implementation)');
  }

  // Stop SMS monitoring
  stopSMSMonitoring(): void {
    if (Platform.OS === 'web') return;
    
    console.log('SMS monitoring stopped');
  }

  // Mock SMS data for demonstration
  private getMockSMSData(): ParsedSMS[] {
    const mockSMSData = [
      {
        id: 'sms_1',
        body: 'Dear Customer, Rs.500.00 debited from your SBI A/c **1234 on 15-Jan-25 at SWIGGY BANGALORE. Available balance: Rs.15,000.00. UPI Ref: 501234567890',
        sender: 'SBIALERT',
        date: new Date('2025-01-15T14:30:00'),
        isProcessed: false,
      },
      {
        id: 'sms_2',
        body: 'Rs.2500.00 credited to your HDFC Bank A/c **5678 on 15-Jan-25. Salary credit from TECHCORP INDIA. Balance: Rs.45,000.00',
        sender: 'HDFCBK',
        date: new Date('2025-01-15T09:00:00'),
        isProcessed: false,
      },
      {
        id: 'sms_3',
        body: 'UPI payment of Rs.150.00 sent to phonepe@ybl via ICICI Bank A/c **9012. UPI Ref: 789123456789. Balance: Rs.12,850.00',
        sender: 'ICICIUPI',
        date: new Date('2025-01-15T12:15:00'),
        isProcessed: false,
      },
      {
        id: 'sms_4',
        body: 'Rs.800.00 debited from Axis Bank A/c **3456 on 14-Jan-25 for AMAZON PAY purchase. Available balance: Rs.25,200.00',
        sender: 'AXISBK',
        date: new Date('2025-01-14T18:45:00'),
        isProcessed: false,
      },
      {
        id: 'sms_5',
        body: 'Rs.1200.00 debited from your SBI A/c **1234 on 14-Jan-25 at BIG BAZAAR MUMBAI. Available balance: Rs.14,000.00',
        sender: 'SBIALERT',
        date: new Date('2025-01-14T16:20:00'),
        isProcessed: false,
      },
    ];

    return mockSMSData;
  }
}

export const smsReader = new SMSReader();