// src/screens/main/CommunityVault/VaultDetailsScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import firestore from '@react-native-firebase/firestore';
import { styles } from './vaultDetailsStyles';
import { CommunityVault, MemberRole } from '../../../services/communityVault/types'; // 🔥 VERIFICAR ESTA LINHA
import { PriceService } from '../../../services/solana/PriceService';
import { FirebaseService } from '../../../services/firebase/FirebaseService';
import { VaultTransactionService } from '../../../services/vault/VaultTransactionService';
import { VaultEventsService, VaultEvent as VaultEventType } from '../../../services/vault/VaultEventsService';
import NumericKeypad from '../../../components/NumericKeypad';

interface VaultDetailsScreenProps {
  onBack: () => void;
  vault: CommunityVault;
  publicKey: PublicKey;
}

type TabType = 'events' | 'statement' | 'info';
type TransactionType = 'deposit' | 'withdraw';

// Usar o tipo do service
type VaultEvent = VaultEventType;

const VaultDetailsScreen: React.FC<VaultDetailsScreenProps> = ({
  onBack,
  vault,
  publicKey
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [solPrice, setSolPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  // Estados de eventos
  const [events, setEvents] = useState<VaultEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('deposit');
  const [amount, setAmount] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);

  // Ref do ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  // Verificar se é o criador do caixa
  const isCreator = vault.creator.toString() === publicKey.toString();

  // Obter role do usuário atual
  const myMember = vault.members?.find(m => m.publicKey.toString() === publicKey.toString());
  const myRole = myMember?.role || MemberRole.GUEST;

  useEffect(() => {
    loadSolanaPrice();

    const interval = setInterval(loadSolanaPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadVaultEvents();

    // Escutar eventos em tempo real
    const unsubscribe = VaultEventsService.subscribeToVaultEvents(
      vault.id,
      (newEvents) => {
        setEvents(newEvents);
        setIsLoadingEvents(false);
      }
    );

    return () => unsubscribe();
  }, [vault.id]);

  // Scroll automático para o final quando novos eventos chegarem
  useEffect(() => {
    if (events.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [events]);

  const loadSolanaPrice = async () => {
    const priceData = await PriceService.getSolanaPrice();
    if (priceData) {
      setSolPrice(priceData.usd);
      setPriceChange(priceData.usd_24h_change);
      setIsLoadingPrice(false);
    }
  };

  const loadVaultEvents = async () => {
    setIsLoadingEvents(true);
    const vaultEvents = await VaultEventsService.getVaultEvents(vault.id);
    setEvents(vaultEvents);
    setIsLoadingEvents(false);
  };

  const vaultBalanceUSD = PriceService.convertSolToUsd(vault.balance, solPrice);

  const formatWallet = (wallet: string) => {
    if (wallet.length <= 8) return wallet;
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const isMyMessage = (wallet: string) => {
    return wallet === publicKey.toString();
  };

  const handleOpenDeposit = () => {
    setTransactionType('deposit');
    setAmount('0');
    setShowTransactionModal(true);
  };

  const handleOpenWithdraw = () => {
    setTransactionType('withdraw');
    setAmount('0');
    setShowTransactionModal(true);
  };

  const handleNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleClear = () => {
    setAmount('0');
  };

  const checkIfNeedsVoting = (type: TransactionType): boolean => {
    const amountNum = parseFloat(amount);

    if (type === 'deposit') {
      return vault.settings.depositRules.requiresVoting;
    } else {
      if (vault.settings.withdrawalLimit && amountNum <= vault.settings.withdrawalLimit) {
        return false;
      }
      return vault.settings.withdrawRules.requiresVoting;
    }
  };

  const handleConfirmTransaction = async () => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    if (transactionType === 'withdraw') {
      const vaultBalance = await VaultTransactionService.getVaultBalance(vault.id);

      if (amountNum > vaultBalance) {
        Alert.alert('Erro', 'Saldo insuficiente no caixa comunitário');
        return;
      }
    }

    const needsVoting = checkIfNeedsVoting(transactionType);

    if (needsVoting) {
      Alert.alert(
        'Votação Necessária',
        `Sua solicitação de ${transactionType === 'deposit' ? 'depósito' : 'saque'} de ${amountNum} SOL será enviada para votação.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Enviar',
            onPress: () => createVotingProposal(amountNum)
          }
        ]
      );
    } else {
      if (transactionType === 'deposit') {
        Alert.alert(
          'Confirmar Depósito',
          `Você será redirecionado para a Phantom Wallet para assinar e confirmar o depósito de ${amountNum} SOL.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Continuar',
              onPress: () => executeTransaction(amountNum)
            }
          ]
        );
      } else {
        Alert.alert(
          'Confirmar Saque',
          `Sacar ${amountNum} SOL do caixa comunitário?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar',
              onPress: () => executeTransaction(amountNum)
            }
          ]
        );
      }
    }
  };

  const createVotingProposal = async (amountNum: number) => {
    try {
      setIsProcessing(true);
      console.log('Criando proposta de votação...');

      const totalMembers = vault.members?.length || 1;

      if (transactionType === 'withdraw') {
        const eventId = await VaultEventsService.createWithdrawRequestEvent(
          vault.id,
          publicKey,
          amountNum,
          totalMembers
        );

        console.log('Proposta de saque criada:', eventId);
      } else {
        const eventId = await VaultEventsService.createDepositRequestEvent(
          vault.id,
          publicKey,
          amountNum,
          totalMembers
        );

        console.log('Proposta de depósito criada:', eventId);
      }

      setShowTransactionModal(false);
      setAmount('0');
      setIsProcessing(false);

      Alert.alert(
        'Proposta Enviada',
        `Sua solicitação foi enviada para votação. Os membros terão ${Math.floor(vault.settings.withdrawRules.votingPeriod / 3600)} horas para votar.`
      );
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      Alert.alert('Erro', 'Não foi possível criar a proposta');
      setIsProcessing(false);
    }
  };

  const executeTransaction = async (amountNum: number) => {
    try {
      setIsProcessing(true);
      console.log(`Executando ${transactionType}...`);

      if (transactionType === 'deposit') {
        console.log('Iniciando processo de depósito...');

        const result = await VaultTransactionService.executeDeposit(
          vault.id,
          publicKey,
          amountNum
        );

        setIsProcessing(false);

        if (!result.success) {
          Alert.alert('Erro', result.error || 'Não foi possível processar o depósito');
          return;
        }

        // Registrar evento de depósito
        await VaultEventsService.createDepositEvent(
          vault.id,
          publicKey,
          amountNum,
          myRole
        );

        setShowTransactionModal(false);
        setAmount('0');

        Alert.alert(
          'Depósito Enviado!',
          `Você foi redirecionado para a Phantom Wallet.\n\nO depósito de ${amountNum} SOL será processado após você confirmar na Phantom.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                setTimeout(async () => {
                  console.log('Verificando novo saldo...');
                  const newBalance = await VaultTransactionService.getVaultBalance(vault.id);
                  console.log('Novo saldo:', newBalance, 'SOL');

                  Alert.alert(
                    'Atualização de Saldo',
                    `Novo saldo do caixa: ${newBalance.toFixed(4)} SOL`
                  );
                }, 15000);
              }
            }
          ]
        );

      } else {
        console.log('Tentando saque automático...');

        const result = await VaultTransactionService.executeAutoWithdraw(
          vault.id,
          publicKey,
          amountNum
        );

        setShowTransactionModal(false);
        setAmount('0');
        setIsProcessing(false);

        if (!result.success) {
          Alert.alert(
            'Funcionalidade em Desenvolvimento',
            'Saques automáticos requerem um smart contract multisig na blockchain Solana.\n\nPor enquanto, todos os saques passam por votação dos membros.'
          );
        } else {
          // Registrar evento de saque
          await VaultEventsService.createWithdrawEvent(
            vault.id,
            publicKey,
            amountNum,
            myRole
          );

          Alert.alert('Sucesso', 'Saque realizado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao executar transação:', error);
      Alert.alert('Erro', 'Não foi possível executar a transação');
      setIsProcessing(false);
    }
  };

  const handleVote = async (eventId: string, voteType: 'approve' | 'reject') => {
    try {
      console.log(`Votando ${voteType} no evento ${eventId}`);

      const totalMembers = vault.members?.length || 1;
      const requiredPercentage = (vault.settings.withdrawRules as any).approvalPercentage ?? 0.5;

      const result = await VaultEventsService.registerVote(
        vault.id,
        eventId,
        publicKey,
        voteType === 'approve' ? 'favor' : 'against',
        totalMembers,
        requiredPercentage
      );

      // Se a votação foi encerrada
      if (result.finished) {
        if (result.approved) {
          // 🔥 BUSCAR DADOS DA SOLICITAÇÃO
          const requestData = await VaultEventsService.getRequestEventData(vault.id, eventId);

          if (!requestData) {
            Alert.alert('Erro', 'Não foi possível obter dados da solicitação');
            return;
          }

          // 🔥 EXECUTAR SAQUE AUTOMATICAMENTE
          console.log('💸 Executando saque aprovado...');

          const recipientPublicKey = new PublicKey(requestData.wallet);
          const withdrawResult = await VaultTransactionService.executeApprovedWithdraw(
            vault.id,
            recipientPublicKey,
            requestData.amount
          );

          if (withdrawResult.success) {
            // Criar evento de aprovação
            await VaultEventsService.createWithdrawApprovedEvent(vault.id, eventId);

            // Criar evento de saque realizado
            const requesterMember = vault.members?.find(
              m => m.publicKey.toString() === requestData.wallet
            );
            const requesterRole = requesterMember?.role || MemberRole.MEMBER;

            await VaultEventsService.createWithdrawEvent(
              vault.id,
              recipientPublicKey,
              requestData.amount,
              requesterRole
            );

            Alert.alert(
              'Saque Realizado!',
              `O saque de ${requestData.amount} SOL foi aprovado e executado com sucesso!\n\nSignature: ${withdrawResult.signature?.slice(0, 20)}...`
            );
          } else {
            Alert.alert(
              'Erro ao Executar Saque',
              withdrawResult.error || 'Não foi possível executar o saque'
            );
          }
        } else {
          Alert.alert(
            'Saque Rejeitado',
            'A solicitação de saque foi rejeitada por maioria de votos.'
          );
        }
      } else {
        Alert.alert('Sucesso', 'Voto registrado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao votar:', error);

      if (error instanceof Error && error.message.includes('já votou')) {
        Alert.alert('Atenção', 'Você já votou nesta solicitação');
      } else {
        Alert.alert('Erro', 'Não foi possível registrar o voto');
      }
    }
  };

  const renderEventMessage = (event: VaultEvent) => {
    const wallet = formatWallet(event.wallet);
    const isMine = isMyMessage(event.wallet);

    switch (event.type) {
      // ========================================
      // EVENTOS DO SISTEMA (sem nuvem)
      // ========================================

      case 'create':
        return (
          <View style={styles.systemEventBubble}>
            <Text style={styles.systemEventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}criou o caixa comunitário "{vault.name}"
            </Text>
          </View>
        );

      case 'join':
        return (
          <View style={styles.systemEventBubble}>
            <Text style={styles.systemEventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}adicionou{' '}
              <Text style={styles.eventWallet}>{formatWallet(event.targetWallet || '')}</Text>
            </Text>
          </View>
        );

      case 'leave':
        return (
          <View style={styles.systemEventBubble}>
            <Text style={styles.systemEventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}saiu do caixa
            </Text>
          </View>
        );

      case 'deposit_approved':
        return (
          <View style={styles.systemEventBubble}>
            <Text style={styles.systemEventText}>
              Depósito aprovado.
            </Text>
          </View>
        );

      case 'withdraw_approved':
        return (
          <View style={styles.systemEventBubble}>
            <Text style={styles.systemEventText}>
              Saque aprovado.
            </Text>
          </View>
        );

      case 'settings_changed':
        return (
          <View style={styles.systemEventBubble}>
            <Text style={styles.systemEventText}>
              <Text style={styles.eventWallet}>{wallet}</Text>
              {' '}alterou as regras deste caixa
            </Text>
          </View>
        );

      // ========================================
      // AÇÕES DE USUÁRIO (com nuvem)
      // ========================================

      case 'deposit':
        const depositRole = event.role === 'FOUNDER' ? 'como Fundador' :
          event.role === 'ADMIN' ? 'como Administrador' :
            'por maioria de votos';

        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={isMine ? styles.myEventWallet : styles.eventWallet}>
                {wallet}
              </Text>
              {' '}depositou{' '}
              <Text style={styles.depositAmount}>${event.amount}</Text>
              {' '}{depositRole}
            </Text>
          </View>
        );

      case 'withdraw':
        const withdrawRole = event.role === 'FOUNDER' ? 'como Fundador' :
          event.role === 'ADMIN' ? 'como Administrador' :
            'por maioria de votos';

        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              <Text style={isMine ? styles.myEventWallet : styles.eventWallet}>
                {wallet}
              </Text>
              {' '}realizou saque de{' '}
              <Text style={styles.withdrawAmount}>${event.amount}</Text>
              {' '}{withdrawRole}
            </Text>
          </View>
        );

      case 'vote':
        if (!isMine) {
          return null; // Não mostrar nada se não for meu voto
        }

        return (
          <View style={[styles.eventBubble, isMine && styles.myEventBubble]}>
            <Text style={styles.eventText}>
              Você votou em "
              {event.userVote === 'favor' ? 'a favor' : 'contra'}"
            </Text>
          </View>
        );

      // ========================================
      // SOLICITAÇÕES COM VOTAÇÃO
      // ========================================

      case 'deposit_request':
        const canVoteDeposit = event.canVote && !isMine;
        const depositVotes = event.votes || { favor: 0, against: 0, total: 1 };
        const depositProgress = (depositVotes.favor / depositVotes.total) * 100;

        return (
          <View style={styles.voteCard}>
            <Text style={styles.voteTitle}>
              <Text style={isMine ? styles.myEventWallet : styles.eventWallet}>
                {wallet}
              </Text>
              {' '}solicitou depósito de{' '}
              <Text style={styles.depositAmount}>${event.amount}</Text>
            </Text>

            <View style={styles.voteStats}>
              <View style={styles.voteStat}>
                <Text style={styles.voteLabel}>A favor:</Text>
                <Text style={[styles.voteCount, styles.voteCountFavor]}>
                  {depositVotes.favor}
                </Text>
              </View>

              <View style={styles.voteStat}>
                <Text style={styles.voteLabel}>Contra:</Text>
                <Text style={[styles.voteCount, styles.voteCountAgainst]}>
                  {depositVotes.against}
                </Text>
              </View>
            </View>

            <View style={styles.voteProgressBar}>
              <View
                style={[
                  styles.voteProgressFill,
                  {
                    width: `${depositProgress}%`,
                    backgroundColor: depositProgress > 50 ? '#10B981' : '#EF4444'
                  }
                ]}
              />
            </View>

            {canVoteDeposit ? (
              <View style={styles.voteButtons}>
                <TouchableOpacity
                  style={styles.voteButtonReject}
                  onPress={() => handleVote(event.id, 'reject')}
                >
                  <Text style={styles.voteButtonText}>Negar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.voteButtonApprove}
                  onPress={() => handleVote(event.id, 'approve')}
                >
                  <Text style={styles.voteButtonText}>Aprovar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.voteStatus}>
                <Text style={styles.voteStatusText}>
                  {isMine
                    ? 'Você não pode votar em sua própria solicitação'
                    : event.userVote
                      ? `Você votou em "${event.userVote === 'favor' ? 'a favor' : 'contra'}"`
                      : 'Aguardando votação'}
                </Text>
              </View>
            )}
          </View>
        );

      case 'withdraw_request':
        // Verificar se o usuário atual pode votar
        const hasVoted = event.voters && event.voters[publicKey.toString()];
        const canVoteWithdraw = !isMine && !hasVoted;

        const withdrawVotes = event.votes || { favor: 0, against: 0, total: vault.members?.length || 1 };
        const withdrawProgress = (withdrawVotes.favor / withdrawVotes.total) * 100;

        return (
          <View style={styles.voteCard}>
            <Text style={styles.voteTitle}>
              <Text style={isMine ? styles.myEventWallet : styles.eventWallet}>
                {wallet}
              </Text>
              {' '}solicitou saque de{' '}
              <Text style={styles.withdrawAmount}>${event.amount}</Text>
            </Text>

            <View style={styles.voteStats}>
              <View style={styles.voteStat}>
                <Text style={styles.voteLabel}>A favor:</Text>
                <Text style={[styles.voteCount, styles.voteCountFavor]}>
                  {withdrawVotes.favor}
                </Text>
              </View>

              <View style={styles.voteStat}>
                <Text style={styles.voteLabel}>Contra:</Text>
                <Text style={[styles.voteCount, styles.voteCountAgainst]}>
                  {withdrawVotes.against}
                </Text>
              </View>
            </View>

            <View style={styles.voteProgressBar}>
              <View
                style={[
                  styles.voteProgressFill,
                  {
                    width: `${withdrawProgress}%`,
                    backgroundColor: withdrawProgress > 50 ? '#10B981' : '#EF4444'
                  }
                ]}
              />
            </View>

            {canVoteWithdraw ? (
              <View style={styles.voteButtons}>
                <TouchableOpacity
                  style={styles.voteButtonReject}
                  onPress={() => handleVote(event.id, 'reject')}
                >
                  <Text style={styles.voteButtonText}>Negar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.voteButtonApprove}
                  onPress={() => handleVote(event.id, 'approve')}
                >
                  <Text style={styles.voteButtonText}>Aprovar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.voteStatus}>
                <Text style={styles.voteStatusText}>
                  {isMine
                    ? 'Você não pode votar em sua própria solicitação'
                    : hasVoted
                      ? `Você votou em "${hasVoted === 'favor' ? 'a favor' : 'contra'}"`
                      : 'Aguardando votação'}
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const renderEventsTab = () => {
    if (isLoadingEvents) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyEventsContainer}>
            <ActivityIndicator size="large" color="#AB9FF3" />
            <Text style={styles.emptyEventsText}>Carregando eventos...</Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.tabContent}
        contentContainerStyle={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <View style={styles.emptyEventsContainer}>
            <Text style={styles.emptyEventsIcon}>📋</Text>
            <Text style={styles.emptyEventsText}>
              Nenhum evento registrado ainda
            </Text>
          </View>
        ) : (
          events.map((event) => (
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#262728" />

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

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Caixa $:</Text>
          {isLoadingPrice ? (
            <ActivityIndicator size="small" color="#AB9FF3" style={{ marginLeft: 8 }} />
          ) : (
            <>
              <Text style={styles.balanceValue}>
                ${vaultBalanceUSD.toFixed(2)}
              </Text>
              <View style={[
                styles.priceIndicator,
                { backgroundColor: priceChange >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.priceIndicatorText}>
                  {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
                </Text>
              </View>
            </>
          )}
        </View>

        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'statement' && renderStatementTab()}
        {activeTab === 'info' && renderInfoTab()}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={handleOpenWithdraw}
          >
            <Text style={styles.withdrawButtonText}>Sacar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.depositButton}
            onPress={handleOpenDeposit}
          >
            <Text style={styles.depositButtonText}>Depositar</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showTransactionModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTransactionModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowTransactionModal(false)}
            />

            <View style={styles.transactionModal}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.transactionModalContent}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.transactionModalTitle}>
                  {transactionType === 'deposit' ? 'Depositar' : 'Sacar'}
                </Text>

                <View style={styles.amountDisplay}>
                  <Text style={styles.amountLabel}>Valor (SOL):</Text>
                  <Text style={styles.amountValue}>{amount}</Text>
                  <Text style={styles.amountUSD}>
                    ≈ ${(parseFloat(amount) * solPrice).toFixed(2)} USD
                  </Text>
                </View>

                <NumericKeypad
                  onNumberPress={handleNumberPress}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                />

                <View style={styles.transactionModalFooter}>
                  <TouchableOpacity
                    style={styles.transactionCancelButton}
                    onPress={() => setShowTransactionModal(false)}
                  >
                    <Text style={styles.transactionCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.transactionConfirmButton,
                      isProcessing && styles.transactionConfirmButtonDisabled
                    ]}
                    onPress={handleConfirmTransaction}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.transactionConfirmText}>Confirmar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default VaultDetailsScreen;