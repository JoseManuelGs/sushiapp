import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CalculatorButton = React.memo(({ 
  label, 
  onPress, 
  isDarkMode, 
  color, 
  textColor, 
  flex = 1 
}) => (
  <TouchableOpacity
    style={[
      styles.calcButton,
      { 
        backgroundColor: color || (isDarkMode ? '#333' : '#f0f0f0'),
        flex,
        shadowColor: isDarkMode ? '#000' : '#999',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[
      styles.calcButtonText,
      { color: textColor || (isDarkMode ? '#fff' : '#000') }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  calcButton: {
    marginHorizontal: 5,
    borderRadius: 10,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calcButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CalculatorButton;