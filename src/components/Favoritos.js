import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ListaModal({ visivel, fechar, titulo, dados, acaoPrincipal, acaoExcluir, darkMode }) {
  return (
    <Modal visible={visivel} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: darkMode ? '#1a1a2e' : '#fff' }]}>
          
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: darkMode ? '#fff' : '#000' }]}>{titulo}</Text>
            <TouchableOpacity onPress={fechar} style={styles.botaoFechar}>
              <Text style={styles.textoBotaoFechar}>✕</Text>
            </TouchableOpacity>
          </View>

          {dados.length === 0 ? (
            <View style={styles.vazioContainer}>
              <Text style={{ fontSize: 50 }}>🍳</Text>
              <Text style={[styles.vazioTexto, { color: darkMode ? '#888' : '#666' }]}>
                Nenhuma receita salva ainda...
              </Text>
            </View>
          ) : (
            <FlatList
              data={dados}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={[styles.card, { backgroundColor: darkMode ? '#2d2d44' : '#f9f9f9' }]}>
                  {/* MINIATURA DA FOTO */}
                  <Image 
                    source={item.foto ? { uri: item.foto } : { uri: 'https://via.placeholder.com/150?text=Sem+Foto' }} 
                    style={styles.miniatura}
                  />
                  
                  <View style={styles.infoCard}>
                    <TouchableOpacity 
                      style={styles.btnTexto} 
                      onPress={() => acaoPrincipal(item)}
                    >
                      <Text 
                        numberOfLines={2} 
                        style={[styles.nomeReceita, { color: darkMode ? '#fff' : '#333' }]}
                      >
                        {item.texto.split('\n')[0].replace('#', '').trim() || "Receita Especial"}
                      </Text>
                      <Text style={styles.subtexto}>Toque para abrir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.btnExcluir} 
                      onPress={() => acaoExcluir(item.id)}
                    >
                      <Text style={{ fontSize: 18 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  botaoFechar: { backgroundColor: '#e94560', width: 35, height: 35, borderRadius: 17.5, justifyContent: 'center', alignItems: 'center' },
  textoBotaoFechar: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  vazioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazioTexto: { marginTop: 10, fontSize: 16 },
  card: { 
    flexDirection: 'row', 
    marginBottom: 15, 
    borderRadius: 15, 
    overflow: 'hidden', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  miniatura: { width: 80, height: 80 },
  infoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  btnTexto: { flex: 1 },
  nomeReceita: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  subtexto: { fontSize: 12, color: '#e94560' },
  btnExcluir: { padding: 10, marginLeft: 10 }
});