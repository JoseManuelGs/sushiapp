import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView, Dimensions, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const screenWidth = Dimensions.get('window').width;
const numColumns = Math.floor(screenWidth / 150);

const rollOptions = ['Empanizado', 'Natural', 'Alga fuera', 'Flamin'];

const sushiItems = [
  { id: '1', name: 'Torrelo', price: 100, image: require('./Sushi.jpg') },
  { id: '2', name: 'Vaquero', price: 100, image: require('./Sushi.jpg') },
  { id: '3', name: 'Mar y tierra', price: 100, image: require('./Sushi.jpg') },
  { id: '4', name: 'Camaron', price: 100, image: require('./Sushi.jpg') },
  { id: '5', name: 'Surimi', price: 100, image: require('./Sushi.jpg') },
  { id: '6', name: 'Costeño', price: 100, image: require('./Sushi.jpg') },
  { id: '7', name: 'Vegetariano', price: 95, image: require('./Sushi.jpg') },
  { id: '8', name: 'Gallinazo', price: 100, image: require('./Sushi.jpg') },
  { id: '9', name: 'Res', price: 100, image: require('./Sushi.jpg') },
  { id: '10', name: 'Ryu burro', price: 105, image: require('./Sushi.jpg') },
  { id: '11', name: 'Flamin', price: 105, image: require('./Sushi.jpg') },
  { id: '12', name: 'Goliat', price: 110, image: require('./Sushi.jpg') },
];

const friesItems = [
  { id: 'f1', name: 'Papas a la Francesa', price: 50, image: require('./papas.jpg') },
  { id: 'f2', name: 'Papas Gajo', price: 60, image: require('./papas-gajo.jpg') },
];

export default function SushiScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRollSelect = (rollName) => {
    setSelectedRoll(rollName);
    setModalVisible(true);
  };

  const handleOptionSelect = (option) => {
    const selectedItem = sushiItems.find((item) => item.name === selectedRoll);
    let finalPrice = selectedItem.price;
    
    if (option === 'Flamin' && selectedItem.name !== 'Flamin') {
      finalPrice += 5;
    }
    
    addToCurrentOrder({
      type: 'Sushi',
      name: `${selectedRoll} (${option})`,
      price: finalPrice,
      clientId: clientId,
      details: option
    });
    
    setModalVisible(false);
  };

  const handleFriesSelect = (item) => {
    addToCurrentOrder({
      type: 'Papas',
      name: item.name,
      price: item.price,
      clientId: clientId,
      details: '-'
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.buttonContainer, { width: screenWidth / numColumns - 20 }]}
      onPress={() => handleRollSelect(item.name)}
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

  const renderFriesItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.buttonContainer, { width: screenWidth / numColumns - 20 }]}
      onPress={() => handleFriesSelect(item)}
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

  const renderOptions = () =>
    rollOptions.map((option, index) => (
      <TouchableOpacity
        key={index}
        style={styles.optionButton}
        onPress={() => handleOptionSelect(option)}
      >
        <Text style={styles.buttonText}>{option}</Text>
      </TouchableOpacity>
    ));

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>RYU SUSHI</Text>
        
  
        <FlatList
          data={sushiItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
        />

        <Text style={[styles.sectionHeader, isDarkMode && styles.darkTitle]}>PAPAS</Text>
        <FlatList
          data={friesItems}
          renderItem={renderFriesItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
        />

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                Opciones para {selectedRoll}:
              </Text>
              <Text style={[styles.modalDescription, isDarkMode && styles.darkModalDescription]}>
                Selecciona una opción para el rollo:
              </Text>
              {renderOptions()}
              <TouchableOpacity
                style={[styles.closeButton, isDarkMode && styles.darkCloseButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#000',
    alignSelf: 'center'
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
    paddingVertical: 10
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#f7f7f7',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  darkModalContent: {
    backgroundColor: '#333'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000'
  },
  darkModalTitle: {
    color: '#fff'
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333'
  },
  darkModalDescription: {
    color: '#ddd'
  },
  optionButton: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  darkCloseButton: {
    backgroundColor: '#222'
  },
  darkButtonText: {
    color: '#fff'
  },
  scrollView: {
    flexGrow: 1
  },
});