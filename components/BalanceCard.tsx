import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface BalanceCardProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function BalanceCard({ 
  balance, 
  monthlyIncome, 
  monthlyExpense, 
  isVisible, 
  onToggleVisibility 
}: BalanceCardProps) {
  const { colors } = useTheme();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      margin: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    balanceLabel: {
      fontSize: 14,
      color: colors.background,
      opacity: 0.9,
      fontWeight: '500',
    },
    toggleButton: {
      padding: 4,
    },
    balance: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.background,
      marginBottom: 20,
    },
    hiddenBalance: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.background,
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    statAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.background,
      marginLeft: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.background,
      opacity: 0.8,
      fontWeight: '500',
    },
    divider: {
      width: 1,
      height: 40,
      backgroundColor: colors.background,
      opacity: 0.3,
      marginHorizontal: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={onToggleVisibility}>
          {isVisible ? (
            <Eye size={20} color={colors.background} />
          ) : (
            <EyeOff size={20} color={colors.background} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={isVisible ? styles.balance : styles.hiddenBalance}>
        {isVisible ? formatAmount(balance) : '••••••••'}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statRow}>
            <TrendingUp size={16} color={colors.background} />
            <Text style={styles.statAmount}>
              {isVisible ? formatAmount(monthlyIncome) : '••••'}
            </Text>
          </View>
          <Text style={styles.statLabel}>This Month Income</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={styles.statRow}>
            <TrendingDown size={16} color={colors.background} />
            <Text style={styles.statAmount}>
              {isVisible ? formatAmount(monthlyExpense) : '••••'}
            </Text>
          </View>
          <Text style={styles.statLabel}>This Month Spent</Text>
        </View>
      </View>
    </View>
  );
}