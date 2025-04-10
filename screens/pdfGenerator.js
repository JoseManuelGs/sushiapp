import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { WebView } from 'react-native-webview';
import React, { useRef, useState, useEffect } from 'react';

// Función para generar el contenido del reporte de ventas
export const generatePDFContent = (history, expenses, registro) => {
  const orders = groupOrdersByClient(history);
  const totalClients = Object.keys(orders).length;

  const totals = {
    sushi: 0,
    alitas: 0,
    bebidas: 0,
    boneless: 0,
    papas: 0,
    promociones: 0,
    general: 0,
  };

  Object.values(orders).forEach((orderData) => {
    orderData.items.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      if (item.type === 'Sushi') totals.sushi += price;
      if (item.type === 'Alitas') totals.alitas += price;
      if (item.type === 'Bebida') totals.bebidas += price;
      if (item.type === 'Boneless') totals.boneless += price;
      if (item.type === 'Papas') totals.papas += price;
      if (item.isPromotional) totals.promociones++;
      totals.general += price;
    });
  });

  const totalEgresos = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 1cm; }
          body { font-family: Arial, sans-serif; padding: 15px; line-height: 1.4; max-width: 21cm; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { font-size: 24px; color: #000; margin: 0 0 5px 0; }
          .header p { font-size: 14px; margin: 2px 0; }
          .section-title { font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 10px; background-color: #f5f5f5; padding: 8px; border-radius: 4px; }
          .content { font-size: 13px; margin-left: 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
          .stat-box { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; text-align: center; }
          .stat-value { font-size: 18px; font-weight: bold; color: #cc0000; }
          .stat-label { font-size: 12px; color: #666; }
          .sales-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
          .sales-item { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; }
          .sales-item-title { color: #cc0000; font-weight: bold; margin-bottom: 5px; }
          .expenses-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          .expenses-table th, .expenses-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .expenses-table th { background-color: #f5f5f5; font-weight: bold; }
          .total-section { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; }
          .total-text { font-size: 14px; font-weight: bold; text-align: right; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RYU SUSHI</h1>
          <p><strong>Reporte Detallado de Ventas</strong></p>
          <p><strong>Fecha:</strong> ${currentDate} <strong>Hora:</strong> ${currentTime}</p>
        </div>
        <div class="section-title">INFORMACIÓN DEL NEGOCIO</div>
        <div class="content">
          <p><strong>Dirección:</strong> ${registro?.direccion || 'No disponible'}</p>
          <p><strong>Teléfono:</strong> ${registro?.telefono || '6181268154'}</p>
          <p><strong>Trabajador:</strong> ${registro?.workerName || 'No disponible'}</p>
          <p><strong>Cambio en caja:</strong> $${registro?.cashInBox || '0'}</p>
        </div>
        <div class="section-title">RESUMEN DE VENTAS</div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${totalClients}</div>
            <div class="stat-label">Total Clientes</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${totals.promociones}</div>
            <div class="stat-label">Promociones</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">$${totals.general.toFixed(2)}</div>
            <div class="stat-label">Ventas Totales</div>
          </div>
        </div>
        <div class="section-title">DETALLE DE PRODUCTOS VENDIDOS</div>
        <div class="sales-summary">
          <div class="sales-item">
            <div class="sales-item-title">Sushi</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Sushi').length} unidades</p>
            <p>Total: $${totals.sushi.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Alitas</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Alitas').length} unidades</p>
            <p>Total: $${totals.alitas.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Bebidas</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Bebida').length} unidades</p>
            <p>Total: $${totals.bebidas.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Boneless</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Boneless').length} unidades</p>
            <p>Total: $${totals.boneless.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Papas</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Papas').length} unidades</p>
            <p>Total: $${totals.papas.toFixed(2)}</p>
          </div>
        </div>
        <div class="section-title">EGRESOS</div>
        <div class="content">
          <table class="expenses-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map((expense) => `
                <tr>
                  <td>${new Date(expense.date).toLocaleTimeString()}</td>
                  <td>${expense.description}</td>
                  <td>$${expense.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><strong>Total Egresos:</strong></td>
                <td><strong>$${totalEgresos.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="total-section">
          <p class="total-text">TOTAL VENTAS: $${totals.general.toFixed(2)}</p>
          <p class="total-text">TOTAL EGRESOS: $${totalEgresos.toFixed(2)}</p>
          <p class="total-text">BALANCE NETO: $${(totals.general - totalEgresos).toFixed(2)}</p>
        </div>
      </body>
    </html>
  `;
};

// Función para generar el contenido del ticket
export const generateTicketHTML = (orderData, registro) => {
  const orderTotals = calculateOrderTotals(orderData.items);
  const currentDate = new Date().toLocaleString();

  const discountItems = orderData.items.filter((item) => item.isPromotional);
  const discountTotal = discountItems.reduce((sum, item) => sum + (parseFloat(item.originalPrice) || 0), 0);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica', sans-serif; width: 100%; max-width: 300px; margin: 0 auto; padding: 10px; }
          .header { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 10px; }
          .info { font-size: 12px; text-align: center; margin-bottom: 5px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .items { margin: 10px 0; }
          .item { font-size: 12px; margin: 5px 0; display: flex; justify-content: space-between; }
          .total { font-size: 14px; font-weight: bold; text-align: right; margin: 5px 0; }
          .footer { font-size: 10px; margin-top: 15px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="header">RYU SUSHI</div>
          <div class="info">Tel: ${registro?.telefono || '6181268154'}</div>
          <div class="info">Fecha: ${currentDate}</div>
          <div class="info">Cliente: ${orderData.clientNumber}</div>
          <div class="divider"></div>
          <div class="items">
            ${orderData.items.map((item) => `
              <div class="item">
                <span>${item.name} ${item.option || ''}</span>
                <span>${item.isPromotional ? 'PROMO 3x2' : `$${item.price}`}</span>
              </div>
            `).join('')}
          </div>
          <div class="divider"></div>
          <div class="total">Subtotal: $${orderTotals.total + discountTotal}</div>
          ${discountTotal > 0 ? `<div class="total">Descuento: $${discountTotal}</div>` : ''}
          <div class="total">Total: $${orderTotals.total}</div>
          <div class="divider"></div>
          <div class="footer">
            ¡Gracias por elegir Ryu Sushi!<br>
            ¡Esperamos verte pronto!<br>
            Síguenos en redes sociales
          </div>
        </div>
      </body>
    </html>
  `;
};

// Componente WebView para renderizar HTML y capturar como imagen
export const HTMLtoImageView = ({ html, onImageCreated, visible = true }) => {
  const webViewRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded && visible && webViewRef.current) {
      // Dar tiempo para que se renderice completamente
      setTimeout(async () => {
        try {
          const uri = await captureRef(webViewRef, {
            format: 'jpg',
            quality: 0.9,
            result: 'tmpfile',
          });
          onImageCreated(uri);
        } catch (error) {
          console.error('Error al capturar la vista como imagen:', error);
          onImageCreated(null, error);
        }
      }, 1000); // Aumenta el tiempo de espera si es necesario
    }
  }, [loaded, visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        onLoad={() => setLoaded(true)}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        scrollEnabled={false}
      />
      {!loaded && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 800, // Ancho de página carta en píxeles a ~96dpi
    height: 1100, // Alto de página carta en píxeles a ~96dpi
    backgroundColor: 'white',
    zIndex: -1, // Ocultar visualmente pero mantener en el DOM
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
});

// Función para exportar el PDF
export const exportToPDF = async (html, fileName) => {
  try {
    if (Platform.OS === 'web') {
      // En la web, abrir el PDF en una nueva pestaña
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    // Generar el archivo PDF
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    if (Platform.OS === 'ios') {
      // En iOS, compartir el archivo
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } else {
      // En Android, guardar el archivo en el almacenamiento local
      const downloadDir = FileSystem.cacheDirectory;
      const downloadPath = `${downloadDir}${fileName}`;

      // Mover el archivo a la ubicación deseada
      await FileSystem.moveAsync({ from: uri, to: downloadPath });

      // Solicitar permisos para guardar en el almacenamiento externo
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        // Guardar el archivo en la ubicación seleccionada por el usuario
        const base64 = await FileSystem.readAsStringAsync(downloadPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/pdf'
        );

        await FileSystem.writeAsStringAsync(newUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('Éxito', 'PDF guardado correctamente en Descargas', [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', 'Se necesitan permisos para guardar el archivo', [{ text: 'OK' }]);
      }
    }
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    Alert.alert('Error', 'No se pudo generar el PDF. Por favor, intente nuevamente.', [{ text: 'OK' }]);
  }
};

// Función actualizada para exportar como imagen
export const exportToImage = async (html, fileName) => {
  try {
    if (Platform.OS === 'web') {
      Alert.alert('Información', 'La exportación a imagen está disponible solo en la aplicación móvil', [{ text: 'OK' }]);
      return;
    }

    // Para dispositivos móviles, usamos un enfoque diferente
    return new Promise((resolve, reject) => {
      // Crear un componente temporal para renderizar y capturar
      const RenderComponent = () => {
        const [imageUri, setImageUri] = useState(null);
        const [error, setError] = useState(null);
        const [showWebView, setShowWebView] = useState(true);

        useEffect(() => {
          if (imageUri) {
            const shareImage = async () => {
              try {
                // Guardar la imagen en un archivo con nombre personalizado
                const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
                const imageFileName = `${fileNameWithoutExt}.jpg`;
                const permanentPath = `${FileSystem.cacheDirectory}${imageFileName}`;
                
                await FileSystem.moveAsync({
                  from: imageUri,
                  to: permanentPath
                });
                
                // Compartir la imagen
                await Sharing.shareAsync(permanentPath, { mimeType: 'image/jpeg' });
                
                Alert.alert('Éxito', 'Imagen guardada y compartida correctamente', [{ text: 'OK' }]);
                resolve(permanentPath);
              } catch (err) {
                console.error('Error al compartir la imagen:', err);
                Alert.alert('Error', 'No se pudo compartir la imagen', [{ text: 'OK' }]);
                reject(err);
              } finally {
                setShowWebView(false); // Ocultar el WebView después de capturar
              }
            };
            
            shareImage();
          }
          
          if (error) {
            Alert.alert('Error', 'No se pudo generar la imagen. Se generará un PDF en su lugar.', 
              [{ 
                text: 'OK', 
                onPress: async () => {
                  // Fallback a PDF
                  try {
                    const { uri } = await Print.printToFileAsync({ html, base64: false });
                    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
                    resolve(uri);
                  } catch (pdfError) {
                    console.error('Error en fallback a PDF:', pdfError);
                    reject(pdfError);
                  } finally {
                    setShowWebView(false);
                  }
                }
              }]
            );
          }
        }, [imageUri, error]);

        // Renderizar el WebView para captura (invisible para el usuario)
        return (
          <HTMLtoImageView 
            html={html} 
            onImageCreated={(uri, err) => {
              if (uri) setImageUri(uri);
              if (err) setError(err);
            }}
            visible={showWebView}
          />
        );
      };

      // Devolver el componente para que la app lo renderice
      resolve(RenderComponent);
    });
  } catch (error) {
    console.error('Error general en exportToImage:', error);
    Alert.alert('Error', 'No se pudo generar la imagen. Por favor, intente nuevamente.', [{ text: 'OK' }]);
    throw error;
  }
};

// Función para imprimir el ticket
export const printTicket = async (html) => {
  try {
    if (Platform.OS === 'web') {
      // En la web, abrir el PDF en una nueva pestaña
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    // Generar el archivo PDF
    const { uri } = await Print.printToFileAsync({ html, width: 300, height: 'auto' });

    // Imprimir el archivo
    await Print.printAsync({ uri, width: 300, height: 'auto' });

    Alert.alert('Éxito', 'Ticket generado correctamente', [{ text: 'OK' }]);
  } catch (error) {
    console.error('Error al imprimir:', error);
    Alert.alert('Error de impresión', 'Verifica que tu impresora esté conectada y configurada correctamente', [{ text: 'OK' }]);
  }
};

// Función para agrupar pedidos por cliente
const groupOrdersByClient = (history) => {
  const clientGroups = {};
  history.forEach((item) => {
    if (!clientGroups[item.clientId]) {
      clientGroups[item.clientId] = [];
    }
    clientGroups[item.clientId].push(item);
  });

  const orders = {};
  Object.entries(clientGroups).forEach(([clientId, items]) => {
    const clientName = typeof items[0].clientName === 'object'
      ? items[0].clientName?.name || `Cliente ${Object.keys(orders).length + 1}`
      : String(items[0].clientName || `Cliente ${Object.keys(orders).length + 1}`);

    orders[clientId] = {
      items,
      clientNumber: clientName,
      time: items[0].time,
      clientId,
    };
  });
  return orders;
};

// Función para calcular los totales de un pedido
const calculateOrderTotals = (orderItems) => {
  return {
    total: orderItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    sushi: orderItems.filter((item) => item.type === 'Sushi').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    wings: orderItems.filter((item) => item.type === 'Alitas').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    drinks: orderItems.filter((item) => item.type === 'Bebida').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    fries: orderItems.filter((item) => item.type === 'Papas').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    boneless: orderItems.filter((item) => item.type === 'Boneless').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    halfOrdersWings: orderItems.filter((item) => item.type === 'Alitas' && item.name.toLowerCase().includes('media')).length,
    halfOrdersBoneless: orderItems.filter((item) => item.type === 'Boneless' && item.name.toLowerCase().includes('media')).length,
  };
};