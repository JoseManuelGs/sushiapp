import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@clients_key';
const { width, height } = Dimensions.get('window');

const NumericKeyboard = ({ onKeyPress, onDelete, onSubmit, onCancel, currentValue, onBack, onSaveOrder }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <View style={styles.keyboardContainer}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{currentValue}%</Text>
      </View>
      <View style={styles.keysContainer}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.keyButton, key === '⌫' && styles.deleteButton]}
            onPress={() => {
              if (key === '⌫') {
                onDelete();
              } else {
                onKeyPress(key);
              }
            }}
          >
            <Text style={[styles.keyText, key === '⌫' && styles.deleteButtonText]}>
              {key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.discountActionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.backButton, styles.quarterButton]}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, styles.quarterButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, styles.quarterButton]}
          onPress={onSaveOrder}
        >
          <Text style={styles.buttonText}>Guardar Pedido</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.createButton, styles.quarterButton]}
          onPress={onSubmit}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ClientSelectionModal = ({
  visible,
  onClose,
  onSelectClient,
  onCreateNewClient,
  isDarkMode,
  existingClients = [],
  onNavigateToHistory,
  onSaveOrder,
  onBack,
}) => {
  const [newClientName, setNewClientName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isCreatingDiscount, setIsCreatingDiscount] = useState(false);
  const [storedClients, setStoredClients] = useState(existingClients);
  const [discountValue, setDiscountValue] = useState('');

  useEffect(() => {
    loadStoredClients();
  }, []);

  const loadStoredClients = async () => {
    try {
      const savedClients = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedClients !== null) {
        setStoredClients(JSON.parse(savedClients));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    }
  };

  const handleKeyPress = (key) => {
    if (discountValue.includes('.') && key === '.') return;
    if (discountValue.length >= 5) return;
    setDiscountValue((prev) => prev + key);
  };

  const handleDelete = () => {
    setDiscountValue((prev) => prev.slice(0, -1));
  };

  const handleSubmitDiscount = () => {
    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      Alert.alert('Error', 'Por favor ingrese un descuento válido entre 0 y 100');
      return;
    }
    setIsCreatingNew(true);
    setIsCreatingDiscount(false);
    setNewClientName(generateNextClientName());
  };

  const handleBack = () => {
    if (isCreatingDiscount) {
      setIsCreatingDiscount(false);
      setIsCreatingNew(false);
      setDiscountValue('');
      if (onBack) {
        onBack();
      }
    }
  };

  const handleSaveOrder = () => {
    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      Alert.alert('Error', 'Por favor ingrese un descuento válido entre 0 y 100');
      return;
    }

    const tempClient = {
      id: String(storedClients.length + 1),
      name: `Cliente ${storedClients.length + 1}`,
      discount: discount,
    };

    if (onSaveOrder) {
      onSaveOrder(tempClient);
    }

    setDiscountValue('');
    setIsCreatingDiscount(false);
    onClose();
  };

  const saveClients = async (clients) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients:', error);
      Alert.alert('Error', 'No se pudieron guardar los clientes');
    }
  };

  const handleResetClients = async () => {
    Alert.alert(
      'Reiniciar Clientes',
      '¿Estás seguro de que quieres eliminar todos los clientes? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setStoredClients([]);
            } catch (error) {
              console.error('Error resetting clients:', error);
              Alert.alert('Error', 'No se pudieron reiniciar los clientes');
            }
          },
        },
      ]
    );
  };

  const generateNextClientName = () => {
    const nextNumber = storedClients.length + 1;
    return `${nextNumber}`;
  };

  const handleCreateNewClient = async () => {
    if (newClientName.trim()) {
      const newClient = {
        id: String(storedClients.length + 1),
        name: newClientName.trim(),
        discount: discountValue ? parseFloat(discountValue) : 0,
      };

      const updatedClients = [...storedClients, newClient];

      try {
        await saveClients(updatedClients);
        setStoredClients(updatedClients);

        if (typeof onCreateNewClient === 'function') {
          onCreateNewClient(newClient);
        }

        setNewClientName('');
        setIsCreatingNew(false);
        setDiscountValue('');
      } catch (error) {
        console.error('Error creating new client:', error);
        Alert.alert('Error', 'No se pudo crear el cliente');
      }
    } else {
      Alert.alert('Error', 'Por favor ingresa un nombre para el cliente');
    }
  };

  const handleSelectClient = async (client) => {
    try {
      const clientToSave = {
        id: client.id,
        name: client.name,
        discount: client.discount || 0,
      };
      await AsyncStorage.setItem('@last_selected_client', JSON.stringify(clientToSave));

      if (typeof onSelectClient === 'function') {
        onSelectClient(clientToSave);
      }
    } catch (error) {
      console.error('Error selecting client:', error);
      Alert.alert('Error', 'No se pudo seleccionar el cliente');
    }
  };

  const renderClientItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.clientItem, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}
      onPress={() => handleSelectClient(item)}
    >
      <View>
        <Text style={[styles.clientName, { color: isDarkMode ? '#fff' : '#000' }]}>
          {item.name}
        </Text>
        {item.discount > 0 && (
          <Text style={styles.discountText}>
            Descuento: {item.discount}%
          </Text>
        )}
      </View>
      <Text style={[styles.clientDetails, { color: isDarkMode ? '#ccc' : '#666' }]}>
        #{item.id}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
              Seleccionar Cliente
            </Text>
            <TouchableOpacity
              style={[styles.headerButton, styles.resetButton]}
              onPress={handleResetClients}
            >
              <Text style={styles.headerButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>

          {isCreatingDiscount && (
            <Modal
              visible={isCreatingDiscount}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.discountModalContent, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
                  <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000', marginBottom: 20 }]}>
                    Ingrese Descuento
                  </Text>
                  <NumericKeyboard
                    onKeyPress={handleKeyPress}
                    onDelete={handleDelete}
                    onSubmit={handleSubmitDiscount}
                    onCancel={() => {
                      setIsCreatingDiscount(false);
                      setDiscountValue('');
                    }}
                    onBack={handleBack}
                    onSaveOrder={handleSaveOrder}
                    currentValue={discountValue}
                  />
                </View>
              </View>
            </Modal>
          )}

          {isCreatingNew ? (
            <View style={styles.newClientContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                    color: isDarkMode ? '#fff' : '#000',
                  },
                ]}
                placeholder="Nombre del nuevo cliente"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={newClientName}
                onChangeText={setNewClientName}
                editable={false}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.createButton]}
                  onPress={handleCreateNewClient}
                >
                  <Text style={styles.buttonText}>
                    Crear {discountValue ? `(${discountValue}% desc.)` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsCreatingNew(false);
                    setDiscountValue('');
                  }}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <FlatList
                data={storedClients}
                renderItem={renderClientItem}
                keyExtractor={(item) => String(item.id)}
                style={styles.clientList}
                contentContainerStyle={styles.clientListContent}
              />

              <View style={styles.bottomButtonsContainer}>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.newButton, styles.halfButton]}
                    onPress={() => {
                      setIsCreatingNew(true);
                      setNewClientName(generateNextClientName());
                    }}
                  >
                    <Text style={styles.buttonText}>Cliente Nuevo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.discountButton, styles.halfButton]}
                    onPress={() => setIsCreatingDiscount(true)}
                  >
                    <Text style={[styles.buttonText, { color: '#000' }]}>
                      Cliente con Descuento
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '100%',
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 25,
  },
  discountModalContent: {
    width: '100%',
    height: height * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 25,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
  bottomButtonsContainer: {
    gap: 10,
    marginTop: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  quarterButton: {
    flex: 0.25,
  },
  clientList: {
    flex: 1,
    marginBottom: 10,
  },
  clientListContent: {
    paddingHorizontal: 5,
  },
  clientItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  discountText: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 4,
  },
  clientDetails: {
    fontSize: 14,
  },
  newClientContainer: {
    padding: 15,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    flex: 1,
  },
  newButton: {
    backgroundColor: '#2196F3',
  },
  closeButton: {
    backgroundColor: '#757575',
  },
  discountButton: {
    backgroundColor: '#ffc107',
  },
  backButton: {
    backgroundColor: '#607D8B',
  },
  saveButton: {
    backgroundColor: '#009688',
  },
  keyboardContainer: {
    justifyContent: 'flex-start',
    padding: 10,
  },
  displayContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  displayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  keysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  keyButton: {
    width: '30%',
    aspectRatio: 1.2,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  keyText: {
    fontSize: 24,
    color: '#000',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  discountActionButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  }
});

export default ClientSelectionModal;