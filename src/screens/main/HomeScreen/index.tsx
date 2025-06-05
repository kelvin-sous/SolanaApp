// ========================================
// src/screens/main/HomeScreen/index.tsx
// Tela principal após conexão com Phantom Wallet
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  Image,
  Modal,
  Pressable
} from 'react-native';
import { usePhantom } from '../../../hooks/usePhantom';
import { useBalance } from '../../../hooks/useBalance';
import { styles } from './styles';

// Declaração de tipos para Phantom Wallet
declare global {
  interface Window {
    phantom?: {
      solana?: {
        getProfile?: () => Promise<{
          username?: string;
          avatar?: string;
        }>;
        request?: (params: any) => Promise<any>;
      };
    };
  }
}

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { publicKey, isConnected, disconnect } = usePhantom();
  const { balance, isLoading: balanceLoading } = useBalance(publicKey);
  const [walletName, setWalletName] = useState<string>('@usuário');
  const [userIconColor, setUserIconColor] = useState<string>('#AB9FF3');
  const [userInitial, setUserInitial] = useState<string>('U');
  const [phantomProfile, setPhantomProfile] = useState<any>(null);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  // Cores disponíveis para o ícone do usuário
  const iconColors = ['#AB9FF3', '#3271B8', '#E6474A'];

  useEffect(() => {
    const fetchPhantomProfile = async () => {
      if (publicKey) {
        try {
          // Para demonstração, vamos usar dados simulados
          // Em um ambiente real, você implementaria a integração com a Phantom API
          
          // Simulação de dados do perfil da Phantom
          const simulatedProfile = {
            username: 'RamboBalboa',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RamboBalboa&backgroundColor=6366f1'
          };

          setWalletName(`@${simulatedProfile.username}`);
          setUserInitial(simulatedProfile.username.charAt(0).toUpperCase());
          setPhantomProfile(simulatedProfile);
          
        } catch (error) {
          console.log('Erro ao buscar perfil:', error);
          
          // Fallback: usar endereço da wallet
          const shortAddress = publicKey.toString().slice(0, 6);
          setWalletName(`@${shortAddress}`);
          setUserInitial(shortAddress.charAt(0).toUpperCase());
          
          const colorIndex = publicKey.toString().charCodeAt(0) % iconColors.length;
          setUserIconColor(iconColors[colorIndex]);
        }
      }
    };

    fetchPhantomProfile();
  }, [publicKey]);

  const handleQRScan = () => {
    Alert.alert('QR Scanner', 'Funcionalidade de escaneamento será implementada');
    // onNavigate?.('QRScanner');
  };

  const handleNFC = () => {
    Alert.alert('NFC', 'Funcionalidade NFC será implementada');
    // onNavigate?.('NFCTransfer');
  };

  const handleReceive = () => {
    Alert.alert('Receber', 'Funcionalidade de recebimento será implementada');
    // onNavigate?.('Receive');
  };

  const handleCommunityBox = () => {
    Alert.alert('Caixa Comunitário', 'Funcionalidade do caixa comunitário será implementada');
    // onNavigate?.('CommunityBox');
  };

  // Nova função para o botão de scan no header
  const handleHeaderScan = () => {
    Alert.alert('Scan', 'Abrindo scanner...');
    // onNavigate?.('QRScanner');
  };

  // Função para abrir/fechar sidebar
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Função para realizar logout
  const handleLogout = () => {
    Alert.alert(
      'Desconectar Carteira', 
      'Tem certeza que deseja desconectar da Phantom Wallet?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setSidebarVisible(false)
        },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              setSidebarVisible(false);
              await disconnect();
              // Navegar para tela de conexão
              onNavigate?.('PhantomConnect');
            } catch (error) {
              console.error('Erro ao desconectar:', error);
              Alert.alert('Erro', 'Não foi possível desconectar da carteira');
            }
          }
        }
      ]
    );
  };

  // Função helper para formatar o saldo
  const formatBalance = (balance: any): string => {
    if (!balance) return '0.0000'; // Mudei para 0 para testar a lógica dinâmica
    
    // Se balance é um número
    if (typeof balance === 'number') {
      return balance.toFixed(4);
    }
    
    // Se balance tem propriedade balance
    if (balance.balance && typeof balance.balance === 'number') {
      return balance.balance.toFixed(4);
    }
    
    // Se balance tem propriedade value
    if (balance.value && typeof balance.value === 'number') {
      return balance.value.toFixed(4);
    }
    
    // Se balance é um objeto com método toString
    if (balance.toString && typeof balance.toString === 'function') {
      const numValue = parseFloat(balance.toString());
      return isNaN(numValue) ? '0.0000' : numValue.toFixed(4);
    }
    
    return '0.0000'; // Fallback para testar mensagem dinâmica
  };

  // Função helper para obter valor numérico do saldo
  const getBalanceValue = (balance: any): number => {
    if (!balance) return 0;
    
    if (typeof balance === 'number') {
      return balance;
    }
    
    if (balance.balance && typeof balance.balance === 'number') {
      return balance.balance;
    }
    
    if (balance.value && typeof balance.value === 'number') {
      return balance.value;
    }
    
    if (balance.toString && typeof balance.toString === 'function') {
      const numValue = parseFloat(balance.toString());
      return isNaN(numValue) ? 0 : numValue;
    }
    
    return 0;
  };

  const handleBalanceRefresh = () => {
    // A função de refresh já está implementada no hook useBalance
    Alert.alert('Saldo', 'Atualizando saldo...', [
      { text: 'OK', style: 'default' }
    ]);
    // Aqui você pode adicionar a lógica para realmente atualizar o saldo
    // Por exemplo: refetch do hook useBalance
  };

  if (!isConnected || !publicKey) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Conectando à wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* User Section - Agora clicável */}
          <TouchableOpacity 
            style={styles.userSection}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <View style={[styles.userIcon, { backgroundColor: userIconColor }]}>
              {phantomProfile?.avatar ? (
                <Image 
                  source={{ uri: phantomProfile.avatar }} 
                  style={styles.userAvatar}
                  onError={() => {
                    // Se a imagem falhar, volta para a inicial
                    setPhantomProfile(null);
                  }}
                />
              ) : (
                <Text style={styles.userInitial}>{userInitial}</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userHandle}>{walletName}</Text>
              <Text style={styles.accountText}>Conta 1</Text>
            </View>
          </TouchableOpacity>
          
          {/* Botão de Scan substituindo o expand */}
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={handleHeaderScan}
          >
            <Image 
              source={require('../../../../assets/icons/scanBranco.png')} 
              style={styles.scanIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Balance Section */}
        <TouchableOpacity 
          style={styles.balanceContainer}
          onPress={handleBalanceRefresh}
          disabled={balanceLoading}
          activeOpacity={0.8}
        >
          <View style={styles.balanceContent}>
            <View style={styles.balanceTopRow}>
              <View style={styles.balanceLeftSection}>
                <Image 
                  source={require('../../../../assets/icons/solana.png')} 
                  style={styles.solanaIcon}
                  resizeMode="contain"
                />
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.balanceLabel}>SALDO</Text>
              </View>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleBalanceRefresh}
                disabled={balanceLoading}
              >
                <Image 
                  source={require('../../../../assets/icons/refreshBranco.png')} 
                  style={styles.refreshIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.balanceAmount}>
            <Text style={styles.balanceValue}>
              {balanceLoading ? 'Carregando...' : `$ ${formatBalance(balance)} SOL`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Welcome Message Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeCardTitle}>
            Bem vindo, {walletName}
          </Text>
          <Text style={styles.welcomeCardSubtitle}>
            {getBalanceValue(balance) > 0 
              ? "Qual operação quer fazer hoje?"
              : "Adicione Solana (SOL) na sua carteira para começar"
            }
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleReceive}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>⊞</Text>
            </View>
            <Text style={styles.actionLabel}>Receber</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNFC}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>N</Text>
            </View>
            <Text style={styles.actionLabel}>NFC</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleQRScan}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>⤢</Text>
            </View>
            <Text style={styles.actionLabel}>Escanear</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCommunityBox}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>👥</Text>
            </View>
            <Text style={styles.actionLabel}>Fundos</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Content Area */}
        <View style={styles.additionalContent}>
          {/* Aqui você pode adicionar mais conteúdo conforme necessário */}
        </View>
      </ScrollView>

      {/* Sidebar Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setSidebarVisible(false)}
        >
          <View style={styles.sidebarContainer}>
            <Pressable onPress={() => {}} style={styles.sidebar}>
              {/* Header da Sidebar */}
              <View style={styles.sidebarHeader}>
                <View style={styles.sidebarUserInfo}>
                  <View style={[styles.sidebarUserIcon, { backgroundColor: userIconColor }]}>
                    {phantomProfile?.avatar ? (
                      <Image 
                        source={{ uri: phantomProfile.avatar }} 
                        style={styles.sidebarUserAvatar}
                      />
                    ) : (
                      <Text style={styles.sidebarUserInitial}>{userInitial}</Text>
                    )}
                  </View>
                  <View style={styles.sidebarUserDetails}>
                    <Text style={styles.sidebarUserName}>{walletName}</Text>
                    <Text style={styles.sidebarAccountText}>Conta 1</Text>
                    <Text style={styles.sidebarWalletAddress}>
                      {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Divisor */}
              <View style={styles.sidebarDivider} />

              {/* Opções da Sidebar */}
              <View style={styles.sidebarOptions}>
                <TouchableOpacity 
                  style={styles.sidebarOption}
                  onPress={handleLogout}
                >
                  <View style={styles.sidebarOptionIcon}>
                    <Text style={styles.sidebarOptionIconText}>🚪</Text>
                  </View>
                  <Text style={styles.sidebarOptionText}>Desconectar Carteira</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default HomeScreen;