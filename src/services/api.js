import axios from 'axios';

// Agora o código lê corretamente a variável do arquivo .env
const api = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`
  },
  timeout: 15000, 
});

export default api;