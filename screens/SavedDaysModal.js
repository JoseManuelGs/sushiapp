import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const SavedDaysModal = ({ visible, onClose, savedDays, isDarkMode, onExportDay }) => {
  if (!visible) return null;

  return (
    <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? '#000000dd' : '#00000088' }]}>
      <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
        <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Días Guardados
        </Text>
        
        <ScrollView style={styles.daysList}>
          {savedDays.length === 0 ? (
            <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : '#666' }]}>
              No hay días guardados
            </Text>
          ) : (
            savedDays.map((day, index) => (
              <View key={index} style={styles.dayItem}>
                <Text style={[styles.dayText, { color: isDarkMode ? '#fff' : '#000' }]}>
                  Fecha: {day.date}
                </Text>
                <Text style={[styles.dayText, { color: isDarkMode ? '#fff' : '#000' }]}>
                  Trabajador: {day.registroInfo?.workerName || 'No registrado'}
                </Text>
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => onExportDay(day)}
                >
                  <Text style={styles.exportButtonText}>Descargar Reporte</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  daysList: {
    maxHeight: '70%',
  },
  dayItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dayText: {
    fontSize: 16,
    marginBottom: 5,
  },
  exportButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
});

export default SavedDaysModal;