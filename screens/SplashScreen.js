import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const lineHeightValue = useRef(new Animated.Value(0)).current; // Altura inicial de la línea

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(lineHeightValue, {
        toValue: 1, // Altura máxima (pantalla completa)
        duration: 2000, // Duración de la animación
        useNativeDriver: false,
      }).start(() => {
        // Navegar a la pantalla principal
        navigation.replace('MainTabs');
      });
    }, 500); // Esperar 0.5 segundos antes de iniciar la animación

    return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
  }, [navigation, lineHeightValue]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.redLine,
          {
            height: lineHeightValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'], // Transición de altura
            }),
          },
        ]}
      />
      <Image source={require('./LOGO.jpg')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Fondo negro
    justifyContent: 'center',
    alignItems: 'center',
  },
  redLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF0000', // Línea roja
  },
  logo: {
    width: 150, // Tamaño inicial del logo
    height: 150,
    resizeMode: 'contain',
    position: 'absolute',
  },
});

export default SplashScreen;
