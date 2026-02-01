import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Share,
  ActivityIndicator,
  Animated,
  Image,
  Alert,
  Keyboard,
  Linking
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

import api from '../services/api'; 
import HeaderButtons from '../components/HeaderButtons';
import Menu from '../components/Menu';
import ListaModal from '../components/Favoritos';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function HomeScreen({ navigation }){
  const [ingredientes, setIngredientes] = useState('');
  const [receita, setReceita] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [falando, setFalando] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [appPronto, setAppPronto] = useState(false);
  
  const [favoritos, setFavoritos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const [tempo, setTempo] = useState(0);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const timerRef = useRef(null);

  const [toastMsg, setToastMsg] = useState('');
  const toastFade = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function carregarDados() {
      try {
        const fav = await AsyncStorage.getItem('favoritos');
        const hist = await AsyncStorage.getItem('historico');
        if (fav) setFavoritos(JSON.parse(fav));
        if (hist) setHistorico(JSON.parse(hist));
      } catch (e) { console.log(e); }
      setAppPronto(true);
      SplashScreen.hideAsync().catch(() => {});
    }
    carregarDados();
  }, []);

  const enviarWhatsApp = () => {
    if (!receita) {
      mostrarToast("Gere uma receita primeiro! 📝");
      return;
    }
    const mensagem = `*Priscila Chef Tech - Sua Receita*\n\n${receita}`;
    const url = `whatsapp://send?text=${encodeURIComponent(mensagem)}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Erro", "O WhatsApp não está instalado.");
      }
    });
  };

  const gerarPDF = async () => {
    if (!receita) {
      mostrarToast("Gere uma receita primeiro! 📝");
      return;
    }
    try {
      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 30px;">
            <h1 style="color: #e94560; text-align: center;">Priscila Chef - Receita</h1>
            <hr/>
            ${fotoUrl ? `<img src="${fotoUrl}" style="width: 100%; border-radius: 15px; margin: 20px 0;"/>` : ''}
            <div style="font-size: 18px; line-height: 1.6;">
              ${receita.replace(/\n/g, '<br/>')}
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair da conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível sair.");
            }
          } 
        }
      ]
    );
  };

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});
    Animated.sequence([
      Animated.timing(toastFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastFade, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMsg(''));
  };

  const gerenciarTimer = (minutos) => {
    if (timerAtivo) {
      clearInterval(timerRef.current);
      setTimerAtivo(false);
      setTempo(0);
      mostrarToast("Timer parado! ⏹️");
    } else {
      setTempo(minutos * 60);
      setTimerAtivo(true);
      mostrarToast(`Timer de ${minutos} min iniciado! ⏳`);
      
      timerRef.current = setInterval(() => {
        setTempo((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerAtivo(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{});
            Alert.alert("PRONTO!", "Sua receita está no ponto!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const copiarListaCompras = () => {
    const linhas = receita.split('\n');
    const lista = linhas.filter(l => /^[\s]*[-*•\d]/.test(l.trim()));
    if (lista.length > 0) {
      Clipboard.setStringAsync(lista.join('\n'));
      mostrarToast("Ingredientes copiados! 🛒");
    } else {
      mostrarToast("Lista não detectada. 🧐");
    }
  };

  const escutarReceita = () => {
    if (falando) {
      Speech.stop();
      setFalando(false);
    } else {
      setFalando(true);
      const textoParaLer = receita.replace(/[*#]/g, '').replace(/-/g, ', ').replace(/\n/g, '. ');
      Speech.speak(textoParaLer, { 
        language: 'pt-BR', 
        pitch: 1.0, 
        rate: 0.9, 
        onDone: () => setFalando(false),
        onError: () => setFalando(false)
      });
    }
  };

  const compartilharReceita = async () => {
    await Share.share({ message: receita });
  };

  async function adicionarFavorito() {
    if (!receita) return;
    if (favoritos.some(f => f.texto === receita)) return mostrarToast("Já é favorita! ❤️");

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>{});
    Animated.sequence([
      Animated.timing(starAnim, { toValue: 1.5, duration: 150, useNativeDriver: true }),
      Animated.spring(starAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    const novo = { id: Date.now(), texto: receita, foto: fotoUrl };
    const novosFavs = [novo, ...favoritos];
    setFavoritos(novosFavs);
    await AsyncStorage.setItem('favoritos', JSON.stringify(novosFavs));
    mostrarToast("Favorito salvo! ⭐");
  }

  async function gerarReceita() {
    if (!ingredientes) return mostrarToast("Digite algo! 🍳");
    Keyboard.dismiss();
    setCarregando(true);
    setReceita('');
    setFotoUrl(null);
    fadeAnim.setValue(0);
    if (falando) Speech.stop();
    
    try {
      const resposta = await api.post("/chat/completions", {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: `Crie uma receita detalhada com: ${ingredientes}. Formate os ingredientes com hífen.` }]
      });
      
      const nova = resposta.data.choices[0].message.content;
      setReceita(nova);

      // BUSCA DE IMAGEM 
      let urlImagem = null;
      try {
        let termoParaBusca = ingredientes.split(',')[0].trim().split(' ')[0]; 
        const urlPixabay = `https://pixabay.com/api/?key=48722741-9257218698188177395048d08&q=${encodeURIComponent(termoParaBusca)}&image_type=photo&orientation=horizontal&safesearch=true&lang=pt&per_page=3`;
        
        const resImg = await fetch(urlPixabay);
        const dataImg = await resImg.json();
        
        if (dataImg.hits && dataImg.hits.length > 0) {
          const indiceAleatorio = Math.floor(Math.random() * Math.min(dataImg.hits.length, 3));
          urlImagem = dataImg.hits[indiceAleatorio].largeImageURL;
          setFotoUrl(urlImagem);
        } else {
          setFotoUrl(`https://loremflickr.com/800/600/food,cooking?random=${Date.now()}`);
        }
      } catch (eImg) {
        setFotoUrl(`https://loremflickr.com/800/600/recipe?random=${Date.now()}`);
      }

      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      const itemHistorico = { id: Date.now(), texto: nova, foto: urlImagem };
      const novoHist = [itemHistorico, ...historico];
      setHistorico(novoHist);
      await AsyncStorage.setItem('historico', JSON.stringify(novoHist));

    } catch (e) { 
      mostrarToast("Erro de conexão! ❌"); 
    } finally { 
      setCarregando(false); 
    }
  }

  if (!appPronto) return null;

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5' }]}>
      <StatusBar style="light" />
      
      <HeaderButtons 
        onMenuPress={() => setMenuAberto(!menuAberto)} 
        onThemePress={() => setDarkMode(!darkMode)} 
        darkMode={darkMode} 
      />

      <Menu 
        visivel={menuAberto} 
        acoes={{ 
          favoritos: () => { 
            setMostrarFavoritos(true); 
            setMenuAberto(false); 
          },
          historico: () => { 
            setMostrarFavoritos(true); 
            setMenuAberto(false); 
          },
          pdf: () => {
            gerarPDF();
            setMenuAberto(false);
          },
          whatsapp: () => {
            enviarWhatsApp();
            setMenuAberto(false);
          },
          sair: () => {
            setMenuAberto(false);
            handleLogout();
          } 
        }} 
      />

      <View style={styles.header}>
        <Text style={styles.emoji}>👩‍🍳</Text>
        <Text style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>PRISCILA CHEF TECH</Text>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { backgroundColor: darkMode ? '#2d2d44' : '#fff', color: darkMode ? '#fff' : '#000' }]}
          placeholder="O que vamos cozinhar?"
          placeholderTextColor="#888"
          value={ingredientes}
          onChangeText={setIngredientes}
          multiline
        />
        {ingredientes.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setIngredientes('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={gerarReceita} disabled={carregando}>
        <Text style={styles.buttonText}>{carregando ? "COZINHANDO..." : "GERAR RECEITA"}</Text>
      </TouchableOpacity>

      {toastMsg ? (
        <Animated.View style={[styles.toast, { opacity: toastFade }]}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.atalhosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.atalhoItem, { backgroundColor: '#ff7675' }]} onPress={() => setIngredientes('Lanche rápido e fácil')}>
            <Text style={styles.atalhoText}>🍔 Lanche</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.atalhoItem, { backgroundColor: '#55efc4' }]} onPress={() => setIngredientes('Receita saudável e fit')}>
            <Text style={styles.atalhoText}>🥗 Saudável</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.atalhoItem, { backgroundColor: '#ffeaa7' }]} onPress={() => setIngredientes('Almoço gourmet rápido')}>
            <Text style={[styles.atalhoText, { color: '#000' }]}>✨ Gourmet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.atalhoItem, { backgroundColor: '#74b9ff' }]} onPress={() => setIngredientes('Sobremesa rápida')}>
            <Text style={styles.atalhoText}>🍰 Doce</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {carregando ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#e94560" />
        </View>
      ) : receita ? (
        <Animated.View style={[styles.receitaWrapper, { opacity: fadeAnim }]}>
          <View style={styles.receitaHeader}>
            <Text style={styles.receitaHeaderText}>SUA RECEITA 🍽️</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={escutarReceita} style={{ marginRight: 15 }}>
                <Text style={{ fontSize: 22 }}>{falando ? "🛑" : "🔊"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={adicionarFavorito} style={{ marginRight: 15 }}>
                <Animated.View style={{ transform: [{ scale: starAnim }] }}>
                  <Text style={{ fontSize: 22 }}>⭐</Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity onPress={compartilharReceita}>
                <Text style={{ fontSize: 22 }}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chefTools}>
            <TouchableOpacity style={styles.toolBtn} onPress={copiarListaCompras}>
              <Text style={styles.toolBtnText}>🛒 Lista de Compras</Text>
            </TouchableOpacity>
            <View style={styles.timerGroup}>
              {!timerAtivo ? (
                <View style={{flexDirection: 'row'}}>
                   <TouchableOpacity style={styles.timerChip} onPress={() => gerenciarTimer(5)}><Text>5m</Text></TouchableOpacity>
                   <TouchableOpacity style={styles.timerChip} onPress={() => gerenciarTimer(15)}><Text>15m</Text></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.timerChip, {backgroundColor: '#e94560'}]} onPress={() => gerenciarTimer(0)}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>
                    {Math.floor(tempo/60)}:{(tempo%60).toString().padStart(2,'0')} ⏹️
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <Image 
                key={fotoUrl}
                source={fotoUrl ? { uri: fotoUrl } : { uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }} 
                style={styles.receitaImagem} 
            />
            <View style={{ padding: 20 }}>
              <Text style={styles.receitaText}>{receita}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      ) : null}

      <ListaModal 
        visivel={mostrarFavoritos} fechar={() => setMostrarFavoritos(false)} titulo="Favoritos ⭐" dados={favoritos} 
        acaoPrincipal={(item) => { 
          setReceita(item.texto); 
          setFotoUrl(item.foto);
          setMostrarFavoritos(false); 
          fadeAnim.setValue(1); 
        }}
        acaoExcluir={(id) => {
          const novos = favoritos.filter(f => f.id !== id);
          setFavoritos(novos);
          AsyncStorage.setItem('favoritos', JSON.stringify(novos));
        }}
        darkMode={darkMode} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: { alignItems: 'center', marginVertical: 10 },
  emoji: { fontSize: 50 },
  title: { fontSize: 24, fontWeight: 'bold' },
  inputWrapper: { position: 'relative', marginBottom: 10 },
  input: { borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top' },
  clearButton: { position: 'absolute', right: 15, top: 15, backgroundColor: 'rgba(233,69,96,0.2)', width: 25, height: 25, borderRadius: 12.5, justifyContent: 'center', alignItems: 'center' },
  clearButtonText: { color: '#e94560', fontWeight: 'bold' },
  button: { backgroundColor: '#e94560', padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  atalhosContainer: { height: 50, marginTop: 15, marginBottom: 10 },
  atalhoItem: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10, height: 40, justifyContent: 'center' },
  atalhoText: { color: '#fff', fontWeight: 'bold' },
  loadingArea: { flex: 1, justifyContent: 'center' },
  receitaWrapper: { flex: 1, marginTop: 10, backgroundColor: '#2d2d44', borderRadius: 20, overflow: 'hidden', marginBottom: 10 },
  receitaHeader: { backgroundColor: '#e17055', padding: 15, flexDirection: 'row', justifyContent: 'space-between' },
  receitaHeaderText: { color: '#fff', fontWeight: 'bold' },
  receitaText: { color: '#fff', fontSize: 16, lineHeight: 26, padding: 20 },
  chefTools: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#3b3b58', alignItems: 'center' },
  toolBtn: { backgroundColor: '#55efc4', padding: 8, borderRadius: 8 },
  toolBtnText: { fontWeight: 'bold', fontSize: 12 },
  timerGroup: { flexDirection: 'row', alignItems: 'center' },
  timerChip: { backgroundColor: '#ffeaa7', padding: 8, borderRadius: 8, marginLeft: 5 },
  receitaImagem: { width: '100%', height: 220, resizeMode: 'cover', backgroundColor: '#3b3b58' },
  toast: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#e94560', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, zIndex: 999 },
  toastText: { color: '#fff', fontWeight: 'bold' }
});