import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }
    signInWithEmailAndPassword(auth, email, senha)
      .catch((error) => {
        console.log(error.code);
        Alert.alert("Erro", "E-mail ou senha incorretos");
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logoText}>👩‍🍳</Text>
        <Text style={styles.title}>PRISCILA CHEF</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Seu e-mail" 
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* CONTAINER DA SENHA  */}
        <View style={styles.passwordContainer}>
          <TextInput 
            style={[styles.input, { marginBottom: 0 }]} 
            placeholder="Sua senha" 
            placeholderTextColor="#aaa"
            secureTextEntry={!senhaVisivel}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity 
            style={styles.eyeButton} 
            onPress={() => setSenhaVisivel(!senhaVisivel)}
          >
            <Text style={{ fontSize: 20 }}>{senhaVisivel ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={{ marginTop: 20 }}>
          <Text style={styles.link}>
            Não tem conta? <Text style={styles.linkHighlight}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1a1a2e' 
  },
  inner: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30 
  },
  logoText: { 
    fontSize: 60, 
    marginBottom: 10 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 30 
  },
  input: { 
    width: '100%', 
    backgroundColor: '#2d2d44', 
    padding: 15, 
    borderRadius: 10, 
    color: '#fff', 
    marginBottom: 15 
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 15
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    zIndex: 10
  },
  button: { 
    width: '100%', 
    backgroundColor: '#e94560', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  link: { 
    color: '#fff' 
  },
  linkHighlight: {
    color: '#e94560', 
    fontWeight: 'bold'
  }
});