import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePDFContent, generateTicketHTML, exportToPDF, printTicket, exportToImage } from './pdfGenerator';
import CalculatorModal from './CalculatorModal';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Asegúrate de tener instalado expo-vector-icons
// Firebase imports
import { getFirestore, collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from './firebaseConfig'; // Assuming you have your Firebase config in firebaseConfig.js

const HISTORY_STORAGE_KEY = '@ryu_sushi_history';


const HistorialScreen = ({ 
  history = [], 
  isDarkMode, 
  onUpdateHistory, 
  registro = {}, 
  expenses = [], 
  navigation 
}) => {
  // Estados
  const [modalVisible, setModalVisible] = useState(false);
  const [imageProcessingModalVisible, setImageProcessingModalVisible] = useState(false);
  const [imageProcessingComponent, setImageProcessingComponent] = useState(null);
  const [calculatorModalVisible, setCalculatorModalVisible] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState('');
  const [calculatorHistory, setCalculatorHistory] = useState([]);

    // Get a reference to Firestore
    const db = getFirestore(app);

    // Replace with actual user ID when authentication is implemented
    const fixedUserId = 'fixedUserId'; 
  
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Try to load from Firestore first
        const userDocRef = doc(collection(db, 'history'), fixedUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          console.log('Loaded history from Firestore');
          onUpdateHistory(userDocSnap.data().orders || []);
          return; // Stop here if Firestore data is found
        }

        console.log('No history found in Firestore, loading from AsyncStorage');
      } catch (error) {
        console.error('Error loading from Firestore:', error);
        console.log('Falling back to AsyncStorage');
      }

      // Fallback: Load from AsyncStorage
      try {
        const cachedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (cachedHistory && (!history || history.length === 0)) {
          onUpdateHistory(JSON.parse(cachedHistory));
        }
      } catch (error) {
        console.error('Error loading cached history:', error);
      }
    };
    loadHistory();
  }, [db, fixedUserId]);

    
  
  useEffect(() => {
    const saveHistory = async () => {
        if (history?.length > 0) {
          try {
            // Save to AsyncStorage
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

            // Save to Firestore
            const userDocRef = doc(collection(db, 'history'), fixedUserId);
            await setDoc(userDocRef, { orders: history });

            console.log('History saved to AsyncStorage and Firestore');
          } catch (error) {
            console.error('Error saving history:', error);
          }
        }
      };

      saveHistory();;
  }, [db, fixedUserId, history]);


  // Funciones de manejo del historial
  const handleResetHistory = useCallback(() => {
    Alert.alert(
      'Confirmar Reinicio',
      '¿Estás seguro que deseas reiniciar todo el historial? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: async () => {
            try {
              // Generate the current date in YYYY-MM-DD format
              const today = new Date();
              const formattedDate = today.toISOString().split('T')[0];

              // Create a new collection for today's history
              const newHistoryCollectionRef = doc(collection(db, 'dailyHistory'), `${fixedUserId}_${formattedDate}`);
              
              // Save the current history to the new collection
              const currentHistoryDocRef = doc(collection(db, 'history'), fixedUserId);
              const currentHistorySnap = await getDoc(currentHistoryDocRef);

              if (currentHistorySnap.exists()) {
                await setDoc(newHistoryCollectionRef, currentHistorySnap.data());
              }
              // Clear the current history
              await setDoc(currentHistoryDocRef, {orders: []});
              await AsyncStorage.setItem(HISTORY_STORAGE_KEY,JSON.stringify([]));
              await AsyncStorage.removeItem('@ryu_sushi_clients');
              onUpdateHistory([]);
            } catch (error) {
              console.error('Error resetting history:', error);
              Alert.alert('Error', 'No se pudo reiniciar el historial');
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, [db, fixedUserId, onUpdateHistory]);

  const handleDeleteOrder = useCallback(async (clientId) => {
    const shouldDelete = Platform.OS === 'web'
      ? window.confirm('¿Estás seguro que deseas eliminar este pedido?')
      : await new Promise((resolve) => {
        Alert.alert(
          'Confirmar Eliminación',
          '¿Estás seguro que deseas eliminar este pedido?',
          [
            { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Eliminar', onPress: () => resolve(true), style: 'destructive' },
          ],
          { cancelable: true }
        );
      });

    if (shouldDelete) {
      try {
        const updatedHistory = history.filter((item) => String(item.clientId) !== String(clientId));
        onUpdateHistory(updatedHistory);

        if (Platform.OS === 'web') {
          alert('El pedido ha sido eliminado correctamente');
        } else {
          Alert.alert('Éxito', 'El pedido ha sido eliminado correctamente', [{ text: 'OK' }]);
        }
      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        Alert.alert('Error', 'No se pudo eliminar el pedido', [{ text: 'OK' }]);
      }
    }
  }, [history, onUpdateHistory]);

  // Funciones de cálculo
  const calculateOrderTotals = useCallback((orderItems) => {
    return orderItems.reduce((acc, item) => {
      const price = parseFloat(item.price) || 0;
      acc.total += price;

      if (item.type === 'Sushi') acc.sushi += price;
      else if (item.type === 'Alitas') {
        acc.wings += price;
        if (item.name.toLowerCase().includes('media')) acc.halfOrdersWings++;
      }
      else if (item.type === 'Bebida') acc.drinks += price;
      else if (item.type === 'Papas') acc.fries += price;
      else if (item.type === 'Boneless') {
        acc.boneless += price;
        if (item.name.toLowerCase().includes('media')) acc.halfOrdersBoneless++;
      }

      return acc;
    }, {
      total: 0,
      sushi: 0,
      wings: 0,
      drinks: 0,
      fries: 0,
      boneless: 0,
      halfOrdersWings: 0,
      halfOrdersBoneless: 0
    });
  }, []);

  const calculateProductTotals = useCallback((history) => {
    return history.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = { quantity: 0, total: 0 };
      }
      acc[item.type].quantity += 1;
      acc[item.type].total += parseFloat(item.price) || 0;
      return acc;
    }, {});
  }, []);

  // Funciones de exportación
  const exportTicketToPDF = useCallback(async (orderData) => {
    const html = generateTicketHTML(orderData, registro);
    const fileName = `ticket_cliente${orderData.clientNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    await exportToPDF(html, fileName);
  }, [registro]);

  const handleExportToPDF = useCallback(async () => {
    try {
      const htmlContent = generatePDFContent(history, expenses, registro);
      const fileName = `reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`;
      await exportToPDF(htmlContent, fileName);
      Alert.alert('Éxito', 'El PDF se ha generado correctamente', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF. Por favor, intente nuevamente.', [{ text: 'OK' }]);
    }
  }, [history, expenses, registro]);

  const handleExportToImage = useCallback(async () => {
    try {
      Alert.alert('Procesando', 'Generando imagen del reporte...', [{ text: 'OK' }]);

      const htmlContent = generatePDFContent(history, expenses, registro);
      const fileName = `reporte_ventas_${new Date().toISOString().split('T')[0]}`;

      const ImageRendererComponent = await exportToImage(htmlContent, fileName);

      if (ImageRendererComponent) {
        setImageProcessingComponent(<ImageRendererComponent />);
        setImageProcessingModalVisible(true);
      }
    } catch (error) {
      console.error('Error al exportar imagen:', error);
      setImageProcessingModalVisible(false);
      Alert.alert('Error', 'No se pudo generar la imagen. Por favor, intente nuevamente.', [{ text: 'OK' }]);
    }
  }, [history, expenses, registro]);

  // Memoización de datos
  const ordersWithClientNumbers = useMemo(() => {
    const clientGroups = history.reduce((groups, item) => {
      const stringClientId = String(item.clientId);
      if (!groups[stringClientId]) {
        groups[stringClientId] = [];
      }
      groups[stringClientId].push(item);
      return groups;
    }, {});

    return Object.entries(clientGroups).reduce((orders, [clientId, items]) => {
      const clientName = typeof items[0].clientName === 'object'
        ? items[0].clientName?.name || `Cliente ${Object.keys(orders).length + 1}`
        : String(items[0].clientName || `Cliente ${Object.keys(orders).length + 1}`);

      orders[clientId] = {
        items,
        clientNumber: clientName,
        time: items[0].time,
        clientId: String(clientId),
      };
      return orders;
    }, {});
  }, [history]);

  const totalGeneral = useMemo(() => (
    history.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
  ), [history]);

  const productTotals = useMemo(() => calculateProductTotals(history), [history, calculateProductTotals]);

  // Componentes renderizados
  const renderOrderItem = useCallback(({ item }) => (
    <View style={[styles.historyItem, { 
      backgroundColor: isDarkMode ? '#333' : '#f9f9f9', 
      borderColor: isDarkMode ? '#555' : '#ddd' 
    }]}>
      <Text style={[styles.historyText, { color: isDarkMode ? '#fff' : '#000' }]}>
        <Text style={styles.boldText}>{item.type}:</Text> {item.name}
      </Text>
      <Text style={[styles.historyText, { color: isDarkMode ? '#fff' : '#000' }]}>
        <Text style={styles.boldText}>Hora:</Text> {item.time}
      </Text>
      <Text style={[styles.historyText, { color: isDarkMode ? '#fff' : '#000' }]}>
        <Text style={styles.boldText}>Precio:</Text> ${item.price}
      </Text>
    </View>
  ), [isDarkMode]);

  const renderClientOrder = useCallback(({ item: clientId }) => {
    const orderData = ordersWithClientNumbers[clientId];
    if (!orderData) return null;
    const orderTotals = calculateOrderTotals(orderData.items);

    return (
      <View style={styles.clientContainer}>
        <View style={[styles.clientHeader, { 
          backgroundColor: isDarkMode ? '#444' : '#eee', 
          borderColor: isDarkMode ? '#555' : '#ddd' 
        }]}>
          <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
            Cliente {String(orderData.clientNumber)}
          </Text>
          <Text style={[styles.orderTotal, { color: isDarkMode ? '#fff' : '#000' }]}>
            Total: ${orderTotals.total}
          </Text>
        </View>

        <FlatList
          data={orderData.items}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => `${clientId}-${index}`}
          scrollEnabled={false}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => printTicket(generateTicketHTML(orderData, registro))}
          >
            <Text style={styles.buttonText}>Imprimir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => exportTicketToPDF(orderData)}
          >
            <Text style={styles.buttonText}>Descargar PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF5252' }]}
            onPress={() => handleDeleteOrder(clientId)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [ordersWithClientNumbers, calculateOrderTotals, renderOrderItem, isDarkMode, registro, exportTicketToPDF, handleDeleteOrder]);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>HISTORIAL</Text>

        {history.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : '#999' }]}>
            No hay registros en el historial.
          </Text>
        ) : (
          <FlatList
            data={Object.keys(ordersWithClientNumbers)}
            renderItem={renderClientOrder}
            keyExtractor={(clientId) => String(clientId)}
            contentContainerStyle={styles.list}
          />
        )}

        <View style={styles.totalContainer}>
          <Text style={[styles.totalText, { color: isDarkMode ? '#fff' : '#000' }]}>
            <Text style={styles.boldText}>Total general:</Text> ${totalGeneral}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          {/* Botón de Inventario (NUEVO) */}
          <TouchableOpacity
            style={[styles.inventoryButton, { backgroundColor: '#9C27B0' }]}
            onPress={() => navigation.navigate('Inventario')}
          >
            <MaterialCommunityIcons name="archive" size={20} color="#fff" />
            <Text style={styles.inventoryButtonText}> Inventario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: '#2196F3' }]}
            onPress={handleExportToPDF}
          >
            <Text style={styles.exportButtonText}>Exportar a PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: '#FF9800' }]}
            onPress={handleExportToImage}
          >
            <Text style={styles.exportButtonText}>Descargar como Imagen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.detailsButton, { backgroundColor: 'red' }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.detailsButtonText}>Ver más detalles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.calculatorButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => setCalculatorModalVisible(true)}
          >
            <Text style={styles.calculatorButtonText}>Calculadora de Ventas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: '#FF5252' }]}
            onPress={handleResetHistory}
          >
            <Text style={styles.resetButtonText}>Reiniciar Historial</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de detalles */}
        <Modal
          animationType="fade"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Detalles de Ventas</Text>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { color: isDarkMode ? '#fff' : '#000' }]}>Producto</Text>
                <Text style={[styles.tableHeaderText, { color: isDarkMode ? '#fff' : '#000' }]}>Cantidad</Text>
                <Text style={[styles.tableHeaderText, { color: isDarkMode ? '#fff' : '#000' }]}>Total</Text>
              </View>

              {Object.entries(productTotals).map(([product, { quantity, total }]) => (
                <View key={product} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { color: isDarkMode ? '#fff' : '#000' }]}>{product}</Text>
                  <Text style={[styles.tableCell, { color: isDarkMode ? '#fff' : '#000' }]}>{quantity}</Text>
                  <Text style={[styles.tableCell, { color: isDarkMode ? '#fff' : '#000' }]}>${total.toFixed(2)}</Text>
                </View>
              ))}

              <View style={[styles.tableRow, { 
                borderTopWidth: 1, 
                borderTopColor: isDarkMode ? '#555' : '#ccc', 
                paddingTop: 10 
              }]}>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>TOTAL</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>
                  {history.length}
                </Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>
                  ${totalGeneral.toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'red' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal para la calculadora */}
        <CalculatorModal
          isDarkMode={isDarkMode}
          visible={calculatorModalVisible}
          onClose={() => setCalculatorModalVisible(false)}
          calculatorInput={calculatorInput}
          setCalculatorInput={setCalculatorInput}
          calculatorHistory={calculatorHistory}
          setCalculatorHistory={setCalculatorHistory}
          history={history}
          expenses={expenses}
          registro={registro}
        />

        {/* Modal para procesar la imagen */}
        <Modal
          animationType="fade"
          transparent
          visible={imageProcessingModalVisible}
          onRequestClose={() => {
            setImageProcessingModalVisible(false);
            setImageProcessingComponent(null);
          }}
        >
          <View style={styles.processingModalContainer}>
            {imageProcessingComponent}
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollView: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 10,
  },
  clientContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000',
  },
  clientHeader: {
    padding: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  historyText: {
    fontSize: 14,
    marginVertical: 2,
  },
  boldText: {
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    marginTop: 20,
  },
  // Estilo nuevo para el botón de Inventario
  inventoryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  inventoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportButton: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsButton: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calculatorButton: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  calculatorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  tableContainer: {
    width: '90%',
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableCell: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processingModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HistorialScreen;