
// Configuração para conexão com a API backend
const API_CONFIG = {
  // Substitua pelo URL do seu backend quando estiver hospedado
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://seu-dominio.com.br/api' 
    : 'http://localhost:3001/api',
  TIMEOUT: 15000, // 15 segundos
};

export default API_CONFIG;
