
// Configuração para conexão com a API backend
const API_CONFIG = {
  // Substitua pela URL do seu backend quando estiver hospedado
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://kalbir85.com.br/api' // Ajuste para seu domínio
    : 'http://localhost:3001/api',
  TIMEOUT: 15000, // 15 segundos
};

export default API_CONFIG;
