import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Keyboard, Alert, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar imágenes locales
import tenedoresImage from './tenedor.png';
import vasitosImage from './vaso.png';
import charolasPlanasImage from './charolalisa.png';
import charolas3DivisionesImage from './charola3.png';
import guantesImage from './guante.jpg';
import bolsasMakiImage from './Bolsamaki.png';
import cheetosImage from './Cheetos.png';
import bolsasCamisetaImage from './camiseta.png';
import palillosChinosImage from './palillos.png';
import harinaImage from './harina.png';

const initialInventoryItems = [
  { id: 1, name: 'Tenedores', image: tenedoresImage, status: 'estable', packages: 1 },
  { id: 2, name: 'Vasitos', image: vasitosImage, status: 'poco', packages: 0.5 },
  { id: 3, name: 'Charolas planas', image: charolasPlanasImage, status: 'agotado', exactQuantity: 0 },
  { id: 4, name: 'Charolas de 3 divisiones', image: charolas3DivisionesImage, status: 'mucho', exactQuantity: 10 },
  { id: 5, name: 'Guantes', image: guantesImage, status: 'estable', packages: 1 },
  { id: 6, name: 'Bolsas maki', image: bolsasMakiImage, status: 'poco', packages: 0.3 },
  { id: 7, name: 'Cheetos Flamin Hot', image: cheetosImage, status: 'mucho', exactQuantity: 15 },
  { id: 8, name: 'Bolsas camiseta', image: bolsasCamisetaImage, status: 'estable', packages: 2 },
  { id: 9, name: 'Palillos chinos', image: palillosChinosImage, status: 'poco', packages: 0.5 },
  { id: 10, name: 'Harina', image: harinaImage, status: 'mucho', exactQuantity: 8 }
];

const STATUS_CONFIG = {
  mucho: { color: 'green', minValue: 2 },
  estable: { color: 'blue', exactValue: 1 },
  poco: { color: 'orange', maxValue: 0.99 },
  agotado: { color: 'red', exactValue: 0 }
};

