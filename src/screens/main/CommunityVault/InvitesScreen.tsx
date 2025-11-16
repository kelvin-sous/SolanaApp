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
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { PublicKey } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import { styles } from './invitesStyles';
import { FirebaseService, VaultInvite } from '../../../services/firebase/FirebaseService';

interface InvitesScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

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
      console.log('=== CARREGANDO CONVITES DO FIREBASE ===');
      console.log('Minha wallet:', myWallet);

      const firebaseInvites = await FirebaseService.getUserInvites(myWallet);

      console.log(`Convites encontrados: ${firebaseInvites.length}`);
      setInvites(firebaseInvites);
      console.log('=======================================');
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
      console.log('Vault ID:', invite.vaultId);

      // 1. Buscar o caixa NO FIREBASE
      const vaultDoc = await firestore()
        .collection('vaults')
        .doc(invite.vaultId)
        .get();

      if (!vaultDoc.exists) {
        throw new Error('Caixa não encontrado no Firebase');
      }

      const vaultData = vaultDoc.data();
      console.log('Caixa encontrado no Firebase:', vaultData?.name);

      // 2. Adicionar usuário aos membros do caixa no Firebase
      const myWallet = publicKey.toString();

      await firestore()
        .collection('vaults')
        .doc(invite.vaultId)
        .update({
          members: firestore.FieldValue.arrayUnion(myWallet),
          [`memberRoles.${myWallet}`]: invite.role,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });

      console.log('Membro adicionado ao caixa no Firebase');

      // 3. Atualizar status do convite no Firebase
      if (invite.id) {
        await FirebaseService.acceptInvite(invite.id);
        console.log('Status do convite atualizado no Firebase');
      }

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

              // Atualizar status do convite no Firebase
              if (invite.id) {
                await FirebaseService.rejectInvite(invite.id);
                console.log('Status do convite atualizado no Firebase');
              }

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
        {isLoading && invites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#AB9FF3" />
            <Text style={styles.emptyText}>Carregando convites...</Text>
          </View>
        ) : invites.length === 0 ? (
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