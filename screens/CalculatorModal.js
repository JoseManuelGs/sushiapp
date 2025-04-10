import React, { useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, Clipboard } from 'react-native';
import CalculatorButton from './CalculatorButton';

const CALCULATOR_BUTTONS = [
  ['C', '⌫', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=']
];

const CalculatorModal = React.memo(({
  isDarkMode,
  visible,
  onClose,
  calculatorInput,
  setCalculatorInput,
  calculatorHistory,
  setCalculatorHistory,
  history,
  expenses,
  registro
}) => {
  const handleCalculatorButtonPress = useCallback((value) => {
    switch (value) {
      case 'C':
        setCalculatorInput('');
        setCalculatorHistory([]);
        break;
      case '⌫':
        setCalculatorInput(prev => prev.slice(0, -1) || '');
        break;
      case '=':
        try {
          const operation = calculatorInput;
          // eslint-disable-next-line no-eval
          const result = eval(operation.replace(/×/g, '*').replace(/÷/g, '/'));
          setCalculatorHistory([...calculatorHistory, operation, '=']);
          setCalculatorInput(String(result));
        } catch (error) {
          setCalculatorInput('Error');
          setTimeout(() => setCalculatorInput(''), 1000);
        }
        break;
      case '%':
        try {
          // eslint-disable-next-line no-eval
          const result = eval(calculatorInput) / 100;
          setCalculatorInput(String(result));
        } catch (error) {
          setCalculatorInput('Error');
          setTimeout(() => setCalculatorInput(''), 1000);
        }
        break;
      default:
        setCalculatorInput(prev => prev + value);
    }
  }, [calculatorInput, calculatorHistory]);

  const handleAutoCalculation = useCallback(() => {
    const totalVentas = history.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const totalEgresos = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const efectivoCaja = parseFloat(registro?.cash) || 0;
    const resultado = efectivoCaja + totalVentas - totalEgresos;
    
    setCalculatorInput(resultado.toString());
    setCalculatorHistory([
      `Caja:$${efectivoCaja.toFixed(2)}`, 
      `+Ventas:$${totalVentas.toFixed(2)}`, 
      `-Egresos:$${totalEgresos.toFixed(2)}`, 
      '='
    ]);
  }, [history, expenses, registro]);

  const handleCopyResult = useCallback(() => {
    if (calculatorInput && calculatorInput !== 'Error') {
      Clipboard.setString(calculatorInput);
      Alert.alert('Copiado', 'El resultado ha sido copiado al portapapeles');
    }
  }, [calculatorInput]);

  const getButtonColor = (button) => {
    if (button === '=') return '#4CAF50';
    if (['÷', '×', '-', '+', '%'].includes(button)) return '#ff9800';
    if (button === 'C') return '#ff5252';
    return isDarkMode ? '#444' : '#e0e0e0';
  };

  const getButtonTextColor = (button) => {
    return ['=', '÷', '×', '-', '+', 'C', '%'].includes(button) 
      ? '#fff' 
      : isDarkMode ? '#fff' : '#000';
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.calculatorModalContainer, { 
        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' 
      }]}>
        <View style={[styles.calculatorContainer, { 
          backgroundColor: isDarkMode ? '#2c2c2c' : '#f5f5f5',
          shadowColor: isDarkMode ? '#fff' : '#000',
        }]}>
          <View style={styles.calculatorHeader}>
            <Text style={[styles.calculatorTitle, { 
              color: isDarkMode ? '#fff' : '#333' 
            }]}>Calculadora de Ventas</Text>
            
            <TouchableOpacity onPress={onClose} style={styles.calculatorCloseIcon}>
              <Text style={{ fontSize: 24, color: isDarkMode ? '#fff' : '#333' }}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.calculatorScreen, { 
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            borderColor: isDarkMode ? '#444' : '#ddd'
          }]}>
            {calculatorHistory.length > 0 && (
              <Text style={[styles.calculatorHistory, { 
                color: isDarkMode ? '#aaa' : '#666' 
              }]}>
                {calculatorHistory.join(' ')}
              </Text>
            )}
            <Text 
              style={[styles.calculatorInput, { 
                color: isDarkMode ? '#fff' : '#000',
                fontSize: calculatorInput.length > 10 ? 24 : 32
              }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {calculatorInput || '0'}
            </Text>
          </View>
          
          <View style={styles.calculatorRow}>
            <CalculatorButton 
              label="Automático" 
              onPress={handleAutoCalculation}
              isDarkMode={isDarkMode}
              color="#9C27B0"
              textColor="#fff"
              flex={2}
            />
            <CalculatorButton 
              label="Copiar" 
              onPress={handleCopyResult}
              isDarkMode={isDarkMode}
              color="#607D8B"
              textColor="#fff"
            />
          </View>
          
          <View style={styles.calculatorKeyboard}>
            {CALCULATOR_BUTTONS.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.calculatorRow}>
                {row.map((button) => (
                  <CalculatorButton 
                    key={button}
                    label={button} 
                    onPress={() => handleCalculatorButtonPress(button)}
                    isDarkMode={isDarkMode}
                    color={getButtonColor(button)}
                    textColor={getButtonTextColor(button)}
                    flex={button === '0' ? 2 : 1}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = {
  calculatorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatorContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calculatorCloseIcon: {
    padding: 5,
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calculatorScreen: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'flex-end',
  },
  calculatorHistory: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 5,
    opacity: 0.7,
  },
  calculatorInput: {
    textAlign: 'right',
    fontWeight: 'bold',
  },
  calculatorKeyboard: {
    marginBottom: 15,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
};

export default CalculatorModal;