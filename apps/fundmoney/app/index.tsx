import { useApp } from "@/context/AppContext";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { loadTestData, isLoading } = useApp();

  const handleLoadTestData = async () => {
    try {
      await loadTestData();
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FundMoney</Text>
      <Text style={styles.subtitle}>Your personal finance tracker</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3498DB" style={styles.loader} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button
            title="Load Test Data"
            onPress={handleLoadTestData}
            color="#3498DB"
          />
          <Text style={styles.hint}>
            Load test data to see transactions in the calendar view
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
  hint: {
    marginTop: 10,
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});