const InventarioScreen = ({ isDarkMode }) => {
  const [items, setItems] = useState(initialInventoryItems);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [packageInput, setPackageInput] = useState('');
  const [exactInput, setExactInput] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('inventoryItems');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          console.log('Se cargaron', parsed.length, 'elementos');
          // Reasignar las imágenes después de cargar desde AsyncStorage
          const itemsWithImages = parsed.map(item => {
            const originalItem = initialInventoryItems.find(i => i.id === item.id);
            return { ...item, image: originalItem?.image };
          });
          setItems(itemsWithImages);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('inventoryItems', JSON.stringify(items));
      } catch (error) {
        console.error('Error al guardar datos:', error);
      }
    };
    saveData();
  }, [items]);

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.exactQuantity !== undefined) {
        setExactInput(selectedItem.exactQuantity.toString());
      } else {
        setPackageInput(selectedItem.packages?.toString() || '');
      }
    }
  }, [selectedItem]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        #inventory-list-container::-webkit-scrollbar {
          width: 8px !important;
        }
        #inventory-list-container::-webkit-scrollbar-thumb {
          background-color: ${isDarkMode ? '#555' : '#ccc'} !important;
          border-radius: 4px !important;
        }
        #inventory-list-container::-webkit-scrollbar-track {
          background-color: ${isDarkMode ? '#222' : '#f1f1f1'} !important;
        }
      `;
      document.head.appendChild(styleSheet);
      
      return () => {
        document.head.removeChild(styleSheet);
      };
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (Platform.OS === 'web' && flatListRef.current) {
      const nodeElement = flatListRef.current.getScrollableNode();
      if (nodeElement) {
        nodeElement.id = 'inventory-list-container';
      }
    }
  }, []);

  const themeStyles = useMemo(() => ({
    container: { 
      backgroundColor: isDarkMode ? '#121212' : '#fff',
     },
    text: { 
      color: isDarkMode ? '#fff' : '#000',
    },
    itemContainer: {
      backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9',
      borderColor: isDarkMode ? '#333' : '#ddd'
    },
    modalContent: { 
      backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
      borderColor: isDarkMode ? '#333' : '#ddd'
    },
    input: {
      color: isDarkMode ? '#fff' : '#000',
       borderColor: isDarkMode ? '#555' : '#ddd',
      backgroundColor: isDarkMode ? '#333' : '#fff'
    },
    button: {
      backgroundColor: isDarkMode ? '#333' : '#ddd',
      borderColor: isDarkMode ? '#555' : '#ccc',
    }
  }), [isDarkMode]);

  const handleStatusChange = (itemId, newStatus) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              status: newStatus,
              packages: item.exactQuantity === undefined ? null : item.packages
            }
          : item
      )
    );
  };

  const handlePackageChange = (text) => {
    const validText = text.replace(/[^0-9.]/g, '');
    const parts = validText.split('.');
    if (parts.length <= 2) setPackageInput(validText);
  };

  const handleExactChange = (text) => {
    setExactInput(text.replace(/[^0-9]/g, ''));
  };

  const saveChanges = () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.exactQuantity !== undefined) {
        const quantity = exactInput === '' ? 0 : parseInt(exactInput, 10);
        const newStatus = quantity === 0 ? 'agotado' :
                         quantity <= 5 ? 'poco' : 'mucho';

        setItems(prevItems =>
          prevItems.map(item =>
            item.id === selectedItem.id
              ? { ...item, exactQuantity: quantity, status: newStatus }
              : item
          )
        );
      } else {
        const packages = packageInput === '' ? 0 : parseFloat(packageInput);
        let newStatus = 'agotado';

        if (packages > 0 && packages < 0.5) newStatus = 'poco';
        else if (packages >= 0.5 && packages < 1) newStatus = 'poco';
        else if (packages === 1) newStatus = 'estable';
        else if (packages > 1) newStatus = 'mucho';

        setItems(prevItems =>
          prevItems.map(item =>
            item.id === selectedItem.id
              ? { ...item, packages, status: newStatus }
              : item
          )
        );
      }

      Keyboard.dismiss();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Ingrese un valor válido');
    }
  };

  const quickStatusUpdate = (itemId, status) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id !== itemId) return item;

        if (item.exactQuantity !== undefined) {
          let newQuantity = item.exactQuantity;
          if (status === 'agotado') newQuantity = 0;
          else if (status === 'poco') newQuantity = Math.min(5, newQuantity);
          else if (status === 'estable') newQuantity = 1;
          else if (status === 'mucho') newQuantity = Math.max(2, newQuantity);

          return { ...item, status, exactQuantity: newQuantity };
        } else {
          let newPackages = 0;
          if (status === 'poco') newPackages = 0.3;
          else if (status === 'estable') newPackages = 1;
          else if (status === 'mucho') newPackages = 2;

          return { ...item, status, packages: newPackages };
        }
      })
    );
  };

  const renderPackageText = (packages) => {
    if (packages === 0) return 'No hay paquete';
    if (packages > 0 && packages < 0.5) return 'Menos de medio paquete';
    if (packages === 0.5) return 'Medio paquete';
    if (packages > 0.5 && packages < 1) return 'Más de medio paquete';
    if (packages === 1) return '1 paquete completo';
    return `${packages} paquetes`;
  };

  const renderItem = ({ item }) => {
    const statusColor = STATUS_CONFIG[item.status]?.color || 'gray';
    const borderColor = statusColor === 'gray' ?
      themeStyles.itemContainer.borderColor : statusColor;
  
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          themeStyles.itemContainer,
          { borderColor }
        ]}
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}
        onLongPress={() => {
          Alert.alert(
            'Cambio rápido',
            `Estado para ${item.name}:`,
            Object.keys(STATUS_CONFIG).map(status => ({
              text: status.toUpperCase(),
              onPress: () => quickStatusUpdate(item.id, status)
            }))
          );
        }}
      >
        <Image 
          source={item.image} 
          style={styles.itemImage}
          resizeMode="contain"
        />
        <Text style={[styles.itemText, themeStyles.text]}>
          {item.name}
        </Text>

        {item.exactQuantity !== undefined ? (
          <Text style={[styles.quantityText, { color: statusColor }]}>
            {item.exactQuantity} unidades
          </Text>
        ) : (
          <Text style={[styles.quantityText, { color: statusColor }]}>
            {renderPackageText(item.packages)}
          </Text>
        )}

        <Text style={[styles.statusText, { color: statusColor }]}>
          {item.status.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  const resetInventory = async () => {
    try {
      await AsyncStorage.removeItem('inventoryItems');
      setItems(initialInventoryItems);
      Alert.alert('Reiniciado', 'Inventario restablecido');
    } catch (error) {
      console.error('Error al reiniciar inventario', error);
    }
  };

  return (
     <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.text]}>INVENTARIO</Text>

      <View style={styles.flatListWrapper}>
        <FlatList
          ref={flatListRef}
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          style={styles.flatList}
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
          indicatorStyle={isDarkMode ? 'white' : 'black'}
          scrollEventThrottle={16}
        />
      </View>
  
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: isDarkMode ? '#444' : '#555', marginHorizontal: 20 }]}
        onPress={resetInventory}
      >
        <Text style={styles.buttonText}>RESET INVENTARIO</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.text]}>
              {selectedItem?.name}
            </Text>

            {selectedItem?.exactQuantity !== undefined ? (
              <>
                <Text style={[styles.sectionTitle, themeStyles.text]}>Unidades exactas:</Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  keyboardType="numeric"
                  placeholder="Cantidad"
                  placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                  value={exactInput}
                  onChangeText={handleExactChange}
                />
              </>
            ) : (
              <>
                <Text style={[styles.sectionTitle, themeStyles.text]}>Cantidad de paquetes:</Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  keyboardType="numeric"
                  placeholder="Ej: 0.3, 0.5, 1, 2"
                  placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                  value={packageInput}
                  onChangeText={handlePackageChange}
                />
                <Text style={[styles.helpText, themeStyles.text]}>
                  {packageInput ? renderPackageText(parseFloat(packageInput)) : ''}
                </Text>
              </>
            )}

            <Text style={[styles.sectionTitle, themeStyles.text]}>Estado:</Text>
            <View style={styles.statusContainer}>
              {Object.entries(STATUS_CONFIG).map(([status, { color }]) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: selectedItem?.status === status ? color : isDarkMode ? '#333' : '#ddd',
                      borderColor: isDarkMode ? '#555' : '#ccc',
                      borderWidth: 1,
                    }
                  ]}
                  onPress={() => handleStatusChange(selectedItem?.id, status)}
                >
                  <Text style={[
                    styles.buttonText,
                    { color: selectedItem?.status === status ? '#fff' : themeStyles.text.color }
                  ]}>
                    {status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: 'green', borderColor:isDarkMode ? '#555':'#ddd', borderWidth: 1}]}
              onPress={saveChanges}
            >
              <Text style={[styles.buttonText,{color:'white'}]}>GUARDAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'red' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    overflow: 'hidden',
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  flatListWrapper: {
    
    flex: 1,
    width: '100%',
  },
  flatList: {
    width: '100%',
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  itemContainer: {
    flex: 1,
    flexBasis: '48%',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  
  itemImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  itemText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statusButton: {
    width: '48%',
    padding: 12,
    borderRadius: 6,
    marginVertical: 5,
    alignItems: 'center',
  },
  saveButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
   
    marginTop: 10,
  },
  closeButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white',
  },
});

export default InventarioScreen;