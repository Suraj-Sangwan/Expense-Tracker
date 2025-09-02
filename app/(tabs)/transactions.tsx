import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionCard } from '@/components/TransactionCard';
import { useTheme } from '@/hooks/useTheme';
import { transactionService } from '@/services/transactionService';
import { Transaction } from '@/types/transaction';
import { Filter, Search } from 'lucide-react-native';

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit' | 'upi'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [transactions, selectedFilter]);

  const loadTransactions = async () => {
    try {
      const allTransactions = await transactionService.getTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const applyFilter = () => {
    let filtered = [...transactions];

    switch (selectedFilter) {
      case 'credit':
        filtered = transactions.filter(t => t.type === 'credit');
        break;
      case 'debit':
        filtered = transactions.filter(t => t.type === 'debit');
        break;
      case 'upi':
        filtered = transactions.filter(t => t.isUpi);
        break;
      default:
        filtered = transactions;
    }

    setFilteredTransactions(filtered);
  };

  const handleEditTransaction = async (updatedTransaction: Transaction) => {
    try {
      await transactionService.updateTransaction(updatedTransaction);
      await loadTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onEdit={handleEditTransaction}
    />
  );

  const FilterButton = ({ 
    label, 
    value, 
    count 
  }: { 
    label: string; 
    value: 'all' | 'credit' | 'debit' | 'upi'; 
    count: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === value && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === value && { color: colors.background }
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
    },
    searchText: {
      flex: 1,
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 12,
    },
    filtersContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    listContainer: {
      paddingBottom: 20,
    },
  });

  const creditCount = transactions.filter(t => t.type === 'credit').length;
  const debitCount = transactions.filter(t => t.type === 'debit').length;
  const upiCount = transactions.filter(t => t.isUpi).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>All your financial activities</Text>

        <TouchableOpacity style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <Text style={styles.searchText}>Search transactions...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FilterButton label="All" value="all" count={transactions.length} />
        <FilterButton label="Income" value="credit" count={creditCount} />
        <FilterButton label="Expenses" value="debit" count={debitCount} />
        <FilterButton label="UPI" value="upi" count={upiCount} />
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}