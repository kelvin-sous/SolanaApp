// src/screens/main/CommunityVault/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
  RefreshControl
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { styles } from './styles';
import { CommunityVault, VaultCategory, CreateVaultForm } from '../../../services/communityVault/types';
import CreateVaultConfigScreen from './CreateVaultConfigScreen';
import CreateVaultDetailsScreen from './CreateVaultDetailsScreen';

interface CommunityVaultScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

const CommunityVaultScreen: React.FC<CommunityVaultScreenProps> = ({ onBack, publicKey }) => {
  const [vaults, setVaults] = useState<CommunityVault[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [showCreateDetails, setShowCreateDetails] = useState(false); // NOVO ESTADO
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [vaultConfig, setVaultConfig] = useState<any>(null);
  
  const [createForm, setCreateForm] = useState<CreateVaultForm>({
    name: '',
    description: '',
    icon: '💰',
    category: VaultCategory.CUSTOM,
    entryFee: 0,
    maxMembers: 10,
    requiresVotingForWithdraw: true,
    minVotesForWithdraw: 2,
    withdrawalLimit: undefined
  });

  useEffect(() => {
    loadUserVaults();
  }, []);

  const loadUserVaults = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setVaults([]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar caixas:', error);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserVaults();
    setRefreshing(false);
  };

  const handleCreateVault = () => {
    setShowCreateConfig(true);
  };

  // MÉTODO CORRIGIDO - Avança para a próxima tela
  const handleConfigNext = (config: any) => {
    setVaultConfig(config);
    console.log('Configuração recebida:', config);
    console.log('Regra aplicada: Nenhum usuário pode votar em saques próprios');
    
    // Fechar tela de config e abrir tela de detalhes
    setShowCreateConfig(false);
    setShowCreateDetails(true);
  };

  // NOVO MÉTODO - Voltar da tela de detalhes para config
  const handleDetailsBack = () => {
    setShowCreateDetails(false);
    setShowCreateConfig(true);
  };

  // NOVO MÉTODO - Avançar da tela de detalhes (finalizar criação)
  const handleDetailsNext = (details: any) => {
    console.log('Detalhes recebidos:', details);
    
    const finalVaultData = {
      ...vaultConfig,
      ...details
    };
    
    console.log('Dados completos do caixa:', finalVaultData);
    
    Alert.alert(
      'Caixa Criado!', 
      'Seu caixa comunitário foi configurado com sucesso!',
      [{ 
        text: 'OK', 
        onPress: () => {
          setShowCreateDetails(false);
          // Aqui você pode chamar a função de criar o caixa na blockchain
          // createVault(finalVaultData);
        }
      }]
    );
  };

  const handleJoinVault = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erro', 'Digite o código do convite');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Entrando no caixa com código:', inviteCode);
      setTimeout(() => {
        Alert.alert('Sucesso', 'Você entrou no caixa!');
        setShowJoinModal(false);
        setInviteCode('');
        loadUserVaults();
      }, 1500);
    } catch (error) {
      Alert.alert('Erro', 'Código inválido ou expirado');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      icon: '💰',
      category: VaultCategory.CUSTOM,
      entryFee: 0,
      maxMembers: 10,
      requiresVotingForWithdraw: true,
      minVotesForWithdraw: 2,
      withdrawalLimit: undefined
    });
  };

  const getCategoryIcon = (category: VaultCategory) => {
    const icons = {
      [VaultCategory.PARTY]: '🎉',
      [VaultCategory.TRAVEL]: '✈️',
      [VaultCategory.INVESTMENT]: '📈',
      [VaultCategory.EMERGENCY]: '🚨',
      [VaultCategory.SAVINGS]: '🏦',
      [VaultCategory.CUSTOM]: '💰'
    };
    return icons[category];
  };

  const getCategoryName = (category: VaultCategory) => {
    const names = {
      [VaultCategory.PARTY]: 'Festa/Evento',
      [VaultCategory.TRAVEL]: 'Viagem',
      [VaultCategory.INVESTMENT]: 'Investimento',
      [VaultCategory.EMERGENCY]: 'Emergência',
      [VaultCategory.SAVINGS]: 'Poupança',
      [VaultCategory.CUSTOM]: 'Personalizado'
    };
    return names[category];
  };

  // RENDERIZAÇÃO CONDICIONAL CORRIGIDA - ORDEM CORRETA
  // 1. Primeiro: Tela de Configuração (Tela 1)
  if (showCreateConfig) {
    return (
      <CreateVaultConfigScreen
        onBack={() => setShowCreateConfig(false)}
        onNext={handleConfigNext}
        publicKey={publicKey}
      />
    );
  }

  // 2. Segundo: Tela de Detalhes (Tela 2)
  if (showCreateDetails) {
    return (
      <CreateVaultDetailsScreen
        onBack={handleDetailsBack}
        onNext={handleDetailsNext}
        publicKey={publicKey}
        previousConfig={vaultConfig}
      />
    );
  }

  // 3. Por último: Menu principal do caixa
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      <View style={styles.header}>
        <Image 
          source={require('../../../../assets/icons/moneyBranco.png')} 
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Caixa comunitário</Text>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleCreateVault}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.iconCircle}>
              <Image 
                source={require('../../../../assets/icons/adicionar.png')}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionButtonText}>Criar caixa</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowJoinModal(true)}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.iconCircle}>
              <Image 
                source={require('../../../../assets/icons/convite.png')}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionButtonText}>Convites</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
      </View>

      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.contentContainerStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#AB9FF3"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading && vaults.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AB9FF3" />
            <Text style={styles.loadingText}>Carregando caixas...</Text>
          </View>
        ) : vaults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../../../assets/icons/phantom.png')}
              style={styles.phantomIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>
              Você ainda não possui{'\n'}nenhum caixa comunitário
            </Text>
          </View>
        ) : (
          vaults.map((vault) => (
            <TouchableOpacity key={vault.id} style={styles.vaultCard}>
              <View style={styles.vaultCardHeader}>
                <Text style={styles.vaultIcon}>{vault.icon}</Text>
                <View style={styles.vaultInfo}>
                  <Text style={styles.vaultName}>{vault.name}</Text>
                  <Text style={styles.vaultDescription}>{vault.description}</Text>
                </View>
                <View style={styles.vaultBalance}>
                  <Text style={styles.vaultBalanceLabel}>Saldo</Text>
                  <Text style={styles.vaultBalanceValue}>{vault.balance.toFixed(2)} SOL</Text>
                </View>
              </View>
              
              <View style={styles.vaultSecurityBadge}>
                <Text style={styles.vaultSecurityText}>
                  🔒 Votação própria bloqueada
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Entrar em um Caixa</Text>
            
            <Text style={styles.inputLabel}>Código do Convite</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o código"
              placeholderTextColor="#666"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />
            
            <View style={styles.securityNote}>
              <Text style={styles.securityNoteText}>
                ℹ️ Regra de segurança: Membros não podem votar em saques próprios
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
                onPress={handleJoinVault}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CommunityVaultScreen;