import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BalanceCard } from '@/components/TransactionCard';
import { TransactionCard } from '@/components/TransactionCard';
import { useTheme } from '@/hooks/useTheme';
import { transactionService } from '@/services/transactionService';
import { smsReader } from '@/services/smsReader';
import { Transaction } from '@/types/transaction';
import { Download, Smartphone } from 'lucide-react-native';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(45000);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await transactionService.initializeDefaults();
      await loadTransactions();
      await calculateMonthlyStats();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const allTransactions = await transactionService.getTransactions();
      setTransactions(allTransactions.slice(0, 10)); // Show recent 10
      
      const currentBalance = await transactionService.getCurrentBalance();
      if (currentBalance !== null) {
        setBalance(currentBalance);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const calculateMonthlyStats = async () => {
    try {
      const now = new Date();
      const allTransactions = await transactionService.getTransactions();
      
      const currentMonthTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      });

      const income = currentMonthTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = currentMonthTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      setMonthlyIncome(income);
      setMonthlyExpense(expense);
    } catch (error) {
      console.error('Error calculating monthly stats:', error);
    }
  };

  const syncSMSTransactions = async () => {
    setIsRefreshing(true);
    try {
      // Check permissions first
      const hasPermission = await smsReader.requestSMSPermissions();
      if (!hasPermission) {
        Alert.alert(
          'SMS Permission Required',
          'Please grant SMS permission to automatically track your bank transactions.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Read bank SMS messages
      const bankSMS = await smsReader.getBankSMSMessages();
      
      // Process and extract transactions
      const newTransactions = await transactionService.processSMSMessages(bankSMS);
      
      if (newTransactions.length > 0) {
        await loadTransactions();
        await calculateMonthlyStats();
        Alert.alert(
          'Sync Complete',
          `Found ${newTransactions.length} new transactions from SMS.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No New Transactions', 'No new bank SMS found.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error syncing SMS:', error);
      Alert.alert('Sync Error', 'Failed to sync SMS transactions. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditTransaction = async (updatedTransaction: Transaction) => {
    try {
      await transactionService.updateTransaction(updatedTransaction);
      await loadTransactions();
      await calculateMonthlyStats();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    syncButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    syncButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    viewAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={syncSMSTransactions}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Good morning!</Text>
          <Text style={styles.subtitle}>Here's your financial overview</Text>
          
          <TouchableOpacity style={styles.syncButton} onPress={syncSMSTransactions}>
            <Download size={20} color={colors.background} />
            <Text style={styles.syncButtonText}>Sync SMS Transactions</Text>
          </TouchableOpacity>
        </View>

        <BalanceCard
          balance={balance}
          monthlyIncome={monthlyIncome}
          monthlyExpense={monthlyExpense}
          isVisible={isBalanceVisible}
          onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEditTransaction}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Smartphone size={48} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyDescription}>
              Tap "Sync SMS Transactions" to automatically import your bank transactions from SMS messages.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}