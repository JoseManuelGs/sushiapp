import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { SelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

const RegistroScreen = ({ navigation, route, setRegistroInfo, isDarkMode }) => {
  const [cashInBox, setCashInBox] = useState('');
  const [date, setDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [branch, setBranch] = useState('Sucursal Jardines de Cancún');
  const [schedule, setSchedule] = useState('3 PM a 10 PM');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const branchOptions = [
    { key: '1', value: 'Sucursal Jardines de Cancún' },
    { key: '2', value: 'Sucursal Santa fe' }
  ];

  const scheduleOptions = [
    { key: '1', value: '3 PM a 10 PM' },
    { key: '2', value: '7 PM a 11 PM' }
  ];

  // Cargar datos guardados al iniciar la pantalla
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('registroInfo');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setCashInBox(parsedData.cashInBox);
          setWorkerName(parsedData.workerName);
          setBranch(parsedData.direccion || 'Sucursal Jardines de Cancún');
          setSchedule(parsedData.horario || '3 PM a 10 PM');
          if (parsedData.date) {
            const parsedDate = new Date(parsedData.date);
            setDate(parsedDate);
            formatAndSetDisplayDate(parsedDate);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos guardados:', error);
      }
    };

    loadSavedData();
  }, []);

  const formatAndSetDisplayDate = (selectedDate) => {
    const formattedDate = selectedDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    setDisplayDate(formattedDate);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      formatAndSetDisplayDate(selectedDate);
    }
  };

  const renderSelectors = () => {
    if (isIOS) {
      return (
        <>
          <View style={[styles.pickerContainer, isDarkMode && styles.darkPickerContainer]}>
            <SelectList
              setSelected={setBranch}
              data={branchOptions}
              defaultOption={{ key: '1', value: branch }}
              save="value"
              search={false}
              boxStyles={[styles.selectList, isDarkMode && styles.darkSelectList]}
              dropdownStyles={[styles.dropdown, isDarkMode && styles.darkDropdown]}
              inputStyles={{ color: isDarkMode ? '#fff' : '#000' }}
              dropdownTextStyles={{ color: isDarkMode ? '#fff' : '#000' }}
            />
          </View>
          <View style={[styles.pickerContainer, isDarkMode && styles.darkPickerContainer]}>
            <SelectList
              setSelected={setSchedule}
              data={scheduleOptions}
              defaultOption={{ key: '1', value: schedule }}
              save="value"
              search={false}
              boxStyles={[styles.selectList, isDarkMode && styles.darkSelectList]}
              dropdownStyles={[styles.dropdown, isDarkMode && styles.darkDropdown]}
              inputStyles={{ color: isDarkMode ? '#fff' : '#000' }}
              dropdownTextStyles={{ color: isDarkMode ? '#fff' : '#000' }}
            />
          </View>
        </>
      );
    }

    return (
      <>
        <View style={[styles.pickerContainer, isDarkMode && styles.darkPickerContainer]}>
          <Picker
            selectedValue={branch}
            onValueChange={(itemValue) => setBranch(itemValue)}
            style={[styles.picker, { color: isDarkMode ? '#fff' : '#000' }]}
            dropdownIconColor={isDarkMode ? '#fff' : '#000'}
          >
            <Picker.Item label="Sucursal Jardines de Cancún" value="Sucursal Jardines de Cancún" />
            <Picker.Item label="Sucursal Santa fe" value="Sucursal Santa fe" />
          </Picker>
        </View>
        <View style={[styles.pickerContainer, isDarkMode && styles.darkPickerContainer]}>
          <Picker
            selectedValue={schedule}
            onValueChange={(itemValue) => setSchedule(itemValue)}
            style={[styles.picker, { color: isDarkMode ? '#fff' : '#000' }]}
            dropdownIconColor={isDarkMode ? '#fff' : '#000'}
          >
            <Picker.Item label="3 PM a 10 PM" value="3 PM a 10 PM" />
            <Picker.Item label="7 PM a 11 PM" value="7 PM a 11 PM" />
          </Picker>
        </View>
      </>
    );
  };

  const handleSubmit = async () => {
    if (!cashInBox || !displayDate || !workerName) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const registroInfo = {
      cashInBox,
      date: displayDate,
      workerName,
      direccion: branch,
      horario: schedule,
    };

    // Guardar en AsyncStorage
    try {
      await AsyncStorage.setItem('registroInfo', JSON.stringify(registroInfo));
      alert('Información guardada en el caché.');
    } catch (error) {
      console.error('Error al guardar en AsyncStorage:', error);
      alert('Error al guardar la información.');
    }

    setRegistroInfo(registroInfo);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Cambio en la caja:</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        keyboardType="numeric"
        placeholder="Ingrese el cambio"
        placeholderTextColor={isDarkMode ? '#888' : '#888'}
        value={cashInBox}
        onChangeText={setCashInBox}
      />

      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Fecha:</Text>
      <TouchableOpacity
        style={[styles.dateButton, isDarkMode && styles.darkDateButton]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.dateButtonText, isDarkMode && styles.darkDateButtonText]}>
          {displayDate || "Seleccionar fecha"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={isIOS ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Trabajador:</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Nombre del trabajador"
        placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
        value={workerName}
        onChangeText={setWorkerName}
      />

      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Sucursal:</Text>
      {renderSelectors()}

      <View style={styles.buttonContainer}>
        <Button title="Confirmar" onPress={handleSubmit} color={isDarkMode ? 'red' : '#007bff'} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    color: '#000',
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },
  darkLabel: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '80%',
    marginBottom: 10,
    color: '#000',
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: '#222',
    color: '#fff',
  },
  pickerContainer: {
    width: '80%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  darkPickerContainer: {
    borderColor: '#444',
    backgroundColor: '#222',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  selectList: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  darkSelectList: {
    borderColor: '#444',
    backgroundColor: '#222',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  darkDropdown: {
    borderColor: '#444',
    backgroundColor: '#222',
  },
  dateButton: {
    width: '80%',
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  darkDateButton: {
    backgroundColor: '#222',
    borderColor: '#444',
  },
  dateButtonText: {
    color: '#000',
    textAlign: 'center',
  },
  darkDateButtonText: {
    color: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
  },
});

export default RegistroScreen;