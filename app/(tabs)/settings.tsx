import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Bell, Moon, Shield, Download, Trash2, CircleHelp as HelpCircle, ChevronRight, Smartphone, CreditCard, TrendingUp } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [smsAutoSync, setSmsAutoSync] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions, budgets, and goals. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: () => {
            // In real app, clear AsyncStorage
            Alert.alert('Data Cleared', 'All your data has been cleared successfully.');
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported as a CSV file and saved to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            // In real app, export to CSV
            Alert.alert('Export Complete', 'Your data has been exported successfully.');
          }
        },
      ]
    );
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    showChevron = true 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {showChevron && !rightElement && (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
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
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    itemSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    settingsItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    version: {
      textAlign: 'center',
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 32,
      marginBottom: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <ScrollView>
        <SettingsSection title="SMS & Banking">
          <SettingsItem
            icon={<Smartphone size={20} color={colors.primary} />}
            title="Auto SMS Sync"
            subtitle="Automatically read bank SMS messages"
            rightElement={
              <Switch
                value={smsAutoSync}
                onValueChange={setSmsAutoSync}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            }
            showChevron={false}
          />
          <SettingsItem
            icon={<CreditCard size={20} color={colors.primary} />}
            title="Bank Accounts"
            subtitle="Manage connected accounts"
            onPress={() => Alert.alert('Coming Soon', 'Bank account management will be available soon.')}
          />
          <SettingsItem
            icon={<TrendingUp size={20} color={colors.primary} />}
            title="Account Aggregator"
            subtitle="Connect via India's AA framework"
            onPress={() => Alert.alert('Coming Soon', 'Account Aggregator integration coming soon.')}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Bell size={20} color={colors.primary} />}
            title="Push Notifications"
            subtitle="Get alerts for new transactions"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            }
            showChevron={false}
          />
          <SettingsItem
            icon={<Bell size={20} color={colors.warning} />}
            title="Budget Alerts"
            subtitle="Notify when exceeding budget limits"
            rightElement={
              <Switch
                value={budgetAlerts}
                onValueChange={setBudgetAlerts}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            }
            showChevron={false}
          />
        </SettingsSection>

        <SettingsSection title="Privacy & Security">
          <SettingsItem
            icon={<Shield size={20} color={colors.success} />}
            title="Data Security"
            subtitle="All data is processed locally on your device"
            onPress={() => Alert.alert(
              'Data Security',
              'Your financial data is processed and stored locally on your device. No sensitive information is sent to external servers.',
              [{ text: 'OK' }]
            )}
          />
        </SettingsSection>

        <SettingsSection title="Data Management">
          <SettingsItem
            icon={<Download size={20} color={colors.primary} />}
            title="Export Data"
            subtitle="Download your data as CSV"
            onPress={handleExportData}
          />
          <SettingsItem
            icon={<Trash2 size={20} color={colors.error} />}
            title="Clear All Data"
            subtitle="Permanently delete all stored data"
            onPress={handleClearData}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsItem
            icon={<HelpCircle size={20} color={colors.primary} />}
            title="Help & FAQ"
            subtitle="Get help with using the app"
            onPress={() => Alert.alert('Help', 'FAQ and help documentation coming soon.')}
          />
        </SettingsSection>

        <Text style={styles.version}>ExpenseTracker v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}