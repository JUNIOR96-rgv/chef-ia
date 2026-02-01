import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import * as SplashScreen from 'expo-splash-screen';


//  export const auth:
import { auth } from './src/services/firebaseConfig';

// Importando as Telas
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CadastroScreen from './src/screens/CadastroScreen';

const Stack = createStackNavigator();

// Impede a tela de splash de sumir sozinha antes do tempo
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
      // Esconde a tela de splash assim que o Firebase responde
      SplashScreen.hideAsync().catch(() => {});
    });

    return unsubscribe;
  }, []);

  // Enquanto estiver carregando o status do usuário, mostra o círculo
  if (carregando) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
         <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  // Aqui começa o retorno principal da navegação
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          // Se o usuário estiver logado, vai direto para a Home
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Se não estiver logado, mostra Login e Cadastro
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 