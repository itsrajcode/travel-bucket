import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ListRenderItem,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the destination type
interface Destination {
  id: string;
  name: string;
  visited: boolean;
}

// Storage key for AsyncStorage
const DESTINATIONS_STORAGE_KEY = '@travel_bucket_list_ts:destinations';

const App: React.FC = () => {
  // State for the destination input
  const [destinationInput, setDestinationInput] = useState<string>('');
  
  // State for the list of destinations
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  // State for loading indicator
  const [loading, setLoading] = useState<boolean>(true);

  // Load destinations from AsyncStorage when the app starts
  useEffect(() => {
    loadDestinations();
  }, []);

  // Save destinations to AsyncStorage whenever destinations state changes
  useEffect(() => {
    if (!loading) {
      saveDestinations();
    }
  }, [destinations, loading]);

  // Load destinations from AsyncStorage
  const loadDestinations = async (): Promise<void> => {
    try {
      const storedDestinations = await AsyncStorage.getItem(DESTINATIONS_STORAGE_KEY);
      if (storedDestinations !== null) {
        setDestinations(JSON.parse(storedDestinations));
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
      Alert.alert('Error', 'Failed to load your destinations');
    } finally {
      setLoading(false);
    }
  };

  // Save destinations to AsyncStorage
  const saveDestinations = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(destinations));
    } catch (error) {
      console.error('Error saving destinations:', error);
      Alert.alert('Error', 'Failed to save your destinations');
    }
  };

  // Generate a unique ID for each destination
  const generateId = (): string => {
    return Math.floor(Math.random() * 10000).toString();
  };

  // Add a new destination to the list
  const addDestination = (): void => {
    if (destinationInput.trim() === '') {
      Alert.alert('Error', 'Please enter a destination name');
      return;
    }
    
    const newDestination: Destination = {
      id: generateId(),
      name: destinationInput.trim(),
      visited: false,
    };
    
    setDestinations([...destinations, newDestination]);
    setDestinationInput(''); // Clear the input field
  };

  // Toggle the visited status of a destination
  const toggleVisited = (id: string): void => {
    const updatedDestinations = destinations.map(destination => 
      destination.id === id 
        ? { ...destination, visited: !destination.visited } 
        : destination
    );
    
    setDestinations(updatedDestinations);
  };

  // Delete a destination
  const deleteDestination = (id: string): void => {
    const updatedDestinations = destinations.filter(
      destination => destination.id !== id
    );
    
    setDestinations(updatedDestinations);
  };

  
  const renderDestination: ListRenderItem<Destination> = ({ item }) => {
    return (
      <View style={styles.destinationItem}>
        <View style={styles.destinationInfo}>
          <Text style={styles.destinationName}>{item.name}</Text>
          <Text style={[
            styles.statusText, 
            item.visited ? styles.visitedText : styles.notVisitedText
          ]}>
            {item.visited ? 'Visited' : 'Not Visited'}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.toggleButton]} 
            onPress={() => toggleVisited(item.id)}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>
              {item.visited ? 'Mark Unvisited' : 'Mark Visited'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={() => deleteDestination(item.id)}
          >
            <Text style={[styles.buttonText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: '#6366F1', fontWeight: '500' }}>
          Loading your destinations...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Travel Bucket List</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Where to next?"
          placeholderTextColor="#94A3B8"
          value={destinationInput}
          onChangeText={setDestinationInput}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addDestination}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={destinations}
        renderItem={renderDestination}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={styles.emptyListText}>
              Your adventure list is empty! Add your dream destinations above to start planning your next journey.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// App styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingTop: 16,
  },
  destinationItem: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  destinationInfo: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  visitedText: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  notVisitedText: {
    backgroundColor: '#FEF3C7', 
    color: '#D97706',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  toggleButton: {
    backgroundColor: '#6366F1',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 80,
    color: '#94A3B8',
    fontSize: 16,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});

export default App;