import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

export default function CadastroScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const handleCadastro = () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    createUserWithEmailAndPassword(auth, email, senha)
      .then(() => {
        Alert.alert("Sucesso!", "Conta criada com sucesso!");
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert("Erro", "Este e-mail já está em uso!");
        } else {
          Alert.alert("Erro", "Ocorreu um erro ao cadastrar.");
        }
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logoText}>📝</Text>
        <Text style={styles.title}>CRIAR CONTA</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Seu melhor e-mail" 
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* CAMPO DE SENHA COM BOTÃO DE OLHO */}
        <View style={styles.passwordWrapper}>
          <TextInput 
            style={[styles.input, { marginBottom: 0 }]} 
            placeholder="Escolha uma senha" 
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

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>CADASTRAR AGORA</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={styles.link}>
            Já tem conta? <Text style={styles.linkHighlight}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
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
  passwordWrapper: {
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