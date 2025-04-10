import React from 'react';
import { Text, View, FlatList, TouchableOpacity, Dimensions, ScrollView, StyleSheet, ImageBackground } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const numColumns = Math.floor(screenWidth / 150);

const drinksItems = [
  { 
    id: '1', 
    name: 'Coca-Cola 500ml', 
    price: 20,
    image: require('./coca.jpg') // Asegúrate de tener esta imagen en tu proyecto
  },
  { 
    id: '2', 
    name: 'Jugo del Valle 237ml', 
    price: 10,
    image: require('./vall.jpg')
  },
  { 
    id: '3', 
    name: 'Sprite 500ml (Vidrio)', 
    price: 25,
    image: require('./sprite.jpg')
  },
  { 
    id: '4', 
    name: 'Agua de Jamaica', 
    price: 15,
    image: require('./Jamaica.jpg')
  }
];

export default function BebidasScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const handleSelection = (item) => {
    addToCurrentOrder({
      type: 'Bebida',
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
      <ImageBackground
        source={item.image}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay}>
          <Text style={styles.buttonText}>{item.name}</Text>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>BEBIDAS</Text>
        <FlatList
          data={drinksItems}
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
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  backgroundImage: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    borderRadius: 10,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Este es el filtro oscuro
    padding: 15,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  priceText: {
    fontSize: 12,
    marginTop: 5,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flexGrow: 1,
  },
});