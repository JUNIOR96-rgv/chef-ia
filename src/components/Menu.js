import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Dimensions } from 'react-native';

export default function Menu({ visivel, acoes }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visivel) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(-20);
    }
  }, [visivel]);

  if (!visivel) return null;

  return (
    <Animated.View 
      style={[
        styles.menuDropdown, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity onPress={acoes.favoritos} style={styles.menuItem}>
        <Text style={styles.menuText}>⭐ Favoritos</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={acoes.historico} style={styles.menuItem}>
        <Text style={styles.menuText}>📋 Histórico</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={acoes.whatsapp} style={styles.menuItem}>
        <Text style={[styles.menuText, { color: '#55efc4' }]}>📱 WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={acoes.pdf} style={styles.menuItem}>
        <Text style={[styles.menuText, { color: '#a29bfe' }]}>📄 Salvar PDF</Text>
      </TouchableOpacity>

      <View style={styles.divisor} />

      <TouchableOpacity onPress={acoes.sair} style={styles.menuItem}>
        <Text style={[styles.menuText, { color: '#ff7675', fontWeight: 'bold' }]}>
          🚪 Sair da Conta
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menuDropdown: { 
    position: 'absolute', 
    top: 70, 
    left: 20, 
    backgroundColor: '#1e1e30', // Azul bem escuro e elegante
    padding: 8, 
    borderRadius: 18, 
    zIndex: 5000, 
    width: 200,
    borderWidth: 1,
    borderColor: '#3b3b58', // Borda sutil
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  menuItem: { 
    paddingVertical: 14, 
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  menuText: { 
    color: '#ececec', 
    fontSize: 15,
    fontWeight: '500'
  },
  divisor: {
    height: 1,
    backgroundColor: '#3b3b58',
    marginVertical: 4,
    width: '90%',
    alignSelf: 'center'
  }
});