import React from 'react';
import { Text, View, FlatList, TouchableOpacity, Dimensions, ScrollView, StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const numColumns = Math.floor(screenWidth / 150);

const extrasItems = [
  { id: '1', name: 'Papas a la francesa', price: 50 },
  { id: '2', name: 'Papas de gajo', price: 60 },
  { id: '3', name: 'Palillos', price: 10 },
];

export default function ExtrasScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const handleSelection = (item) => {
    addToCurrentOrder({
      type: 'Extra',
      name: item.name,
      price: item.price,
      clientId: clientId,
      details: null
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.buttonContainer, { width: screenWidth / numColumns - 20 }]}
      onPress={() => handleSelection(item)}
    >
      <Text style={styles.buttonText}>{item.name}</Text>
      <Text style={styles.priceText}>${item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>EXTRAS</Text>
        <FlatList
          data={extrasItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  darkTitle: {
    color: '#fff',
  },
  buttonContainer: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  priceText: {
    fontSize: 12,
    marginTop: 5,
    color: '#fff',
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flexGrow: 1,
  },
});
