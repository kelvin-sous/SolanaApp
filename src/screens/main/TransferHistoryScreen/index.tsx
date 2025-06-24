// ========================================
// src/screens/main/TransferHistoryScreen/index.tsx
// Tela de histórico de transferências baseada no Figma
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useTransfers } from '../../../hooks/useTransfers';
import { styles } from './styles';

interface TransferHistoryScreenProps {
  onBack: () => void;
  publicKey: PublicKey;
}

const TransferHistoryScreen: React.FC<TransferHistoryScreenProps> = ({ onBack, publicKey }) => {
  const { transfers, isLoading, error, stats, refreshTransfers } = useTransfers(publicKey, {
    limit: 50
  });

  const [userInitial, setUserInitial] = useState('U');
  const [userIconColor, setUserIconColor] = useState('#AB9FF3');

  const iconColors = ['#AB9FF3', '#3271B8', '#E6474A'];

  useEffect(() => {
    if (publicKey) {
      const shortAddress = publicKey.toString().slice(0, 6);
      setUserInitial(shortAddress.charAt(0).toUpperCase());
      
      const colorIndex = publicKey.toString().charCodeAt(0) % iconColors.length;
      setUserIconColor(iconColors[colorIndex]);
    }
  }, [publicKey]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✨ FUNÇÃO ATUALIZADA: Formata endereço da carteira
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatAmount = (amount: number): string => {
    return `${amount.toFixed(4)} SOL`;
  };

  const getTransferTypeLabel = (type: string): string => {
    switch (type) {
      case 'send': return 'Enviado';
      case 'receive': return 'Recebido';
      case 'nfc': return 'NFC';
      default: return type;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return '#00D4AA';
      case 'pending': return '#F59E0B';
      case 'failed': return '#FF6B6B';
      default: return '#888888';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshTransfers();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar as transferências');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* ✨ HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.userSection}
            activeOpacity={0.7}
          >
            <View style={[styles.userIcon, { backgroundColor: userIconColor }]}>
              <Text style={styles.userInitial}>{userInitial}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userHandle}>@usuário</Text>
              <Text style={styles.accountText}>Conta 1</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
          >
            <Image 
              source={require('../../../../assets/icons/sairBranco.png')} 
              style={[styles.backIcon, { transform: [{ scaleX: -1 }] }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ✨ CONTEÚDO PRINCIPAL */}
      <View style={styles.content}>
        {/* Ícone e Título */}
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../../../assets/icons/declaracao.png')}
              style={styles.titleIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Transferências</Text>
        </View>

        {/* Lista de Transferências */}
        {isLoading && transfers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AB9FF3" />
            <Text style={styles.loadingText}>Carregando transferências...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Erro: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : transfers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhuma transferência</Text>
            <Text style={styles.emptySubtitle}>
              Suas transferências aparecerão aqui
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.transfersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor="#AB9FF3"
              />
            }
          >
            {transfers.map((transfer) => (
              <View key={transfer.id} style={styles.transferItem}>
                <View style={styles.transferLeft}>
                  {/* ✨ MUDANÇA PRINCIPAL: Mostra endereços reais das carteiras */}
                  <Text style={styles.transferType}>
                    De: {formatAddress(transfer.from_address)}
                  </Text>
                  <Text style={styles.transferTo}>
                    Para: {formatAddress(transfer.to_address)}
                  </Text>
                  <Text style={styles.transferDateTime}>
                    Data e Hora: {formatDate(transfer.created_at!)} às {formatTime(transfer.created_at!)}
                  </Text>
                  <Text style={styles.transferAmount}>
                    Valor: {formatAmount(transfer.amount_sol)}
                  </Text>
                </View>
                
                <View style={styles.transferRight}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(transfer.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusLabel(transfer.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Botão Voltar */}
        <TouchableOpacity style={styles.backButtonBottom} onPress={onBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransferHistoryScreen;