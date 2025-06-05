// ========================================
// src/services/phantom/PhantomService.ts
// Refatorado com tipos centralizados - CORRIGIDO PARA iOS
// ========================================

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import { 
  PhantomSession, 
  PhantomConnectResponse, 
  PhantomConnectionData, 
  PhantomConnectionResult,
  PhantomEventData 
} from '../../types/phantom';
import { PHANTOM_CONFIG, APP_CONFIG } from '../../constants/config';

class PhantomService {
  private static instance: PhantomService;
  private currentSession: PhantomSession | null = null;
  private currentConnectionData: PhantomConnectionData | null = null;

  constructor() {
    this.setupLinkingListener();
  }

  public static getInstance(): PhantomService {
    if (!PhantomService.instance) {
      PhantomService.instance = new PhantomService();
    }
    return PhantomService.instance;
  }

  /**
   * Configura listener para deep links
   */
  private setupLinkingListener(): void {
    console.log('🔗 Configurando listener de deep links...');
    
    Linking.addEventListener('url', (event) => {
      console.log('📨 URL recebida:', event.url);
      this.handleIncomingURL(event.url);
    });
    
    // Verificar se o app foi aberto por uma URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🚀 App aberto por URL:', url);
        this.handleIncomingURL(url);
      }
    });
  }

  /**
   * Processa URLs recebidas
   */
  private handleIncomingURL(url: string): void {
    try {
      console.log('📨 URL completa recebida:', url);
      
      const parsedUrl = Linking.parse(url);
      console.log('📋 URL parseada:', {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        queryParams: Object.keys(parsedUrl.queryParams || {}),
        scheme: parsedUrl.scheme
      });
      
      // Verificar se é uma resposta do Phantom baseado no path ou parâmetros
      const isPhantomResponse = 
        parsedUrl.path?.includes('phantom-connect') ||
        this.isPhantomResponse(parsedUrl.queryParams || {});
      
      if (isPhantomResponse) {
        console.log('👻 Resposta do Phantom detectada!');
        console.log('🔍 Parâmetros encontrados:', {
          hasPhantomKey: !!(parsedUrl.queryParams?.phantom_encryption_public_key),
          hasNonce: !!(parsedUrl.queryParams?.nonce),
          hasData: !!(parsedUrl.queryParams?.data),
          hasError: !!(parsedUrl.queryParams?.errorCode),
          allParams: Object.keys(parsedUrl.queryParams || {})
        });
        
        this.processPhantomResponse(parsedUrl.queryParams || {});
      } else {
        console.log('ℹ️ URL não é uma resposta do Phantom');
        console.log('🔍 Esperando por:', {
          path: 'phantom-connect',
          params: ['phantom_encryption_public_key', 'nonce', 'data']
        });
      }
    } catch (error) {
      console.error('❌ Erro ao processar URL:', error);
      if (this.currentConnectionData) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        this.currentConnectionData.reject(new Error(`Erro ao processar resposta da Phantom: ${errorMessage}`));
        this.clearConnectionData();
      }
    }
  }

  /**
   * Verifica se é uma resposta válida do Phantom
   */
  private isPhantomResponse(queryParams: any): boolean {
    const isError = !!(queryParams.errorCode || queryParams.errorMessage);
    const isSuccess = !!(
      queryParams.phantom_encryption_public_key && 
      queryParams.nonce && 
      queryParams.data
    );
    
    console.log('🔍 Validação de resposta:', {
      isError,
      isSuccess,
      hasPhantomKey: !!queryParams.phantom_encryption_public_key,
      hasNonce: !!queryParams.nonce,
      hasData: !!queryParams.data,
      errorCode: queryParams.errorCode
    });
    
    return isError || isSuccess;
  }

  /**
   * Processa resposta do Phantom
   */
  private async processPhantomResponse(queryParams: PhantomEventData): Promise<void> {
    if (!this.currentConnectionData) {
      console.log('⚠️ Resposta recebida, mas nenhuma conexão pendente');
      return;
    }

    try {
      console.log('🔄 Processando resposta...');
      
      // Verificar se houve erro
      if (queryParams.errorCode) {
        throw new Error(`Phantom Error: ${queryParams.errorMessage || 'Usuário cancelou ou erro desconhecido'}`);
      }

      const { phantom_encryption_public_key, nonce, data } = queryParams;

      if (!phantom_encryption_public_key || !nonce || !data) {
        throw new Error('Resposta inválida da Phantom - dados incompletos');
      }

      // Descriptografar dados
      const session = await this.decryptPhantomResponse({
        phantom_encryption_public_key,
        nonce,
        data,
        dappKeyPair: this.currentConnectionData.dappKeyPair
      });

      console.log('✅ Sessão criada com sucesso!');
      this.currentConnectionData.resolve(session);
      
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      this.currentConnectionData.reject(error instanceof Error ? error : new Error('Erro desconhecido'));
    } finally {
      this.clearConnectionData();
    }
  }

  /**
   * Descriptografa resposta do Phantom
   */
  private async decryptPhantomResponse(params: {
    phantom_encryption_public_key: string;
    nonce: string;
    data: string;
    dappKeyPair: nacl.BoxKeyPair;
  }): Promise<PhantomSession> {
    const { phantom_encryption_public_key, nonce, data, dappKeyPair } = params;

    console.log('🔓 Iniciando descriptografia avançada...');
    console.log('📊 Dados recebidos:', {
      phantomKey: phantom_encryption_public_key.slice(0, 10) + '...',
      nonce: nonce.slice(0, 10) + '...',
      data: data.slice(0, 10) + '...'
    });

    try {
      // Usar método da documentação oficial
      const phantomPublicKey = bs58.decode(phantom_encryption_public_key);
      const nonceBytes = bs58.decode(nonce);
      const encryptedData = bs58.decode(data);

      console.log('✅ Dados decodificados');

      // Criar segredo compartilhado
      const sharedSecret = nacl.box.before(phantomPublicKey, dappKeyPair.secretKey);
      console.log('✅ Segredo compartilhado criado');

      // Descriptografar usando nacl.box.open.after
      const decryptedData = nacl.box.open.after(encryptedData, nonceBytes, sharedSecret);
      
      if (!decryptedData) {
        throw new Error('Falha ao descriptografar dados - chave ou dados inválidos');
      }

      console.log('✅ Dados descriptografados com sucesso');

      // Converter para string e parsear JSON - SEM usar Buffer
      const textDecoder = new TextDecoder();
      const decryptedJson = textDecoder.decode(decryptedData);
      console.log('📋 JSON descriptografado (tamanho):', decryptedJson.length, 'chars');
      
      const connectData: PhantomConnectResponse = JSON.parse(decryptedJson);
      
      console.log('✅ Dados de conexão parseados:', {
        hasPublicKey: !!connectData.public_key,
        hasSession: !!connectData.session,
        publicKeyPreview: connectData.public_key?.slice(0, 8) + '...'
      });

      // Criar sessão completa
      const session: PhantomSession = {
        publicKey: new PublicKey(connectData.public_key),
        session: connectData.session,
        dappKeyPair,
        sharedSecret,
        phantomEncryptionPublicKey: phantom_encryption_public_key
      };

      return session;
    } catch (error) {
      console.error('❌ Erro detalhado na descriptografia:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        phantomKeyLength: phantom_encryption_public_key.length,
        nonceLength: nonce.length,
        dataLength: data.length
      });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha na descriptografia: ${errorMessage}`);
    }
  }

  /**
   * Limpa dados de conexão
   */
  private clearConnectionData(): void {
    if (this.currentConnectionData) {
      clearTimeout(this.currentConnectionData.timeout);
      this.currentConnectionData = null;
    }
  }

  /**
   * Conecta com Phantom ou redireciona para download
   */
  async connectOrDownload(): Promise<PhantomSession | 'DOWNLOAD_NEEDED'> {
    try {
      console.log('🚀 Iniciando conexão com Phantom...');

      // Limpar conexão anterior
      this.clearConnectionData();

      // 1. Gerar chaves
      console.log('🔑 Gerando chaves de criptografia...');
      const secretKey = await this.generateSecureRandomBytes(32);
      const dappKeyPair = nacl.box.keyPair.fromSecretKey(secretKey);
      const dappEncryptionPublicKey = bs58.encode(dappKeyPair.publicKey);
      console.log('✅ Chaves geradas:', {
        publicKeyLength: dappEncryptionPublicKey.length,
        publicKeyPreview: dappEncryptionPublicKey.slice(0, 10) + '...'
      });

      // 2. Criar URLs com scheme correto
      console.log('🔗 Criando URLs...');
      const redirectLink = Linking.createURL('phantom-connect', {
        scheme: 'solanawallet'
      });
      const connectUrl = this.buildConnectUrl({
        app_url: APP_CONFIG.APP_URL,
        dapp_encryption_public_key: dappEncryptionPublicKey,
        redirect_link: redirectLink,
        cluster: 'devnet'
      });

      console.log('✅ URLs criadas');
      console.log('📱 Redirect Link:', redirectLink);
      console.log('🌐 Connect URL comprimento:', connectUrl.length, 'caracteres');

      // 3. Configurar promessa de resposta
      const connectionPromise = this.createConnectionPromise(dappKeyPair);

      // 4. Verificar se Phantom está instalado ANTES de tentar abrir (apenas iOS)
      let isPhantomInstalled = true; // Padrão para Android
      
      if (Platform.OS === 'ios') {
        isPhantomInstalled = await this.checkPhantomInstalled();
        
        if (!isPhantomInstalled) {
          this.clearConnectionData();
          console.log('📥 Phantom não instalado no iOS, abrindo download...');
          await this.openDownloadPage();
          return 'DOWNLOAD_NEEDED';
        }
      }

      // 5. Tentar abrir Phantom
      const opened = await this.tryOpenPhantom(connectUrl);
      
      if (!opened) {
        this.clearConnectionData();
        console.log('📥 Falha ao abrir Phantom, abrindo download...');
        await this.openDownloadPage();
        return 'DOWNLOAD_NEEDED';
      }

      // 6. Aguardar resposta
      console.log('⏳ Aguardando resposta da Phantom...');
      const session = await connectionPromise;

      // 7. Salvar e retornar
      await this.saveSession(session);
      this.currentSession = session;
      
      console.log('✅ Conectado com sucesso!');
      return session;

    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      this.clearConnectionData();
      
      // Se for erro de cancelamento/timeout, oferecer download
      if (this.shouldOfferDownload(error)) {
        console.log('📥 Oferecendo download devido ao erro...');
        await this.openDownloadPage();
        return 'DOWNLOAD_NEEDED';
      }
      
      throw error;
    }
  }

  /**
   * Verifica se Phantom está instalado - CORRIGIDO PARA ANDROID
   */
  private async checkPhantomInstalled(): Promise<boolean> {
    try {
      console.log('🔍 Verificando se Phantom está instalado...');
      
      if (Platform.OS === 'ios') {
        // iOS - verificar múltiplos schemes
        const schemes = ['phantom://', 'https://phantom.app'];
        
        for (const scheme of schemes) {
          try {
            const canOpen = await Linking.canOpenURL(scheme);
            console.log(`📱 iOS - Scheme ${scheme}:`, canOpen);
            if (canOpen) {
              return true;
            }
          } catch (error) {
            console.log(`❌ Erro ao verificar scheme ${scheme}:`, error);
          }
        }
        
        return false;
      } else {
        // Android - estratégia diferente: assumir instalado e tentar abrir diretamente
        // A verificação canOpenURL no Android às vezes retorna false mesmo com app instalado
        console.log('🤖 Android - Assumindo instalação e tentando abertura direta');
        return true; // Assumir que está instalado e deixar o tryOpenPhantom decidir
      }
    } catch (error) {
      console.error('❌ Erro ao verificar instalação:', error);
      return Platform.OS === 'android'; // No Android, tentar abrir mesmo com erro
    }
  }

  /**
   * Cria promessa para conexão
   */
  private createConnectionPromise(dappKeyPair: nacl.BoxKeyPair): Promise<PhantomSession> {
    return new Promise<PhantomSession>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: conexão não completada em 2 minutos'));
        this.clearConnectionData();
      }, APP_CONFIG.TIMEOUT_DURATION);

      this.currentConnectionData = {
        dappKeyPair,
        resolve,
        reject,
        timeout
      };
    });
  }

  /**
   * Verifica se deve oferecer download
   */
  private shouldOfferDownload(error: any): boolean {
    const errorMessage = error?.message || '';
    return errorMessage.includes('cancelou') || 
           errorMessage.includes('Timeout') ||
           errorMessage.includes('não encontrada');
  }

  /**
   * Tenta abrir Phantom - CORRIGIDO PARA iOS
   */
  private async tryOpenPhantom(connectUrl: string): Promise<boolean> {
    console.log('🚀 Tentando abrir Phantom...');
    console.log('🔗 URL completa:', connectUrl);
    console.log('📱 Plataforma:', Platform.OS);

    if (Platform.OS === 'ios') {
      return await this.tryOpenPhantomIOS(connectUrl);
    } else {
      return await this.tryOpenPhantomAndroid(connectUrl);
    }
  }

  /**
   * Método específico para iOS - CORRIGIDO
   */
  private async tryOpenPhantomIOS(connectUrl: string): Promise<boolean> {
    console.log('🍎 Iniciando processo iOS...');

    // CORREÇÃO PRINCIPAL: Usar Universal Link primeiro no iOS
    try {
      console.log('🌐 Tentativa 1 (iOS): Universal Link direto');
      
      // Usar Universal Link diretamente sem WebBrowser
      await Linking.openURL(connectUrl);
      console.log('✅ Universal Link enviado com sucesso');
      
      // Aguardar um momento para ver se o app abre
      await this.delay(1000);
      
      return true;
      
    } catch (error) {
      console.log('❌ Universal Link falhou:', error);
    }

    // Fallback: Tentar deep link direto
    try {
      console.log('👻 Tentativa 2 (iOS): Deep link direto');
      
      const url = new URL(connectUrl);
      const phantomUrl = `phantom://ul/v1/connect?${url.searchParams.toString()}`;
      
      console.log('🔗 Deep link URL:', phantomUrl);
      await Linking.openURL(phantomUrl);
      console.log('✅ Deep link enviado com sucesso');
      
      return true;
      
    } catch (error) {
      console.log('❌ Deep link falhou:', error);
    }

    // Último recurso: WebBrowser (só se os outros falharem)
    try {
      console.log('🌐 Tentativa 3 (iOS): WebBrowser como último recurso');
      
      const result = await WebBrowser.openBrowserAsync(connectUrl, {
        showTitle: false,
        toolbarColor: '#6b46c1',
        showInRecents: false,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        readerMode: false,
        dismissButtonStyle: 'close'
      });
      
      console.log('📱 WebBrowser resultado:', result);
      
      if (result.type === 'cancel') {
        console.log('❌ Usuário cancelou no WebBrowser');
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.log('❌ WebBrowser falhou:', error);
    }

    console.log('❌ Todos os métodos iOS falharam');
    return false;
  }

  /**
   * Método específico para Android - CORRIGIDO PARA EVITAR PLAY STORE
   */
  private async tryOpenPhantomAndroid(connectUrl: string): Promise<boolean> {
    console.log('🤖 Iniciando processo Android...');

    // Método 1: Tentar deep link direto PRIMEIRO
    try {
      console.log('👻 Tentativa 1 (Android): Deep link direto');
      
      const url = new URL(connectUrl);
      const phantomUrl = `phantom://ul/v1/connect?${url.searchParams.toString()}`;
      
      console.log('🔗 Deep link URL:', phantomUrl);
      
      // Verificar se pode abrir o deep link
      const canOpenDeepLink = await Linking.canOpenURL('phantom://');
      console.log('📱 Pode abrir phantom://:', canOpenDeepLink);
      
      if (canOpenDeepLink) {
        await Linking.openURL(phantomUrl);
        console.log('✅ Deep link enviado com sucesso');
        return true;
      } else {
        console.log('❌ Deep link não disponível, tentando Universal Link');
      }
      
    } catch (error) {
      console.log('❌ Deep link falhou:', error);
    }

    // Método 2: Universal Link como fallback
    try {
      console.log('🌐 Tentativa 2 (Android): Universal Link');
      
      // Tentar abrir Universal Link diretamente (sem WebBrowser)
      await Linking.openURL(connectUrl);
      console.log('✅ Universal Link enviado diretamente');
      
      // Aguardar um momento para ver se abre
      await this.delay(2000);
      
      return true;
      
    } catch (error) {
      console.log('❌ Universal Link direto falhou:', error);
    }

    // Método 3: WebBrowser apenas se os outros falharem
    try {
      console.log('🌐 Tentativa 3 (Android): WebBrowser como último recurso');
      
      const result = await WebBrowser.openBrowserAsync(connectUrl, {
        showTitle: true,
        toolbarColor: '#6b46c1',
        showInRecents: false,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        // Configurações para melhor integração no Android
        controlsColor: '#6b46c1',
        browserPackage: undefined // Deixar o sistema escolher
      });
      
      console.log('📱 WebBrowser resultado:', result);
      
      if (result.type === 'cancel') {
        console.log('❌ Usuário cancelou no WebBrowser');
        return false;
      }
      
      console.log('✅ Phantom aberto via WebBrowser');
      return true;
      
    } catch (error) {
      console.log('❌ WebBrowser falhou:', error);
    }

    console.log('❌ Todos os métodos Android falharam');
    return false;
  }

  /**
   * Abre página de download
   */
  async openDownloadPage(): Promise<void> {
    try {
      const downloadUrl = this.getDownloadUrl();
      console.log('📥 Abrindo download:', downloadUrl);
      await WebBrowser.openBrowserAsync(downloadUrl);
    } catch (error) {
      console.error('❌ Erro ao abrir download:', error);
      throw error;
    }
  }

  /**
   * Obtém URL de download por plataforma
   */
  private getDownloadUrl(): string {
    switch (Platform.OS) {
      case 'ios':
        return PHANTOM_CONFIG.DOWNLOAD_URLS.ios;
      case 'android':
        return PHANTOM_CONFIG.DOWNLOAD_URLS.android;
      default:
        return PHANTOM_CONFIG.DOWNLOAD_URLS.web;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gera bytes aleatórios seguros
   */
  private async generateSecureRandomBytes(length: number): Promise<Uint8Array> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(length);
      return new Uint8Array(randomBytes);
    } catch (error) {
      console.log('⚠️ Usando fallback para random bytes');
      const fallbackBytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        fallbackBytes[i] = Math.floor(Math.random() * 256);
      }
      return fallbackBytes;
    }
  }

  /**
   * Constrói URL de conexão
   */
  private buildConnectUrl(params: {
    app_url: string;
    dapp_encryption_public_key: string;
    redirect_link: string;
    cluster?: string;
  }): string {
    // URL base oficial do Phantom
    const baseUrl = 'https://phantom.app/ul/v1/connect';
    
    // Parâmetros conforme documentação
    const urlParams = new URLSearchParams({
      app_url: params.app_url,                    // URL do nosso app (obrigatório)
      dapp_encryption_public_key: params.dapp_encryption_public_key, // Chave pública (obrigatório)
      redirect_link: params.redirect_link,        // URL de retorno (obrigatório)
      cluster: params.cluster || 'devnet'         // Rede Solana (opcional)
    });

    const finalUrl = `${baseUrl}?${urlParams.toString()}`;
    
    console.log('🔧 Construindo URL de conexão:');
    console.log('  📍 Base URL:', baseUrl);
    console.log('  🌐 App URL:', params.app_url);
    console.log('  🔑 Public Key:', params.dapp_encryption_public_key.slice(0, 10) + '...');
    console.log('  📱 Redirect:', params.redirect_link);
    console.log('  🌍 Cluster:', params.cluster || 'devnet');
    console.log('  🔗 URL Final:', finalUrl);

    return finalUrl;
  }

  /**
   * Salva sessão no armazenamento seguro
   */
  private async saveSession(session: PhantomSession): Promise<void> {
    try {
      const sessionData = {
        publicKey: session.publicKey.toString(),
        session: session.session,
        dappKeyPair: {
          publicKey: bs58.encode(session.dappKeyPair.publicKey),
          secretKey: bs58.encode(session.dappKeyPair.secretKey)
        },
        phantomEncryptionPublicKey: session.phantomEncryptionPublicKey
      };

      await SecureStore.setItemAsync(
        PHANTOM_CONFIG.SESSION_STORAGE_KEY,
        JSON.stringify(sessionData)
      );
      
      console.log('💾 Sessão salva com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      throw error;
    }
  }

  /**
   * Carrega sessão salva
   */
  async loadSession(): Promise<PhantomSession | null> {
    try {
      const sessionData = await SecureStore.getItemAsync(PHANTOM_CONFIG.SESSION_STORAGE_KEY);
      if (!sessionData) {
        console.log('ℹ️ Nenhuma sessão salva encontrada');
        return null;
      }

      const parsed = JSON.parse(sessionData);
      const dappKeyPair = {
        publicKey: bs58.decode(parsed.dappKeyPair.publicKey),
        secretKey: bs58.decode(parsed.dappKeyPair.secretKey)
      };

      const phantomPublicKey = bs58.decode(parsed.phantomEncryptionPublicKey);
      const sharedSecret = nacl.box.before(phantomPublicKey, dappKeyPair.secretKey);

      const session: PhantomSession = {
        publicKey: new PublicKey(parsed.publicKey),
        session: parsed.session,
        dappKeyPair,
        sharedSecret,
        phantomEncryptionPublicKey: parsed.phantomEncryptionPublicKey
      };

      this.currentSession = session;
      console.log('📱 Sessão carregada:', session.publicKey.toString().slice(0, 8) + '...');
      return session;
      
    } catch (error) {
      console.error('❌ Erro ao carregar sessão:', error);
      await SecureStore.deleteItemAsync(PHANTOM_CONFIG.SESSION_STORAGE_KEY);
      return null;
    }
  }

  /**
   * Desconecta da Phantom
   */
  async disconnect(): Promise<void> {
    try {
      this.clearConnectionData();
      this.currentSession = null;
      await SecureStore.deleteItemAsync(PHANTOM_CONFIG.SESSION_STORAGE_KEY);
      console.log('✅ Desconectado da Phantom');
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      this.currentSession = null;
      this.clearConnectionData();
      throw error;
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Obtém sessão atual
   */
  getCurrentSession(): PhantomSession | null {
    return this.currentSession;
  }

  /**
   * Obtém chave pública atual
   */
  getPublicKey(): PublicKey | null {
    return this.currentSession?.publicKey || null;
  }

  /**
   * Método de teste para verificar deep linking
   */
  async testDeepLink(): Promise<void> {
    const testUrl = Linking.createURL('phantom-connect', {
      scheme: 'solanawallet'
    });
    
    console.log('🧪 URL de teste:', testUrl);
    console.log('🧪 Timestamp:', Date.now());
    
    try {
      await Linking.openURL(testUrl);
      console.log('✅ Deep link teste enviado');
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }
}

export default PhantomService;