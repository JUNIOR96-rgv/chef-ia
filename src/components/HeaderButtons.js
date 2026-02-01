import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function HeaderButtons({ onMenuPress, onThemePress, darkMode }) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onThemePress} style={styles.themeBtn}>
        <Text>{darkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, zIndex: 100 },
  menuBtn: { backgroundColor: '#e94560', padding: 10, borderRadius: 8 },
  menuIcon: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  themeBtn: { backgroundColor: '#ddd', padding: 10, borderRadius: 8 },
});