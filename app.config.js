// ========================================
// app.config.js
// Configuração do Expo com variáveis de ambiente
// ========================================

export default {
  expo: {
    name: "Solana Wallet TCC",
    slug: "solana-wallet-tcc",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    // ✨ VARIÁVEIS DE AMBIENTE PARA SUPABASE
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      
      // Outras configurações úteis
      environment: process.env.NODE_ENV || 'development',
      apiTimeout: 10000,
      
      // Configurações da rede Solana
      solanaNetwork: process.env.EXPO_PUBLIC_SOLANA_NETWORK || 'devnet',
      
      // URLs de deep link
      scheme: 'solanawallet',
      
      // Configurações de debug
      enableLogs: process.env.NODE_ENV === 'development',
    },
    
    // ✨ SCHEME PARA DEEP LINKS
    scheme: "solanawallet",
    
    // ✨ PLUGINS NECESSÁRIOS
    plugins: [
      "expo-secure-store", // Para armazenar chaves de forma segura
    ],
  },
};