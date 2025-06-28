// ========================================
// app.config.js - COM CAMINHOS DE ASSETS CORRIGIDOS
// ========================================

export default {
  expo: {
    name: "Solana Wallet TCC",
    slug: "solana-wallet-novo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/app-icon.png", // ✅ CORRIGIDO: usar caminho que existe
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/icons/app-icon.png", // ✅ CORRIGIDO: usar arquivo que existe
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    
    // ✅ CONFIGURAÇÕES iOS - Mantidas + NFC
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tccsolana.walletapp",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLName: "solanawallet-deeplink",
            CFBundleURLSchemes: ["solanawallet"]
          }
        ],
        LSApplicationQueriesSchemes: ["phantom"],
        
        // ✅ ADICIONADO: Suporte NFC para iOS
        NFCReaderUsageDescription: "Este app usa NFC para transferências seguras de Solana entre dispositivos."
      },
      associatedDomains: [
        "applinks:kelvin-sous.github.io"
      ]
    },
    
    // ✅ CONFIGURAÇÕES ANDROID - Mantidas + NFC
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/app-icon.png", // ✅ CORRIGIDO: usar arquivo que existe
        backgroundColor: "#ffffff"
      },
      package: "com.tccsolana.walletapp",
      
      // ✅ ADICIONADO: Intent filters para NFC
      intentFilters: [
        // Deep links originais
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "solanawallet" }],
          category: ["BROWSABLE", "DEFAULT"]
        },
        
        // ✅ NOVOS: Intent filters NFC
        {
          action: "android.nfc.action.NDEF_DISCOVERED",
          data: [{ mimeType: "text/plain" }],
          category: ["DEFAULT"]
        },
        {
          action: "android.nfc.action.TAG_DISCOVERED",
          category: ["DEFAULT"]
        },
        {
          action: "android.nfc.action.NDEF_DISCOVERED",
          data: [{ mimeType: "application/solana-transaction" }],
          category: ["DEFAULT"]
        }
      ],
      
      // ✅ ADICIONADO: Permissões NFC
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.NFC",
        "android.permission.INTERNET"
      ]
    },
    
    web: {
      favicon: "./assets/favicon.png" // ✅ Pode não existir, mas é só pra web
    },
    
    // ✅ MANTIDO: Variáveis de ambiente + EAS projectId correto
    extra: {
      // Supabase
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      
      // Configurações gerais
      environment: process.env.NODE_ENV || 'development',
      apiTimeout: 10000,
      
      // Configurações da rede Solana
      solanaNetwork: process.env.EXPO_PUBLIC_SOLANA_NETWORK || 'devnet',
      
      // URLs de deep link
      scheme: 'solanawallet',
      
      // Configurações de debug
      enableLogs: process.env.NODE_ENV === 'development',
      
      // ✅ MANTIDO: EAS Project ID correto
      eas: {
        projectId: "254f6728-98b2-4dbe-8684-254a300ed75c"
      }
    },
    
    // ✅ SCHEME PARA DEEP LINKS
    scheme: "solanawallet",
    
    // ✅ PLUGINS NECESSÁRIOS
    plugins: [
      "expo-secure-store",
      [
        "expo-camera",
        {
          cameraPermission: "Permitir acesso à câmera para escanear QR codes de pagamento."
        }
      ]
    ],
  },
};