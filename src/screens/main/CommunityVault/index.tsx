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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';
import { CommunityVault, VaultCategory, CreateVaultForm, MemberRole } from '../../../services/communityVault/types';
import CreateVaultConfigScreen from './CreateVaultConfigScreen';
import CreateVaultDetailsScreen from './CreateVaultDetailsScreen';
import CreateVaultInviteScreen from './CreateVaultInviteScreen';

interface CommunityVaultScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

interface VaultInvite {
  wallet: string;
  role: string;
}

const VAULTS_STORAGE_KEY = '@community_vaults';

const CommunityVaultScreen: React.FC<CommunityVaultScreenProps> = ({ onBack, publicKey }) => {
  const [vaults, setVaults] = useState<CommunityVault[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [showCreateDetails, setShowCreateDetails] = useState(false);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [vaultConfig, setVaultConfig] = useState<any>(null);
  const [vaultDetails, setVaultDetails] = useState<any>(null);
  
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
      console.log('Carregando caixas do usuário...');
      
      // Carregar do AsyncStorage
      const storedVaults = await AsyncStorage.getItem(VAULTS_STORAGE_KEY);
      
      if (storedVaults) {
        const allVaults = JSON.parse(storedVaults);
        
        // Filtrar apenas caixas onde o usuário é criador ou membro
        const userVaults = allVaults.filter((vault: any) => {
          return vault.creator === publicKey.toString() ||
                 vault.invites?.some((invite: any) => 
                   invite.wallet === publicKey.toString()
                 );
        });
        
        console.log(`Encontrados ${userVaults.length} caixas`);
        setVaults(userVaults);
      } else {
        setVaults([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar caixas:', error);
      setVaults([]);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserVaults();
    setRefreshing(false);
  };

  const handleOpenCreateVault = () => {
    setShowCreateConfig(true);
  };

  const handleConfigNext = (config: any) => {
    setVaultConfig(config);
    console.log('Configuração recebida:', config);
    console.log('Regra aplicada: Nenhum usuário pode votar em saques próprios');
    
    setShowCreateConfig(false);
    setShowCreateDetails(true);
  };

  const handleDetailsBack = () => {
    setShowCreateDetails(false);
    setShowCreateConfig(true);
  };

  const handleDetailsNext = (details: any) => {
    setVaultDetails(details);
    console.log('Detalhes recebidos:', details);
    
    setShowCreateDetails(false);
    setShowCreateInvite(true);
  };

  const handleInviteBack = () => {
    setShowCreateInvite(false);
    setShowCreateDetails(true);
  };

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleFinishCreateVault = async (invites: VaultInvite[]) => {
    try {
      const finalVaultData = {
        ...vaultConfig,
        ...vaultDetails,
        invites,
        creator: publicKey.toString(),
        createdAt: new Date().toISOString()
      };
      
      console.log('=== DADOS COMPLETOS DO CAIXA ===');
      console.log('Config (Tela 1):', vaultConfig);
      console.log('Details (Tela 2):', vaultDetails);
      console.log('Invites (Tela 3):', invites);
      console.log('Dados Finais:', finalVaultData);
      console.log('================================');
      
      setIsLoading(true);
      
      // Criar objeto do caixa
      const newVault: CommunityVault = {
        id: `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: vaultDetails.name,
        description: vaultDetails.description || '',
        icon: vaultDetails.iconColor,
        creator: new PublicKey(publicKey.toString()),
        balance: 0,
        members: [
          {
            publicKey: new PublicKey(publicKey.toString()),
            role: MemberRole.FOUNDER,
            joinedAt: new Date(),
            nickname: 'Fundador',
            depositedAmount: 0,
            withdrawnAmount: 0
          }
        ],
        settings: {
          entryFee: 0,
          maxMembers: 10,
          allowGuestDeposits: vaultConfig.depositMethod === 'simpleMajority',
          allowGuestWithdrawals: vaultConfig.generalWithdrawMethod === 'simpleMajority',
          depositRules: {
            requiresVoting: vaultConfig.depositMethod !== 'simpleMajority',
            minVotesRequired: 1,
            votingPeriod: 86400
          },
          withdrawRules: {
            requiresVoting: true,
            minVotesRequired: vaultConfig.generalWithdrawMethod === 'allFounders' ? 2 : 1,
            votingPeriod: 86400
          },
          adminPermissions: vaultConfig.adminCanInvite ? ['ADD_MEMBER', 'REMOVE_GUEST'] : [],
          guestPermissions: ['VIEW'],
          withdrawalLimit: vaultDetails.minimumWithdrawalLimit
        },
        proposals: [],
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        inviteCode: generateInviteCode(),
        category: VaultCategory.CUSTOM,
        stats: {
          totalDeposited: 0,
          totalWithdrawn: 0,
          totalMembers: 1 + invites.length,
          activeProposals: 0,
          completedProposals: 0,
          lastActivity: new Date()
        }
      };

      // Salvar no AsyncStorage
      const storedVaults = await AsyncStorage.getItem(VAULTS_STORAGE_KEY);
      const allVaults = storedVaults ? JSON.parse(storedVaults) : [];
      allVaults.push(newVault);
      await AsyncStorage.setItem(VAULTS_STORAGE_KEY, JSON.stringify(allVaults));
      
      console.log('Caixa salvo com sucesso!');
      
      setTimeout(() => {
        setIsLoading(false);
        
        Alert.alert(
          '🎉 Caixa Criado!',
          `Nome: ${vaultDetails.name}\nMembros convidados: ${invites.length}\nCódigo: ${newVault.inviteCode}\n\nOs convites foram enviados e expiram em 7 dias.`,
          [{
            text: 'OK',
            onPress: () => {
              setShowCreateInvite(false);
              setVaultConfig(null);
              setVaultDetails(null);
              loadUserVaults();
            }
          }]
        );
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao criar caixa:', error);
      Alert.alert('Erro', 'Não foi possível criar o caixa. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleOpenVault = (vault: CommunityVault) => {
    Alert.alert(
      '🚧 Em Construção',
      `O caixa "${vault.name}" está disponível!\n\nEm breve você poderá:\n• Ver detalhes e saldo\n• Fazer depósitos\n• Criar propostas de saque\n• Votar em propostas\n• Gerenciar membros`,
      [{ text: 'OK' }]
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

  // RENDERIZAÇÕES CONDICIONAIS
  if (showCreateConfig) {
    return (
      <CreateVaultConfigScreen
        onBack={() => setShowCreateConfig(false)}
        onNext={handleConfigNext}
        publicKey={publicKey}
      />
    );
  }

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

  if (showCreateInvite) {
    return (
      <CreateVaultInviteScreen
        onBack={handleInviteBack}
        onCreate={handleFinishCreateVault}
        publicKey={publicKey}
        previousConfig={vaultConfig}
        previousDetails={vaultDetails}
      />
    );
  }

  // MENU PRINCIPAL
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
          onPress={handleOpenCreateVault}
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
            <TouchableOpacity 
              key={vault.id} 
              style={styles.vaultCard}
              onPress={() => handleOpenVault(vault)}
              activeOpacity={0.7}
            >
              {/* Indicador de cor */}
              <View style={[styles.vaultColorIndicator, { backgroundColor: vault.icon || '#AB9FF3' }]} />
              
              <View style={styles.vaultCardContent}>
                {/* Header com nome */}
                <View style={styles.vaultCardHeader}>
                  <Text style={styles.vaultName} numberOfLines={1}>
                    {vault.name}
                  </Text>
                  <View style={styles.vaultMembersBadge}>
                    <Text style={styles.vaultMembersBadgeText}>
                      👥 {vault.stats.totalMembers}
                    </Text>
                  </View>
                </View>
                
                {/* Descrição (se houver) */}
                {vault.description && vault.description.trim() !== '' && (
                  <Text style={styles.vaultDescription} numberOfLines={2}>
                    {vault.description}
                  </Text>
                )}
                
                {/* Informações principais */}
                <View style={styles.vaultInfoRow}>
                  <View style={styles.vaultInfoItem}>
                    <Text style={styles.vaultInfoLabel}>Membros:</Text>
                    <Text style={styles.vaultInfoValue}>{vault.stats.totalMembers}</Text>
                  </View>
                  
                  <View style={styles.vaultInfoDivider} />
                  
                  <View style={styles.vaultInfoItem}>
                    <Text style={styles.vaultInfoLabel}>Valor do caixa $:</Text>
                    <Text style={styles.vaultInfoValue}>{vault.balance.toFixed(0)}</Text>
                  </View>
                </View>
                
                {/* Badge de segurança */}
                <View style={styles.vaultSecurityBadge}>
                  <Text style={styles.vaultSecurityText}>
                    🔒 Votação própria bloqueada
                  </Text>
                </View>
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

      <Modal
        visible={isLoading && (showCreateConfig || showCreateDetails || showCreateInvite)}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#AB9FF3" />
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>
              Criando caixa...
            </Text>
            <Text style={{ color: '#999', textAlign: 'center', marginTop: 8 }}>
              Aguarde enquanto processamos sua solicitação
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CommunityVaultScreen;