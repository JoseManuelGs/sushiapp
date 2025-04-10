import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  ImageBackground,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const screenWidth = Dimensions.get('window').width;
const numColumns = Math.floor(screenWidth / 150);

const POSTRES_STORAGE_KEY = '@postres_data';

export default function PostresScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const [postres, setPostres] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPostre, setEditingPostre] = useState(null);
  const [nombrePostre, setNombrePostre] = useState('');
  const [precioPostre, setPrecioPostre] = useState('');
  const [imagenLocal, setImagenLocal] = useState(null);

  useEffect(() => {
    loadPostres();
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a la galería');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImagenLocal(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const loadPostres = async () => {
    try {
      const savedPostres = await AsyncStorage.getItem(POSTRES_STORAGE_KEY);
      if (savedPostres) {
        setPostres(JSON.parse(savedPostres));
      }
    } catch (error) {
      console.error('Error cargando postres:', error);
      Alert.alert('Error', 'No se pudieron cargar los postres');
    }
  };

  const savePostres = async (newPostres) => {
    try {
      await AsyncStorage.setItem(POSTRES_STORAGE_KEY, JSON.stringify(newPostres));
      setPostres(newPostres);
    } catch (error) {
      console.error('Error guardando postres:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    }
  };

  const handleAddPostre = () => {
    setEditingPostre(null);
    setNombrePostre('');
    setPrecioPostre('');
    setImagenLocal(null);
    setModalVisible(true);
  };

  const handleEditPostre = (postre) => {
    setEditingPostre(postre);
    setNombrePostre(postre.name);
    setPrecioPostre(postre.price.toString());
    setImagenLocal(postre.imageLocal || null);
    setModalVisible(true);
  };

  const handleDeletePostre = (postreId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este postre?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const newPostres = postres.filter(p => p.id !== postreId);
            await savePostres(newPostres);
          }
        }
      ]
    );
  };

  const handleSavePostre = async () => {
    if (!nombrePostre || !precioPostre) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const precio = parseFloat(precioPostre);
    if (isNaN(precio)) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return;
    }

    let newPostres;
    if (editingPostre) {
      // Actualizar postre existente
      newPostres = postres.map(p => 
        p.id === editingPostre.id 
          ? {
              ...p,
              name: nombrePostre,
              price: precio,
              imageLocal: imagenLocal
            }
          : p
      );
    } else {
      // Crear nuevo postre
      const newPostre = {
        id: Date.now().toString(),
        name: nombrePostre,
        price: precio,
        type: 'Postres',
        imageLocal: imagenLocal
      };
      newPostres = [...postres, newPostre];
    }

    await savePostres(newPostres);
    setModalVisible(false);
    setEditingPostre(null);
    setNombrePostre('');
    setPrecioPostre('');
    setImagenLocal(null);
  };

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
      onLongPress={() => handleEditPostre(item)}
    >
      <ImageBackground
        source={item.imageLocal ? { uri: item.imageLocal } : require('./postres.jpg')}
        style={styles.buttonBackground}
        imageStyle={styles.buttonBackgroundImage}
      >
        <View style={styles.buttonOverlay}>
          <Text style={styles.buttonText}>{item.name}</Text>
          <Text style={styles.priceText}>${item.price}</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeletePostre(item.id)}
          >
            <Icon name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.mainTitle, isDarkMode && styles.darkTitle]}>POSTRES</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPostre}
          >
            <Icon name="add-circle" size={30} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={postres}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          scrollEnabled={false}
        />

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                {editingPostre ? 'Editar Postre' : 'Nuevo Postre'}
              </Text>
              
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Nombre del postre"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={nombrePostre}
                onChangeText={setNombrePostre}
              />
              
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Precio"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                keyboardType="numeric"
                value={precioPostre}
                onChangeText={setPrecioPostre}
              />

              <TouchableOpacity
                style={[styles.imagePickerButton, isDarkMode && styles.darkImagePickerButton]}
                onPress={pickImage}
              >
                <Icon 
                  name={imagenLocal ? "image" : "image-outline"} 
                  size={24} 
                  color={isDarkMode ? '#fff' : '#000'} 
                />
                <Text style={[styles.imagePickerText, isDarkMode && styles.darkText]}>
                  {imagenLocal ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </Text>
              </TouchableOpacity>

              {imagenLocal && (
                <ImageBackground
                  source={{ uri: imagenLocal }}
                  style={styles.imagePreview}
                  imageStyle={styles.imagePreviewStyle}
                >
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImagenLocal(null)}
                  >
                    <Icon name="close-circle" size={24} color="white" />
                  </TouchableOpacity>
                </ImageBackground>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSavePostre}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  darkTitle: {
    color: '#fff',
  },
  buttonContainer: {
    height: 120,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scrollView: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  darkInput: {
    backgroundColor: '#444',
    borderColor: '#666',
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.45,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  addButton: {
    padding: 5,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  darkImagePickerButton: {
    borderColor: '#666',
  },
  imagePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreviewStyle: {
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 2,
  },
});