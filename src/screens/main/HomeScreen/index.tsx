// ========================================
// src/screens/main/HomeScreen/index.tsx
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  Image,
  Modal,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useBalance } from '../../../hooks/useBalance';
import { usePhantom } from '../../../hooks/usePhantom';
import NFCScreen from '../NFCScreen';
import QRReceiveScreen from '../QRReceiveScreen';
import QRPayScreen from '../QRPayScreen';
import CommunityVaultScreen from '../CommunityVault/index';
import CryptoBalanceCard from '../../../components/CryptoBalanceCard';
import { styles } from './styles';

interface HomeScreenProps {
  publicKey: PublicKey;
  disconnect: () => Promise<void>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ publicKey, disconnect }) => {
  const { balance, isLoading: balanceLoading, error, refreshBalance } = useBalance(publicKey);
  const { session } = usePhantom();
  const [walletName, setWalletName] = useState('@usuário');
  const [userIconColor, setUserIconColor] = useState('#AB9FF3');
  const [userInitial, setUserInitial] = useState('U');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showNFCScreen, setShowNFCScreen] = useState(false);
  const [showQRReceiveScreen, setShowQRReceiveScreen] = useState(false);
  const [showQRPayScreen, setShowQRPayScreen] = useState(false);
  const [showCommunityVaultScreen, setShowCommunityVaultScreen] = useState(false); // ✨ NOVO STATE
  const [isRefreshing, setIsRefreshing] = useState(false);

  const iconColors = ['#AB9FF3', '#3271B8', '#E6474A'];

  useEffect(() => {
    if (publicKey) {
      const shortAddress = publicKey.toString().slice(0, 6);
      setWalletName(`@${shortAddress}`);
      setUserInitial(shortAddress.charAt(0).toUpperCase());
      
      const colorIndex = publicKey.toString().charCodeAt(0) % iconColors.length;
      setUserIconColor(iconColors[colorIndex]);
    }
  }, [publicKey]);

  const handleQRScan = () => {
    setShowQRPayScreen(true);
  };

  const handleNFC = () => {
    setShowNFCScreen(true);
  };

  const handleReceive = () => {
    setShowQRReceiveScreen(true);
  };

  // ✨ FUNÇÃO ATUALIZADA - AGORA NAVEGA PARA A TELA DO CAIXA COMUNITÁRIO
  const handleCommunityBox = () => {
    setShowCommunityVaultScreen(true);
  };

  const handleHeaderScan = () => {
    Alert.alert('Scan', 'Abrindo scanner...');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

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
            } catch (error) {
              console.error('Erro ao desconectar:', error);
              Alert.alert('Erro', 'Não foi possível desconectar da carteira');
            }
          }
        }
      ]
    );
  };

  const formatBalance = (balance: any) => {
    if (!balance) return '0.0000';
    
    if (typeof balance === 'number') {
      return balance.toFixed(4);
    }
    
    if (balance.balance && typeof balance.balance === 'number') {
      return balance.balance.toFixed(4);
    }
    
    if (balance.value && typeof balance.value === 'number') {
      return balance.value.toFixed(4);
    }
    
    if (balance.toString && typeof balance.toString === 'function') {
      const numValue = parseFloat(balance.toString());
      return isNaN(numValue) ? '0.0000' : numValue.toFixed(4);
    }
    
    return '0.0000';
  };

  const getBalanceValue = (balance: any) => {
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

  // FUNÇÃO PARA ATUALIZAR SALDO (SEM ALERTS)
  const handleBalanceRefresh = async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Atualizando saldo...');
      
      await refreshBalance();
      
      console.log('✅ Saldo atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✨ NOVA VERIFICAÇÃO - RENDERIZAÇÃO CONDICIONAL DO CAIXA COMUNITÁRIO
  if (showCommunityVaultScreen) {
    return (
      <CommunityVaultScreen 
        onBack={() => setShowCommunityVaultScreen(false)} 
        publicKey={publicKey}
      />
    );
  }

  // Renderização condicional das outras telas
  if (showNFCScreen) {
    return <NFCScreen onBack={() => setShowNFCScreen(false)} />;
  }

  if (showQRReceiveScreen) {
    return <QRReceiveScreen onBack={() => setShowQRReceiveScreen(false)} publicKey={publicKey} />;
  }

  if (showQRPayScreen) {
    return <QRPayScreen onBack={() => setShowQRPayScreen(false)} publicKey={publicKey} session={session || undefined} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.userSection}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <View style={[styles.userIcon, { backgroundColor: userIconColor }]}>
              <Text style={styles.userInitial}>{userInitial}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userHandle}>{walletName}</Text>
              <Text style={styles.accountText}>Conta 1</Text>
            </View>
          </TouchableOpacity>
          
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

        <TouchableOpacity 
          style={styles.balanceContainer}
          onPress={handleBalanceRefresh}
          disabled={balanceLoading || isRefreshing}
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
              
              {/* BOTÃO DE REFRESH MELHORADO */}
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleBalanceRefresh}
                disabled={balanceLoading || isRefreshing}
              >
                {(balanceLoading || isRefreshing) ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Image 
                    source={require('../../../../assets/icons/refreshBranco.png')} 
                    style={styles.refreshIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* INDICADOR DE STATUS DO SALDO */}
          <View style={styles.balanceAmount}>
            <Text style={styles.balanceValue}>
              {balanceLoading || isRefreshing 
                ? 'Atualizando...' 
                : `$ ${formatBalance(balance)} SOL`
              }
            </Text>
          </View>
        </TouchableOpacity>

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleReceive}
          >
            <View style={styles.actionIconContainer}>
              <Image 
                source={require('../../../../assets/icons/qr-codeROXO.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionLabel}>Receber</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNFC}
          >
            <View style={styles.actionIconContainer}>
              <Image 
                source={require('../../../../assets/icons/nfcROXO.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionLabel}>NFC</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleQRScan}
          >
            <View style={styles.actionIconContainer}>
              <Image 
                source={require('../../../../assets/icons/scanROXO.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionLabel}>Escanear</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCommunityBox}
          >
            <View style={styles.actionIconContainer}>
              <Image 
                source={require('../../../../assets/icons/moneyROXO.png')}
                style={styles.actionIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionLabel}>Caixa{'\n'}Comunitário</Text>
          </TouchableOpacity>
        </View>

        {/* CARD DE CRIPTOMOEDAS */}
        <CryptoBalanceCard publicKey={publicKey} />

        <View style={styles.additionalContent}>
          {/* Espaço para conteúdo adicional */}
        </View>
      </ScrollView>

      {/* MODAL DO MENU LATERAL */}
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
              <View style={styles.sidebarHeader}>
                <View style={styles.sidebarUserInfo}>
                  <View style={[styles.sidebarUserIcon, { backgroundColor: userIconColor }]}>
                    <Text style={styles.sidebarUserInitial}>{userInitial}</Text>
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

              <View style={styles.sidebarDivider} />

              <View style={styles.sidebarOptions}>
                <TouchableOpacity 
                  style={styles.sidebarOption}
                  onPress={handleLogout}
                >
                  <View style={styles.sidebarOptionIcon}>
                    <Image 
                      source={require('../../../../assets/icons/sairBranco.png')}
                      style={[styles.sidebarOptionIconImage, { transform: [{ scaleX: -1 }] }]}
                      resizeMode="contain"
                    />
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