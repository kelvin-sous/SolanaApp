// src/screens/main/CommunityVault/VaultDetailsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { styles } from './vaultDetailsStyles';
import { CommunityVault } from '../../../services/communityVault/types';

interface VaultDetailsScreenProps {
  onBack: () => void;
  vault: CommunityVault;
  publicKey: PublicKey;
}

type TabType = 'events' | 'statement' | 'info';

interface VaultEvent {
  id: string;
  type: 'create' | 'invite' | 'join' | 'deposit' | 'withdraw' | 'withdraw_request' | 'deposit_request' | 'vote_approve' | 'vote_reject';
  wallet: string;
  amount?: number;
  timestamp: Date;
  status?: 'pending' | 'approved' | 'rejected';
  votes?: {
    favor: number;
    against: number;
  };
  targetWallet?: string;
  canVote?: boolean;
}

const VaultDetailsScreen: React.FC<VaultDetailsScreenProps> = ({ 
  onBack, 
  vault,
  publicKey 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('events');

  // Verificar se é o criador do caixa
  const isCreator = vault.creator.toString() === publicKey.toString();

  // EVENTOS REAIS: Apenas evento de criação do caixa
  const realEvents: VaultEvent[] = [
    {
      id: '1',
      type: 'create',
      wallet: vault.creator.toString(),
      timestamp: vault.createdAt,
    },
  ];

  // TODO: Posteriormente, adicionar eventos da blockchain/database:
  // - Convites enviados (vault.invites)
  // - Membros que entraram (vault.members)
  // - Transações de depósito (vault.transactions)
  // - Propostas de saque (vault.proposals)
  // - Votos nas propostas

  const formatWallet = (wallet: string) => {
    if (wallet.length <= 8) return wallet;
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(0)}`;
  };

  // Verificar se a mensagem é do usuário atual
  const isMyMessage = (wallet: string) => {
    return wallet === publicKey.toString();
  };

  const renderEventMessage = (event: VaultEvent) => {
    const wallet = formatWallet(event.wallet);
    const isMine = isMyMessage(event.wallet);
    
    switch (event.type) {
      case 'create':
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}criou o caixa comunitário "{vault.name}"
            </Text>
          </View>
        );
      
      case 'invite':
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}enviou convite para{' '}
              <Text style={styles.eventWallet}>{formatWallet(event.targetWallet!)}</Text>
            </Text>
          </View>
        );
      
      case 'join':
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}entrou no caixa comunitário
            </Text>
          </View>
        );
      
      case 'deposit':
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}depositou{' '}
              <Text style={styles.depositAmount}>{formatAmount(event.amount!)}</Text>
            </Text>
          </View>
        );
      
      case 'withdraw_request':
        const canUserVote = event.canVote && !isMyMessage(event.wallet);
        
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <View style={styles.withdrawRequestCard}>
              <Text style={styles.withdrawRequestTitle}>
                <Text style={styles.eventWallet}>{wallet}</Text>
                {' '}solicitou saque de{' '}
                <Text style={styles.withdrawAmount}>{formatAmount(event.amount!)}</Text>
              </Text>
              
              <View style={styles.votesContainer}>
                <View style={styles.voteItem}>
                  <Text style={styles.voteLabel}>A favor:</Text>
                  <Text style={styles.voteFavor}>{event.votes!.favor}</Text>
                </View>
                
                <View style={styles.voteItem}>
                  <Text style={styles.voteLabel}>Contra:</Text>
                  <Text style={styles.voteAgainst}>{event.votes!.against}</Text>
                </View>
              </View>
              
              <View style={styles.voteProgress}>
                <View 
                  style={[
                    styles.voteProgressBar, 
                    { 
                      width: `${(event.votes!.favor / (event.votes!.favor + event.votes!.against)) * 100}%` 
                    }
                  ]} 
                />
              </View>
              
              {canUserVote ? (
                <View style={styles.voteButtons}>
                  <TouchableOpacity 
                    style={styles.voteButtonReject}
                    onPress={() => handleVote(event.id, 'reject')}
                  >
                    <Text style={styles.voteButtonRejectText}>Negar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.voteButtonApprove}
                    onPress={() => handleVote(event.id, 'approve')}
                  >
                    <Text style={styles.voteButtonApproveText}>Aprovar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.voteDisabledNote}>
                  <Text style={styles.voteDisabledText}>
                    {isMyMessage(event.wallet) 
                      ? '🔒 Você não pode votar em seu próprio saque'
                      : 'Você já votou nesta solicitação'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      
      case 'vote_approve':
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}aprovou uma solicitação de saque
            </Text>
          </View>
        );
      
      case 'vote_reject':
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}negou uma solicitação de saque
            </Text>
          </View>
        );
      
      case 'withdraw':
        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}realizou saque de{' '}
              <Text style={styles.withdrawAmount}>{formatAmount(event.amount!)}</Text>
              {' '}por maioria de votos
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  const handleVote = (eventId: string, voteType: 'approve' | 'reject') => {
    console.log(`Votando ${voteType} no evento ${eventId}`);
  };

  const renderEventsTab = () => {
    return (
      <ScrollView 
        style={styles.tabContent}
        contentContainerStyle={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
      >
        {realEvents.length === 0 ? (
          <View style={styles.emptyEventsContainer}>
            <Text style={styles.emptyEventsIcon}>📋</Text>
            <Text style={styles.emptyEventsText}>
              Nenhum evento registrado ainda
            </Text>
          </View>
        ) : (
          realEvents.map((event) => (
            <View 
              key={event.id} 
              style={[
                styles.eventItem,
                isMyMessage(event.wallet) && styles.myEventItem
              ]}
            >
              {renderEventMessage(event)}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderStatementTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>📊</Text>
          <Text style={styles.placeholderText}>Extrato em construção</Text>
        </View>
      </View>
    );
  };

  const renderInfoTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>ℹ️</Text>
          <Text style={styles.placeholderText}>Informações em construção</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../../../../assets/icons/sairBranco.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <View style={[styles.vaultCircle, { backgroundColor: vault.icon || '#AB9FF3' }]} />
        
        <Text style={styles.vaultName} numberOfLines={1}>
          {vault.name}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setActiveTab('events')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            Painel de eventos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setActiveTab('statement')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'statement' && styles.tabTextActive]}>
            Extrato
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setActiveTab('info')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            Informações
          </Text>
        </TouchableOpacity>
      </View>

      {/* Saldo do Caixa */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Caixa $:</Text>
        <Text style={styles.balanceValue}>{vault.balance.toFixed(2)}</Text>
        <Text style={styles.balanceArrow}>↑</Text>
      </View>

      {/* Conteúdo das Tabs */}
      {activeTab === 'events' && renderEventsTab()}
      {activeTab === 'statement' && renderStatementTab()}
      {activeTab === 'info' && renderInfoTab()}

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.withdrawButton}>
          <Text style={styles.withdrawButtonText}>Sacar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.depositButton}>
          <Text style={styles.depositButtonText}>Depositar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VaultDetailsScreen;