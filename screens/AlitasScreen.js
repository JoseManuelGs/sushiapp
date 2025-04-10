import React from 'react';
import { Text, View, FlatList, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ImageBackground } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const numColumns = Math.floor(screenWidth / 150);

const wingsItems = [
  { 
    id: '1', 
    name: 'Wings Naturales', 
    price: 100, 
    type: 'Alitas',
    subtype: 'completa',
    image: require('./adobadas.jpg')
  },
  { 
    id: '2', 
    name: 'Wings BBQ', 
    price: 105, 
    type: 'Alitas',
    subtype: 'completa',
    image: require('./alitas.jpeg')
  },
  { 
    id: '3', 
    name: 'Wings Búfalo', 
    price: 105, 
    type: 'Alitas',
    subtype: 'completa',
    image: require('./Bufalo.jpg')
  },
  { 
    id: '4', 
    name: 'Wings Mango Habanero', 
    price: 110, 
    type: 'Alitas',
    subtype: 'completa',
    image: require('./alitas.jpeg')
  },
  { 
    id: '5', 
    name: 'Media orden natural', 
    price: 70, 
    type: 'Alitas',
    subtype: 'media',
    image: require('./alitas.jpeg')
  },
  { 
    id: '6', 
    name: 'Media orden BBQ', 
    price: 75, 
    type: 'Alitas',
    subtype: 'media',
    image: require('./Bufalo.jpg')
  },
  { 
    id: '7', 
    name: 'Media orden Bufalo', 
    price: 75, 
    type: 'Alitas',
    subtype: 'media',
    image: require('./alitas.jpeg')
  },
  { 
    id: '8', 
    name: 'Media orden Mango Habanero', 
    price: 80, 
    type: 'Alitas',
    subtype: 'media',
    image: require('./alitas.jpeg')
  },

  //boneless
  { 
    id: '9', 
    name: 'Boneless Natural', 
    price: 130, 
    type: 'Boneless',
    subtype: 'completa',
    image: require('./boneless-adobados.jpg')
  },
  { 
    id: '10', 
    name: 'Boneless BBQ', 
    price: 135, 
    type: 'Boneless',
    subtype: 'completa',
    image: require('./Boneless-BBQ.jpg')
  },
  { 
    id: '11', 
    name: 'Boneless Búfalo', 
    price: 135, 
    type: 'Boneless',
    subtype: 'completa',
    image: require('./Boneless-Bufalo.jpg')
  },
  { 
    id: '12', 
    name: 'Boneless Mango Habanero', 
    price: 140, 
    type: 'Boneless',
    subtype: 'completa',
    image: require('./Boneless-Mango.jpg')
  },
  { 
    id: '13', 
    name: 'Media orden Natural', 
    price: 80, 
    type: 'Boneless',
    subtype: 'media',
    image: require('./boneless-adobados.jpg')
  },
  { 
    id: '14', 
    name: 'Media orden BBQ', 
    price: 85, 
    type: 'Boneless',
    subtype: 'media',
    image: require('./Boneless-BBQ.jpg')
  },
  { 
    id: '15', 
    name: 'Media orden Búfalo', 
    price: 85, 
    type: 'Boneless',
    subtype: 'media',
    image: require('./Boneless-Bufalo.jpg')
  },
  { 
    id: '16', 
    name: 'Media orden Mango Habanero', 
    price: 90, 
    type: 'Boneless',
    subtype: 'media',
    image: require('./Boneless-Mango.jpg')
  },
];

export default function AlitasScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const handleSelection = (item) => {
    addToCurrentOrder({
      type: item.type,
      name: item.name,
      price: item.price,
      clientId: clientId,
      details: null
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        { width: screenWidth / numColumns - 20 }
      ]}
      onPress={() => handleSelection(item)}
    >
      <ImageBackground
        source={item.image}
        style={styles.buttonBackground}
        imageStyle={styles.buttonBackgroundImage}
      >
        <View style={styles.buttonOverlay}>
          <Text style={styles.buttonText}>{item.name}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title) => (
    <Text style={[styles.sectionTitle, isDarkMode && styles.darkTitle]}>
      {title}
    </Text>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.mainTitle, isDarkMode && styles.darkTitle]}>RYU WINGS</Text>
        
        <FlatList
          data={wingsItems.filter(item => item.type === 'Alitas' && item.subtype === 'completa')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          scrollEnabled={false}
        />

        {renderSectionHeader('MEDIAS ÓRDENES')}
        <FlatList
          data={wingsItems.filter(item => item.type === 'Alitas' && item.subtype === 'media')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          scrollEnabled={false}
        />

        {renderSectionHeader('BONELESS')}
        <FlatList
          data={wingsItems.filter(item => item.type === 'Boneless' && item.subtype === 'completa')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          scrollEnabled={false}
        />

        {renderSectionHeader('MEDIAS ÓRDENES')}
        <FlatList
          data={wingsItems.filter(item => item.type === 'Boneless' && item.subtype === 'media')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#000',
    alignSelf: 'center',
  },
  darkTitle: {
    color: '#fff',
  },
  buttonContainer: {
    height: 100,
    margin: 5,
    borderRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  buttonBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBackgroundImage: {
    borderRadius: 8,
  },
  buttonOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scrollView: {
    flexGrow: 1,
  }
});