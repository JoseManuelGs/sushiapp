import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import ThermalPrinterModule from 'react-native-thermal-printer';

const useBluetoothPrinter = () => {
  const [printerConnected, setPrinterConnected] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState([]);

  const scanForPrinters = async () => {
    try {
      const devices = await ThermalPrinterModule.searchPrinters();
      setAvailablePrinters(devices);
      return devices;
    } catch (error) {
      console.error('Error scanning for printers:', error);
      Alert.alert(
        "Error",
        "No se pudieron encontrar impresoras Bluetooth. Verifica que el Bluetooth esté activado."
      );
      return [];
    }
  };

  const connectToPrinter = async (address) => {
    try {
      await ThermalPrinterModule.connectPrinter(address);
      setPrinterConnected(true);
      return true;
    } catch (error) {
      console.error('Error connecting to printer:', error);
      Alert.alert(
        "Error",
        "No se pudo conectar a la impresora. Intenta nuevamente."
      );
      return false;
    }
  };

  const printTicket = async (orderData) => {
    if (Platform.OS === 'web') {
      const html = generateTicketHTML(orderData);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    if (!printerConnected) {
      const devices = await scanForPrinters();
      if (devices.length > 0) {
        const connected = await connectToPrinter(devices[0].address);
        if (!connected) return;
      } else {
        return;
      }
    }

    try {
      const printCommands = [
        { appendAlignment: 'center' },
        { appendFontSize: 2 },
        { append: 'RYU SUSHI\n\n' },
        { appendFontSize: 1 },
        { append: 'Tel: 6181268154\n' },
        { append: `Fecha: ${new Date().toLocaleString()}\n` },
        { append: `Cliente: ${orderData.clientNumber}\n\n` },
        { append: '--------------------------------\n' },
        
        // Items del pedido
        ...orderData.items.flatMap(item => [
          { appendAlignment: 'left' },
          { append: `${item.name} ${item.option || ''}\n` },
          { appendAlignment: 'right' },
          { append: `${item.isPromotional ? 'PROMO 3x2' : `$${item.price}`}\n\n` }
        ]),

        { append: '--------------------------------\n' },

        // Totales
        { appendAlignment: 'right' }
      ];

      // Calcular totales
      const orderTotals = calculateOrderTotals(orderData.items);
      const discountItems = orderData.items.filter(item => item.isPromotional);
      const discountTotal = discountItems.reduce((sum, item) => sum + (item.originalPrice || 0), 0);

      printCommands.push(
        { append: `Subtotal: $${orderTotals.total + discountTotal}\n` }
      );

      if (discountTotal > 0) {
        printCommands.push(
          { append: `Descuento: $${discountTotal}\n` }
        );
      }

      printCommands.push(
        { append: `Total: $${orderTotals.total}\n` },
        { appendAlignment: 'center' },
        { append: '\n¡Gracias por elegir Ryu Sushi!\n' },
        { append: '¡Esperamos verte pronto!\n' },
        { append: '\n\n\n' },
        { cut: true }
      );

      await ThermalPrinterModule.printBill(printCommands);

      Alert.alert(
        "Éxito",
        "Ticket impreso correctamente",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('Error printing ticket:', error);
      Alert.alert(
        "Error",
        "No se pudo imprimir el ticket. Verifica la conexión con la impresora.",
        [{ text: "OK" }]
      );
    }
  };

  return {
    printTicket,
    scanForPrinters,
    connectToPrinter,
    printerConnected,
    availablePrinters
  };
};

export default useBluetoothPrinter;