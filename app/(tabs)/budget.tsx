import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { transactionService } from '@/services/transactionService';
import { ChartPie as PieChart, Plus, CreditCard as Edit3 } from 'lucide-react-native';

interface BudgetItem {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export default function BudgetScreen() {
  const { colors } = useTheme();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      const now = new Date();
      const spending = await transactionService.getMonthlySpending(now.getFullYear(), now.getMonth());
      
      // Mock budget data - in real app this would come from storage
      const mockBudgets = [
        { category: 'Food & Dining', budgeted: 8000 },
        { category: 'Transportation', budgeted: 3000 },
        { category: 'Shopping', budgeted: 5000 },
        { category: 'Bills & Utilities', budgeted: 4000 },
        { category: 'Entertainment', budgeted: 2000 },
      ];

      const budgetData: BudgetItem[] = mockBudgets.map(budget => {
        const spent = spending[budget.category] || 0;
        const remaining = budget.budgeted - spent;
        const percentage = (spent / budget.budgeted) * 100;

        return {
          category: budget.category,
          budgeted: budget.budgeted,
          spent,
          remaining,
          percentage: Math.min(percentage, 100),
        };
      });

      setBudgetItems(budgetData);
      setTotalBudget(mockBudgets.reduce((sum, b) => sum + b.budgeted, 0));
      setTotalSpent(Object.values(spending).reduce((sum, amount) => sum + amount, 0));
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const addBudgetItem = () => {
    if (newCategory.trim() && newAmount.trim()) {
      const amount = parseFloat(newAmount);
      if (amount > 0) {
        // In real app, save to storage
        setIsAddingBudget(false);
        setNewCategory('');
        setNewAmount('');
        loadBudgetData();
      }
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return colors.success;
    if (percentage < 90) return colors.warning;
    return colors.error;
  };

  const BudgetCard = ({ item }: { item: BudgetItem }) => (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <Text style={styles.categoryName}>{item.category}</Text>
        <TouchableOpacity>
          <Edit3 size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.spentAmount}>{formatAmount(item.spent)}</Text>
        <Text style={styles.budgetAmount}>of {formatAmount(item.budgeted)}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.percentage}%`,
                backgroundColor: getProgressColor(item.percentage),
              },
            ]}
          />
        </View>
        <Text style={[styles.percentageText, { color: getProgressColor(item.percentage) }]}>
          {item.percentage.toFixed(1)}%
        </Text>
      </View>

      <Text style={[
        styles.remainingText,
        { color: item.remaining >= 0 ? colors.success : colors.error }
      ]}>
        {item.remaining >= 0 ? 'Remaining: ' : 'Over budget: '}
        {formatAmount(Math.abs(item.remaining))}
      </Text>
    </View>
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
    overviewCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      margin: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    overviewTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    overviewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    overviewLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    overviewAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
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
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    budgetCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 6,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 12,
    },
    spentAmount: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    budgetAmount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressTrack: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 12,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    percentageText: {
      fontSize: 12,
      fontWeight: '600',
      width: 40,
      textAlign: 'right',
    },
    remainingText: {
      fontSize: 14,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    saveButtonText: {
      color: colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        <Text style={styles.subtitle}>Track your monthly spending</Text>
      </View>

      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>January 2025 Overview</Text>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Total Budget</Text>
          <Text style={styles.overviewAmount}>{formatAmount(totalBudget)}</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Total Spent</Text>
          <Text style={styles.overviewAmount}>{formatAmount(totalSpent)}</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Remaining</Text>
          <Text style={[
            styles.overviewAmount,
            { color: totalBudget - totalSpent >= 0 ? colors.success : colors.error }
          ]}>
            {formatAmount(totalBudget - totalSpent)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddingBudget(true)}
        >
          <Plus size={16} color={colors.background} />
          <Text style={styles.addButtonText}>Add Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {budgetItems.map((item, index) => (
          <BudgetCard key={index} item={item} />
        ))}
      </ScrollView>

      <Modal
        visible={isAddingBudget}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddingBudget(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Budget Category</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="e.g., Groceries"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monthly Budget</Text>
              <TextInput
                style={styles.input}
                value={newAmount}
                onChangeText={setNewAmount}
                placeholder="5000"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setIsAddingBudget(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={addBudgetItem}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Add Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}