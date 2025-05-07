import { useApp } from '@/context/AppContext';
import { Transaction } from '@/models';
import { calculateDailyTotals, formatCurrency, formatDate } from '@/utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { DateData, Calendar as RNCalendar } from 'react-native-calendars';
import Modal from 'react-native-modal';

/**
 * Calendar screen component
 * Displays a calendar with transaction data
 */
export default function Calendar() {
  const { transactions, categories, accounts, isLoading } = useApp();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  // Get window dimensions for responsive layout
  const windowDimensions = useWindowDimensions();
  const [isSmallScreen, setIsSmallScreen] = useState(windowDimensions.width < 600);

  // Update screen size on dimension changes
  useEffect(() => {
    setIsSmallScreen(windowDimensions.width < 600);
  }, [windowDimensions.width]);

  // Current date for initial display
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Update marked dates when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      updateMarkedDates(currentYear, currentMonth);
    }
  }, [transactions]);

  // Update selected transactions when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date).toISOString().split('T')[0];
        return transactionDate === selectedDate;
      });
      setSelectedTransactions(dateTransactions);
    }
  }, [selectedDate, transactions]);

  // Update marked dates for a specific month
  const updateMarkedDates = (year: number, month: number) => {
    console.log(`Updating marked dates for ${year}-${month}`);

    // Calculate daily totals for the month
    const dailyTotals = calculateDailyTotals(transactions, year, month);

    // Create marked dates object
    const newMarkedDates: any = {};

    // Get number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Create date string format YYYY-MM-DD
    const formatDateString = (day: number) => {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      return `${year}-${monthStr}-${dayStr}`;
    };

    // Mark each day with transactions
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(day);
      const dayData = dailyTotals[day];

      if (dayData && ((typeof dayData.expenses === 'number' && dayData.expenses > 0) || (typeof dayData.income === 'number' && dayData.income > 0))) {
        // Add dots for income and expenses
        const dots = [];

        if (typeof dayData.income === 'number' && dayData.income > 0) {
          dots.push({
            key: 'income',
            color: '#2ECC71',
            selectedDotColor: '#2ECC71'
          });
        }

        if (typeof dayData.expenses === 'number' && dayData.expenses > 0) {
          dots.push({
            key: 'expense',
            color: '#E74C3C',
            selectedDotColor: '#E74C3C'
          });
        }

        // Add to marked dates
        newMarkedDates[dateString] = {
          selected: dateString === selectedDate,
          selectedColor: '#3498DB',
          dots: dots,
          marked: true,
          income: dayData.income,
          expense: dayData.expenses
        };
      }
    }

    // Always mark the selected date
    if (selectedDate && !newMarkedDates[selectedDate]) {
      newMarkedDates[selectedDate] = {
        selected: true,
        selectedColor: '#3498DB'
      };
    }

    console.log(`Marked ${Object.keys(newMarkedDates).length} dates`);
    setMarkedDates(newMarkedDates);
  };

  // Handle month change
  const handleMonthChange = (monthData: DateData) => {
    console.log('Month changed:', monthData);
    updateMarkedDates(monthData.year, monthData.month);
  };

  // Handle day press
  const handleDayPress = (day: DateData) => {
    console.log('Day pressed:', day);
    setSelectedDate(day.dateString);
    setModalVisible(true);

    // Update marked dates to reflect the new selection
    const updatedMarkedDates = { ...markedDates };

    // Reset previous selection
    Object.keys(updatedMarkedDates).forEach(date => {
      if (updatedMarkedDates[date]?.selected) {
        updatedMarkedDates[date] = {
          ...updatedMarkedDates[date],
          selected: false
        };
      }
    });

    // Set new selection
    updatedMarkedDates[day.dateString] = {
      ...updatedMarkedDates[day.dateString],
      selected: true,
      selectedColor: '#3498DB'
    };

    setMarkedDates(updatedMarkedDates);
  };

  // Render custom day component with income/expense totals
  const renderDay = (day: any) => {
    if (!day || !day.dateString) return null;

    const isSelected = day.dateString === selectedDate;
    const dayData = markedDates[day.dateString];

    // Default container style
    const containerStyle = {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      height: 60
    };

    // If we have data for this day
    if (dayData) {
      const hasIncome = dayData.incomeText && dayData.incomeText.length > 0;
      const hasExpenses = dayData.expenseText && dayData.expenseText.length > 0;

      return (
        <TouchableOpacity
          style={[
            styles.dayContainer,
            containerStyle,
            isSelected ? styles.selectedDayContainer : null
          ]}
          onPress={() => handleDayPress(day)}
        >
          <Text style={[
            styles.dayText,
            isSelected ? styles.selectedDayText : null
          ]}>
            {day.day}
          </Text>

          {hasIncome && (
            <Text style={[
              styles.dayIncomeText,
              isSelected ? styles.selectedDayAmountText : null
            ]}>
              {dayData.incomeText}
            </Text>
          )}

          {hasExpenses && (
            <Text style={[
              styles.dayExpenseText,
              isSelected ? styles.selectedDayAmountText : null
            ]}>
              {dayData.expenseText}
            </Text>
          )}
        </TouchableOpacity>
      );
    }
    // For days without transaction data
    else {
      return (
        <TouchableOpacity
          style={[
            styles.dayContainer,
            containerStyle,
            isSelected ? styles.selectedDayContainer : null
          ]}
          onPress={() => handleDayPress(day)}
        >
          <Text style={[
            styles.dayText,
            isSelected ? styles.selectedDayText : null
          ]}>
            {day.day}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  // Render a single transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const category = categories.find(c => c.id === item.categoryId);
    const account = accounts.find(a => a.id === item.accountId);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text
            style={[
              styles.transactionAmount,
              item.type === 'income' ? styles.incomeText : styles.expenseText
            ]}
          >
            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionCategory}>
            {category ? category.name : 'Unknown Category'}
          </Text>
          <Text style={styles.transactionAccount}>
            {account ? account.name : 'Unknown Account'}
          </Text>
        </View>

        {item.notes && (
          <Text style={styles.transactionNotes}>{item.notes}</Text>
        )}
      </View>
    );
  };

  // Render transaction summary for selected date
  const renderTransactionSummary = () => {
    if (selectedTransactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[
            styles.emptyText,
            { fontSize: isSmallScreen ? 14 : 16 }
          ]}>No transactions for this date</Text>
        </View>
      );
    }

    const totalExpenses = selectedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = selectedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Format the selected date for display
    const formattedDate = formatDate(selectedDate);

    return (
      <ScrollView style={styles.summaryScrollView}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={[
              styles.summaryLabel,
              { fontSize: isSmallScreen ? 14 : 16 }
            ]}>Income:</Text>
            <Text style={[
              styles.summaryValue,
              styles.incomeText,
              { fontSize: isSmallScreen ? 14 : 16 }
            ]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[
              styles.summaryLabel,
              { fontSize: isSmallScreen ? 14 : 16 }
            ]}>Expenses:</Text>
            <Text style={[
              styles.summaryValue,
              styles.expenseText,
              { fontSize: isSmallScreen ? 14 : 16 }
            ]}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[
              styles.summaryLabel,
              { fontSize: isSmallScreen ? 14 : 16 }
            ]}>Balance:</Text>
            <Text style={[
              styles.summaryValue,
              balance >= 0 ? styles.incomeText : styles.expenseText,
              { fontSize: isSmallScreen ? 14 : 16 }
            ]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        <Text style={styles.transactionsTitle}>Transactions</Text>

        <FlatList
          data={selectedTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.transactionsList}
        />
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.calendarWrapper}>
        <RNCalendar
          current={selectedDate}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          markingType={'multi-dot'}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#3498DB',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3498DB',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#3498DB',
            selectedDotColor: '#ffffff',
            arrowColor: '#3498DB',
            monthTextColor: '#3498DB',
            indicatorColor: '#3498DB',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
          style={styles.calendar}
          dayComponent={({ date, state }) => {
            // Ensure date is defined before using it
            if (!date) return null;

            const isSelected = date.dateString === selectedDate;
            const dayData = markedDates[date.dateString];
            const hasIncome = dayData && typeof dayData.income === 'number' && dayData.income > 0;
            const hasExpenses = dayData && typeof dayData.expense === 'number' && dayData.expense > 0;

            return (
              <TouchableOpacity
                style={[
                  styles.dayContainer,
                  {
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 5,
                    backgroundColor: isSelected ? '#3498DB' : 'transparent',
                    flex: 1,
                    width: '100%',
                    aspectRatio: 1,
                    minHeight: isSmallScreen ? 60 : 80,
                    maxHeight: isSmallScreen ? 100 : 130,
                    paddingBottom: 4
                  }
                ]}
                onPress={() => date && handleDayPress(date)}
              >
                <Text style={[
                  styles.dayText,
                  {
                    color: isSelected ? 'white' : '#2d4150',
                    fontSize: isSmallScreen ? 14 : 18
                  }
                ]}>
                  {date?.day || ''}
                </Text>

                {hasIncome && (
                  <Text style={[
                    styles.dayIncomeText,
                    {
                      color: isSelected ? 'white' : '#2ECC71',
                      fontSize: isSmallScreen ? 10 : 14
                    }
                  ]}>
                    +{formatCurrency(dayData.income, 'USD', true)}
                  </Text>
                )}

                {hasExpenses && (
                  <Text style={[
                    styles.dayExpenseText,
                    {
                      color: isSelected ? 'white' : '#E74C3C',
                      fontSize: isSmallScreen ? 10 : 14
                    }
                  ]}>
                    -{formatCurrency(dayData.expense, 'USD', true)}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
      />
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={[
          styles.modalContent,
          {
            padding: isSmallScreen ? 15 : 20,
            maxHeight: isSmallScreen ? '90%' : '85%'
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { fontSize: isSmallScreen ? 18 : 22 }
            ]}>
              {formatDate(selectedDate, 'MMMM d, yyyy')}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={isSmallScreen ? 20 : 24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>
          {renderTransactionSummary()}
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  calendar: {
    marginBottom: 10,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center'
  },
  calendarWrapper: {
    width: '100%',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d'
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2
  },
  summaryScrollView: {
    width: '100%',
    paddingHorizontal: 5
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  incomeText: {
    color: '#2ECC71'
  },
  expenseText: {
    color: '#E74C3C'
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d'
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    width: '100%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  closeButton: {
    padding: 5
  },
  dayContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 2,
    margin: 0,
    flex: 1,
    minHeight: 70,
    maxHeight: 130
  },
  selectedDayContainer: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB'
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center'
  },
  selectedDayText: {
    color: 'white'
  },
  selectedDayAmountText: {
    color: 'white'
  },
  dayIncomeText: {
    fontSize: 12,
    color: '#2ECC71',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center'
  },
  dayExpenseText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
    color: '#2c3e50',
    paddingHorizontal: 5
  },
  transactionsList: {
    paddingBottom: 20
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB'
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  transactionCategory: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  transactionAccount: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  transactionNotes: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 4,
    fontStyle: 'italic'
  }
});
