import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CalculatorScreen = ({ navigation, isDarkMode }) => {
  const [input, setInput] = useState('');

  const handleInput = (value) => {
    if (value === 'C') {
      setInput('');
    } else if (value === '=') {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(input);
        setInput(String(result));
      } catch (error) {
        setInput('Error');
      }
    } else {
      setInput(prev => prev + value);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: isDarkMode ? '#fff' : '#000' }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Calculadora</Text>
      </View>

      {/* Pantalla de la calculadora */}
      <View style={[styles.screen, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
        <Text style={[styles.screenText, { color: isDarkMode ? '#fff' : '#000' }]}>
          {input || '0'}
        </Text>
      </View>

      {/* Teclado de la calculadora */}
      <View style={styles.keyboard}>
        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.key,
              { 
                backgroundColor: 
                  key === '=' ? '#4CAF50' : 
                  key === 'C' ? '#FF5252' : 
                  isDarkMode ? '#555' : '#e0e0e0',
                width: key === '0' ? '50%' : '25%'
              }
            ]}
            onPress={() => handleInput(key)}
          >
            <Text style={[styles.keyText, { color: isDarkMode ? '#fff' : '#000' }]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  screen: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  screenText: {
    fontSize: 36,
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    padding: 20,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CalculatorScreen;