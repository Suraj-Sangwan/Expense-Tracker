import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Target, Plus, TrendingUp } from 'lucide-react-native';

interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
}

export default function GoalsScreen() {
  const { colors } = useTheme();
  const [goals] = useState<GoalItem[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 45000,
      deadline: new Date('2025-12-31'),
      category: 'Savings',
    },
    {
      id: '2',
      name: 'Vacation to Goa',
      targetAmount: 50000,
      currentAmount: 15000,
      deadline: new Date('2025-06-30'),
      category: 'Travel',
    },
    {
      id: '3',
      name: 'New Laptop',
      targetAmount: 80000,
      currentAmount: 25000,
      deadline: new Date('2025-08-15'),
      category: 'Electronics',
    },
  ]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: Date) => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const GoalCard = ({ goal }: { goal: GoalItem }) => {
    const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
    const daysRemaining = getDaysRemaining(goal.deadline);

    return (
      <TouchableOpacity style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalCategory}>{goal.category}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Target size={24} color={colors.primary} />
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.amountRow}>
            <Text style={styles.currentAmount}>{formatAmount(goal.currentAmount)}</Text>
            <Text style={styles.targetAmount}>of {formatAmount(goal.targetAmount)}</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: progress >= 100 ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
          </View>
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.deadline}>Target: {formatDate(goal.deadline)}</Text>
          <Text style={[
            styles.daysRemaining,
            { color: daysRemaining < 30 ? colors.warning : colors.textSecondary }
          ]}>
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
          </Text>
        </View>
      </TouchableOpacity>
    );
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
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    addButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    goalInfo: {
      flex: 1,
    },
    goalName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    goalCategory: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressSection: {
      marginBottom: 16,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 12,
    },
    currentAmount: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    targetAmount: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressTrack: {
      flex: 1,
      height: 12,
      backgroundColor: colors.border,
      borderRadius: 6,
      overflow: 'hidden',
      marginRight: 12,
    },
    progressFill: {
      height: '100%',
      borderRadius: 6,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      width: 50,
      textAlign: 'right',
    },
    goalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    deadline: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    daysRemaining: {
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Savings Goals</Text>
        <Text style={styles.subtitle}>Track your financial milestones</Text>
        
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={colors.background} />
          <Text style={styles.addButtonText}>Add New Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}