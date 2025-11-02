// src/screens/main/CommunityVault/InvitesScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import { styles } from './invitesStyles';

interface InvitesScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

interface VaultInvite {
  id: string;
  vaultId: string;
  vaultName: string;
  vaultColor: string;
  inviterWallet: string;
  invitedWallet: string;
  role: string;
  members: number;
  balance: number;
  invitedAt: Date;
  expiresAt: Date;
  status?: string;
}

const INVITES_STORAGE_KEY = 'vault_invites';
const VAULTS_STORAGE_KEY = 'community_vaults';

const InvitesScreen: React.FC<InvitesScreenProps> = ({ onBack, publicKey }) => {
  const [invites, setInvites] = useState<VaultInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [acceptedVaultName, setAcceptedVaultName] = useState('');

  useEffect(() => {
    loadInvites();
  }, []);

  const formatWallet = (wallet: string) => {
    if (wallet.length <= 8) return wallet;
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const loadInvites = async () => {
    setIsLoading(true);
    try {
      const myWallet = publicKey.toString();
      console.log('=== CARREGANDO CONVITES ===');
      console.log('Minha wallet:', myWallet);
      
      const storedInvites = await SecureStore.getItemAsync(INVITES_STORAGE_KEY);
      console.log('Storage existe?', !!storedInvites);
      
      if (storedInvites) {
        const allInvites = JSON.parse(storedInvites);
        console.log(`Total de convites no storage: ${allInvites.length}`);
        
        // Mostrar todos os convites para debug
        allInvites.forEach((inv: any, index: number) => {
          console.log(`Convite ${index + 1}:`);
          console.log(`  - Caixa: ${inv.vaultName}`);
          console.log(`  - Para: ${inv.invitedWallet}`);
          console.log(`  - Status: ${inv.status}`);
          console.log(`  - É meu? ${inv.invitedWallet === myWallet}`);
          console.log(`  - Está pendente? ${inv.status === 'pending'}`);
        });
        
        // Filtrar convites para o usuário atual e converter datas
        const userInvites = allInvites
          .filter((invite: any) => {
            const isForMe = invite.invitedWallet === myWallet;
            const isPending = invite.status === 'pending';
            return isForMe && isPending;
          })
          .map((invite: any) => ({
            ...invite,
            invitedAt: new Date(invite.invitedAt),
            expiresAt: new Date(invite.expiresAt)
          }));
        
        console.log(`Convites filtrados para mim: ${userInvites.length}`);
        setInvites(userInvites);
      } else {
        console.log('Nenhum convite encontrado no storage');
        setInvites([]);
      }
      console.log('===========================');
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      setInvites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (invite: VaultInvite) => {
    try {
      setIsLoading(true);
      
      console.log('=== ACEITANDO CONVITE ===');
      console.log('Convite:', invite.vaultName);
      
      // 1. Buscar o caixa
      const storedVaults = await SecureStore.getItemAsync(VAULTS_STORAGE_KEY);
      
      if (!storedVaults) {
        throw new Error('Caixa não encontrado');
      }
      
      const allVaults = JSON.parse(storedVaults);
      const vaultIndex = allVaults.findIndex((v: any) => v.id === invite.vaultId);
      
      if (vaultIndex === -1) {
        throw new Error('Caixa não encontrado');
      }
      
      console.log('Caixa encontrado:', allVaults[vaultIndex].name);
      
      // 2. Adicionar usuário aos membros do caixa
      const newMember = {
        publicKey: publicKey.toString(),
        role: invite.role,
        joinedAt: new Date().toISOString(),
        nickname: formatWallet(publicKey.toString()),
        depositedAmount: 0,
        withdrawnAmount: 0
      };
      
      allVaults[vaultIndex].members = allVaults[vaultIndex].members || [];
      allVaults[vaultIndex].members.push(newMember);
      allVaults[vaultIndex].stats.totalMembers += 1;
      allVaults[vaultIndex].updatedAt = new Date().toISOString();
      
      console.log('Membro adicionado ao caixa');
      console.log('Total de membros agora:', allVaults[vaultIndex].stats.totalMembers);
      
      // Salvar caixa atualizado
      await SecureStore.setItemAsync(VAULTS_STORAGE_KEY, JSON.stringify(allVaults));
      console.log('Caixa atualizado no storage');
      
      // 3. Atualizar status do convite para 'accepted'
      const storedInvites = await SecureStore.getItemAsync(INVITES_STORAGE_KEY);
      const allInvites = storedInvites ? JSON.parse(storedInvites) : [];
      
      const updatedInvites = allInvites.map((inv: any) => 
        inv.id === invite.id 
          ? { ...inv, status: 'accepted', acceptedAt: new Date().toISOString() }
          : inv
      );
      
      await SecureStore.setItemAsync(INVITES_STORAGE_KEY, JSON.stringify(updatedInvites));
      console.log('Status do convite atualizado para "accepted"');
      
      // 4. Remover da lista local
      const remainingInvites = invites.filter(i => i.id !== invite.id);
      setInvites(remainingInvites);
      
      console.log('Convite aceito com sucesso!');
      console.log('=========================');
      
      // Mostrar modal de sucesso
      setAcceptedVaultName(invite.vaultName);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      Alert.alert('Erro', 'Não foi possível aceitar o convite. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async (invite: VaultInvite) => {
    Alert.alert(
      'Recusar Convite',
      `Tem certeza que deseja recusar o convite para "${invite.vaultName}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              console.log('=== RECUSANDO CONVITE ===');
              console.log('Convite:', invite.vaultName);
              
              // Atualizar status do convite para 'rejected'
              const storedInvites = await SecureStore.getItemAsync(INVITES_STORAGE_KEY);
              const allInvites = storedInvites ? JSON.parse(storedInvites) : [];
              
              const updatedInvites = allInvites.map((inv: any) => 
                inv.id === invite.id 
                  ? { ...inv, status: 'rejected', rejectedAt: new Date().toISOString() }
                  : inv
              );
              
              await SecureStore.setItemAsync(INVITES_STORAGE_KEY, JSON.stringify(updatedInvites));
              console.log('Status do convite atualizado para "rejected"');
              
              // Remover da lista local
              const remainingInvites = invites.filter(i => i.id !== invite.id);
              setInvites(remainingInvites);
              
              console.log('Convite recusado com sucesso!');
              console.log('=========================');
              
            } catch (error) {
              console.error('Erro ao recusar convite:', error);
              Alert.alert('Erro', 'Não foi possível recusar o convite.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setAcceptedVaultName('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../../../assets/icons/moneyBranco.png')} 
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Convites</Text>
      </View>

      <View style={styles.divider} />

      {/* Lista de Convites */}
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {invites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../../../assets/icons/phantom.png')}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>
              Você ainda não tem convites para caixas comunitários
            </Text>
          </View>
        ) : (
          invites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              {/* Círculo colorido */}
              <View style={[styles.vaultCircle, { backgroundColor: invite.vaultColor }]} />
              
              {/* Informações do convite */}
              <View style={styles.inviteInfo}>
                <Text style={styles.vaultName} numberOfLines={1}>
                  {invite.vaultName}
                </Text>
                
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    <Text style={styles.statLabel}>Membros: </Text>
                    <Text style={styles.statValue}>{invite.members}</Text>
                  </Text>
                  
                  <Text style={styles.statText}>
                    <Text style={styles.statLabel}>Valor do caixa $: </Text>
                    <Text style={styles.statValue}>{invite.balance}</Text>
                  </Text>
                </View>
                
                {/* Botões de Ação */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleRejectInvite(invite)}
                    disabled={isLoading}
                  >
                    <Text style={styles.rejectButtonText}>Recusar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptInvite(invite)}
                    disabled={isLoading}
                  >
                    <Text style={styles.acceptButtonText}>Aceitar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botão Voltar */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Sucesso */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Você entrou em "{acceptedVaultName}"
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InvitesScreen;