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
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [showCreateDetails, setShowCreateDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [vaultConfig, setVaultConfig] = useState<any>(null);
  const [vaultDetails, setVaultDetails] = useState<any>(null);

  useEffect(() => {
    loadUserVaults();
  }, []);

  const loadUserVaults = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento
      setTimeout(() => {
        // Por enquanto deixar vazio para mostrar o estado empty
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

  // Navegação para tela de configuração
  const handleCreateVault = () => {
    setShowCreateConfig(true);
  };

  const handleConfigNext = (config: any) => {
    setVaultConfig(config);
    console.log('Configuração recebida:', config);
    
    // Avança diretamente para a segunda tela
    setShowCreateConfig(false);
    setShowCreateDetails(true);
  };

  const handleDetailsNext = (details: any) => {
    setVaultDetails(details);
    console.log('Detalhes recebidos:', details);
    
    // Temporário: volta ao menu principal
    Alert.alert(
      'Sucesso',
      'Etapa 2 concluída! Terceira etapa em desenvolvimento.',
      [{ text: 'OK', onPress: () => {
        setShowCreateDetails(false);
      }}]
    );
  };

  const handleDetailsBack = () => {
    // Volta da tela de detalhes para configuração
    setShowCreateDetails(false);
    setShowCreateConfig(true);
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

  // Se deve mostrar a tela de configuração (etapa 1)
  if (showCreateConfig) {
    return (
      <CreateVaultConfigScreen
        onBack={() => setShowCreateConfig(false)}
        onNext={handleConfigNext}
        publicKey={publicKey}
      />
    );
  }

  // Se deve mostrar a tela de detalhes (etapa 2)
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Header com ícone */}
      <View style={styles.header}>
        <Image 
          source={require('../../../../assets/icons/moneyBranco.png')} 
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>

      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Caixa comunitário</Text>
      </View>

      {/* Botões de ação */}
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

      {/* Linha divisória */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
      </View>

      {/* Área de conteúdo/lista de caixas */}
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
          // Lista de caixas quando houver
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
              
              {/* Indicador de regras de segurança */}
              <View style={styles.vaultSecurityBadge}>
                <Text style={styles.vaultSecurityText}>
                  🔒 Votação própria bloqueada
                </Text>
              </View>
            </TouchableOpacity>
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

      {/* Modal de Entrar no Caixa */}
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
            
            {/* Aviso sobre regra de votação */}
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