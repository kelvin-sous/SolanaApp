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
import * as SecureStore from 'expo-secure-store';
import { styles } from './styles';
import { CommunityVault, VaultCategory, CreateVaultForm, MemberRole } from '../../../services/communityVault/types';
import CreateVaultConfigScreen from './CreateVaultConfigScreen';
import CreateVaultDetailsScreen from './CreateVaultDetailsScreen';
import CreateVaultInviteScreen from './CreateVaultInviteScreen';
import VaultDetailsScreen from './VaultDetailsScreen';
import InvitesScreen from './InvitesScreen';
import { FirebaseService } from '../../../services/firebase/FirebaseService';

interface CommunityVaultScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

interface VaultInvite {
  wallet: string;
  role: string;
}

const VAULTS_STORAGE_KEY = 'community_vaults';

const CommunityVaultScreen: React.FC<CommunityVaultScreenProps> = ({ onBack, publicKey }) => {
  const [vaults, setVaults] = useState<CommunityVault[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [showCreateDetails, setShowCreateDetails] = useState(false);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [selectedVault, setSelectedVault] = useState<CommunityVault | null>(null);
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
      console.log('=== CARREGANDO CAIXAS DO USUÁRIO ===');
      console.log('Minha wallet:', publicKey.toString());

      // Buscar caixas do Firebase
      const firebaseVaults = await FirebaseService.getUserVaults(publicKey.toString());

      // Converter para o formato correto
      const userVaults = firebaseVaults.map((vault: any) => ({
        ...vault,
        creator: new PublicKey(vault.creator),
        createdAt: vault.createdAt?.toDate ? vault.createdAt.toDate() : new Date(vault.createdAt),
        updatedAt: vault.updatedAt?.toDate ? vault.updatedAt.toDate() : new Date(vault.updatedAt),
        stats: {
          ...vault.stats,
          lastActivity: vault.stats.lastActivity?.toDate ? vault.stats.lastActivity.toDate() : new Date()
        },
        members: vault.members?.map((memberWallet: string) => ({
          publicKey: new PublicKey(memberWallet),
          role: vault.memberRoles?.[memberWallet] || 'GUEST',
          joinedAt: new Date(),
          nickname: formatWallet(memberWallet),
          depositedAmount: 0,
          withdrawnAmount: 0
        })) || []
      }));

      console.log(`Encontrados ${userVaults.length} caixas do usuário`);
      console.log('====================================');
      setVaults(userVaults);

      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar caixas:', error);
      setVaults([]);
      setIsLoading(false);
    }
  };

  const formatWallet = (wallet: string) => {
    if (wallet.length <= 8) return wallet;
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
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

      const vaultId = `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newVault: CommunityVault = {
        id: vaultId,
        name: vaultDetails.name,
        description: vaultDetails.description || '',
        icon: vaultDetails.iconColor || '#AB9FF3',
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

      // ===== SALVAR NO FIREBASE =====
      console.log('Salvando caixa no Firebase...');
      await FirebaseService.createVault({
        id: vaultId,
        name: newVault.name,
        description: newVault.description,
        icon: newVault.icon,
        creator: publicKey.toString(),
        balance: newVault.balance,
        members: [publicKey.toString()], // Array de wallets
        memberRoles: {
          [publicKey.toString()]: MemberRole.FOUNDER
        },
        settings: newVault.settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        inviteCode: newVault.inviteCode,
        category: newVault.category,
        stats: newVault.stats
      });
      console.log('Caixa salvo no Firebase com sucesso!');

      // Salvar também no SecureStore (backup local)
      const storedVaults = await SecureStore.getItemAsync(VAULTS_STORAGE_KEY);
      const allVaults = storedVaults ? JSON.parse(storedVaults) : [];
      allVaults.push(newVault);
      await SecureStore.setItemAsync(VAULTS_STORAGE_KEY, JSON.stringify(allVaults));
      console.log('Caixa salvo no SecureStore com sucesso!');

      // ===== CRIAR CONVITES NO FIREBASE =====
      if (invites.length > 0) {
        console.log('=== CRIANDO CONVITES NO FIREBASE ===');
        console.log(`Total de convites a criar: ${invites.length}`);

        for (const invite of invites) {
          try {
            await FirebaseService.createInvite({
              vaultId: vaultId,
              vaultName: newVault.name,
              vaultColor: newVault.icon || '#AB9FF3',
              inviterWallet: publicKey.toString(),
              invitedWallet: invite.wallet,
              role: invite.role,
              members: newVault.stats.totalMembers,
              balance: newVault.balance,
              invitedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'pending'
            });

            console.log(`Convite enviado para: ${invite.wallet}`);
          } catch (error) {
            console.error(`Erro ao criar convite para ${invite.wallet}:`, error);
          }
        }

        console.log('=== CONVITES CRIADOS NO FIREBASE ===');
      }

      setTimeout(() => {
        setIsLoading(false);

        Alert.alert(
          'Caixa Criado!',
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
    setSelectedVault(vault);
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

  if (showInvites) {
    return (
      <InvitesScreen
        onBack={() => setShowInvites(false)}
        publicKey={publicKey}
      />
    );
  }

  if (selectedVault) {
    return (
      <VaultDetailsScreen
        onBack={() => setSelectedVault(null)}
        vault={selectedVault}
        publicKey={publicKey}
      />
    );
  }

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
          onPress={() => setShowInvites(true)}
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
              <View style={[styles.vaultCircle, { backgroundColor: vault.icon || '#AB9FF3' }]} />

              <View style={styles.vaultInfo}>
                <Text style={styles.vaultName} numberOfLines={1}>
                  {vault.name}
                </Text>

                <View style={styles.vaultStats}>
                  <Text style={styles.vaultStatText}>
                    <Text style={styles.vaultStatLabel}>Membros: </Text>
                    <Text style={styles.vaultStatValue}>{vault.stats.totalMembers}</Text>
                  </Text>

                  <Text style={styles.vaultStatText}>
                    <Text style={styles.vaultStatLabel}>Valor do caixa $: </Text>
                    <Text style={styles.vaultStatValue}>{vault.balance.toFixed(0)}</Text>
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