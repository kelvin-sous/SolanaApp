// ========================================
// src/components/NFC/NFCTransactionPreview.tsx
// Componente para preview de transação NFC antes da confirmação
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Animated,
  ViewStyle
} from 'react-native';
import { NFCTransactionData } from '../../types/nfc';
import { formatAddress, formatCurrency, formatTimestamp } from '../../utils/nfc';
import { NFC_COLORS } from '../../constants/nfc';

// ========================================
// INTERFACES
// ========================================

interface NFCTransactionPreviewProps {
  transactionData: NFCTransactionData;
  estimatedFee?: number;
  onConfirm: () => Promise<void>;
  onReject: () => void;
  isLoading?: boolean;
  showNetworkInfo?: boolean;
  showSecurityInfo?: boolean;
  style?: ViewStyle;
}

interface SecurityWarning {
  level: 'info' | 'warning' | 'error';
  message: string;
  icon: string;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const NFCTransactionPreview: React.FC<NFCTransactionPreviewProps> = ({
  transactionData,
  estimatedFee = 0.000005,
  onConfirm,
  onReject,
  isLoading = false,
  showNetworkInfo = true,
  showSecurityInfo = true,
  style
}) => {
  // ========================================
  // STATE E ANIMATIONS
  // ========================================
  
  const [securityWarnings, setSecurityWarnings] = useState<SecurityWarning[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();

    // Analisar segurança da transação
    analyzeTransactionSecurity();
  }, []);

  // ========================================
  // ANÁLISE DE SEGURANÇA
  // ========================================

  const analyzeTransactionSecurity = () => {
    const warnings: SecurityWarning[] = [];

    // Verificar valor alto
    if (transactionData.amount > 1000) {
      warnings.push({
        level: 'warning',
        message: `Valor alto: ${formatCurrency(transactionData.amount, 'USD')}`,
        icon: '⚠️'
      });
    }

    // Verificar idade dos dados
    const age = Date.now() - transactionData.timestamp;
    const ageMinutes = age / (1000 * 60);
    
    if (ageMinutes > 5) {
      warnings.push({
        level: 'warning',
        message: `Dados criados há ${Math.floor(ageMinutes)} minutos`,
        icon: '🕐'
      });
    }

    // Verificar preço SOL
    const expectedPrice = 150; // Preço estimado atual
    const priceDifference = Math.abs(transactionData.solPrice - expectedPrice) / expectedPrice;
    
    if (priceDifference > 0.2) {
      warnings.push({
        level: 'warning',
        message: `Preço SOL incomum: ${formatCurrency(transactionData.solPrice, 'USD')}/SOL`,
        icon: '💰'
      });
    }

    // Verificar rede
    if (transactionData.network === 'mainnet-beta') {
      warnings.push({
        level: 'info',
        message: 'Transação na rede principal - irreversível',
        icon: 'ℹ️'
      });
    }

    setSecurityWarnings(warnings);
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleConfirm = async () => {
    try {
      // Confirmar com o usuário se há avisos de segurança
      if (securityWarnings.some(w => w.level === 'warning' || w.level === 'error')) {
        Alert.alert(
          'Confirmar Transação',
          'Foram detectados alguns avisos de segurança. Deseja continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Continuar', style: 'destructive', onPress: onConfirm }
          ]
        );
      } else {
        await onConfirm();
      }
    } catch (error) {
      console.error('❌ Erro ao confirmar transação:', error);
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Cancelar Transação',
      'Tem certeza que deseja cancelar esta transação?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: onReject }
      ]
    );
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // ========================================
  // CÁLCULOS
  // ========================================

  const totalSOL = transactionData.amountSOL + estimatedFee;
  const totalUSD = transactionData.amount + (estimatedFee * transactionData.solPrice);

  // ========================================
  // RENDER
  // ========================================

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        },
        style
      ]}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/icons/nfcBRANCO.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Transação Recebida</Text>
          <Text style={styles.headerSubtitle}>Verifique os dados antes de confirmar</Text>
        </View>

        {/* Valor Principal */}
        <View style={styles.amountCard}>
          <View style={styles.amountHeader}>
            <Text style={styles.amountLabel}>Você receberá</Text>
            <Image
              source={require('../../../assets/icons/solana.png')}
              style={styles.solanaIcon}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.amountUSD}>
            {formatCurrency(transactionData.amount, 'USD')}
          </Text>
          
          <Text style={styles.amountSOL}>
            = {formatCurrency(transactionData.amountSOL, 'SOL')}
          </Text>
          
          <Text style={styles.exchangeRate}>
            1 SOL = {formatCurrency(transactionData.solPrice, 'USD')}
          </Text>
        </View>

        {/* Informações da Transação */}
        <View style={styles.transactionCard}>
          <Text style={styles.cardTitle}>Detalhes da Transação</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>De:</Text>
            <Text style={styles.detailValue}>
              {formatAddress(transactionData.senderPublicKey)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Para:</Text>
            <Text style={styles.detailValue}>
              {formatAddress(transactionData.receiverPublicKey)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data:</Text>
            <Text style={styles.detailValue}>
              {formatTimestamp(transactionData.timestamp)}
            </Text>
          </View>
          
          {transactionData.memo && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Memo:</Text>
              <Text style={styles.detailValue}>{transactionData.memo}</Text>
            </View>
          )}
        </View>

        {/* Informações de Taxa */}
        <View style={styles.feeCard}>
          <Text style={styles.cardTitle}>Custos da Transação</Text>
          
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Valor a receber:</Text>
            <Text style={styles.feeValue}>
              {formatCurrency(transactionData.amountSOL, 'SOL')}
            </Text>
          </View>
          
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Taxa estimada:</Text>
            <Text style={styles.feeValue}>
              {formatCurrency(estimatedFee, 'SOL')}
            </Text>
          </View>
          
          <View style={[styles.feeRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total líquido:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(transactionData.amountSOL - estimatedFee, 'SOL')}
            </Text>
          </View>
        </View>

        {/* Avisos de Segurança */}
        {showSecurityInfo && securityWarnings.length > 0 && (
          <View style={styles.securityCard}>
            <Text style={styles.cardTitle}>Avisos de Segurança</Text>
            {securityWarnings.map((warning, index) => (
              <View key={index} style={[styles.warningRow, styles[`warning${warning.level}`]]}>
                <Text style={styles.warningIcon}>{warning.icon}</Text>
                <Text style={styles.warningText}>{warning.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Informações da Rede */}
        {showNetworkInfo && (
          <View style={styles.networkCard}>
            <Text style={styles.cardTitle}>Informações da Rede</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rede:</Text>
              <Text style={styles.detailValue}>
                Solana {transactionData.network.charAt(0).toUpperCase() + transactionData.network.slice(1)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nonce:</Text>
              <Text style={styles.detailValue}>
                {transactionData.nonce.slice(0, 16)}...
              </Text>
            </View>
          </View>
        )}

        {/* Detalhes Técnicos (Expandível) */}
        <TouchableOpacity style={styles.expandButton} onPress={toggleDetails}>
          <Text style={styles.expandButtonText}>
            {showDetails ? '▼ Ocultar detalhes técnicos' : '▶ Mostrar detalhes técnicos'}
          </Text>
        </TouchableOpacity>

        {showDetails && (
          <Animated.View style={styles.technicalDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Timestamp:</Text>
              <Text style={styles.detailValue}>{transactionData.timestamp}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nonce completo:</Text>
              <Text style={styles.detailValue}>{transactionData.nonce}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Endereço completo (De):</Text>
              <Text style={[styles.detailValue, styles.smallText]}>
                {transactionData.senderPublicKey}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Endereço completo (Para):</Text>
              <Text style={[styles.detailValue, styles.smallText]}>
                {transactionData.receiverPublicKey}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Espaçamento para os botões */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
          disabled={isLoading}
        >
          <Text style={styles.rejectButtonText}>
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton, isLoading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.confirmButtonText}>Processando...</Text>
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirmar Recebimento
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ========================================
// ESTILOS
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262728'
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 20
  },

  headerIcon: {
    width: 48,
    height: 48,
    tintColor: NFC_COLORS.STATUS.CONNECTED,
    marginBottom: 12
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center'
  },

  // Valor Principal
  amountCard: {
    backgroundColor: '#373737',
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: NFC_COLORS.STATUS.CONNECTED
  },

  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },

  amountLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    marginRight: 8
  },

  solanaIcon: {
    width: 20,
    height: 20
  },

  amountUSD: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },

  amountSOL: {
    fontSize: 20,
    color: NFC_COLORS.STATUS.CONNECTED,
    marginBottom: 8
  },

  exchangeRate: {
    fontSize: 14,
    color: '#AAAAAA'
  },

  // Cards
  transactionCard: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8
  },

  feeCard: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8
  },

  securityCard: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F59E0B'
  },

  networkCard: {
    backgroundColor: '#373737',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16
  },

  // Rows de detalhes
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },

  detailLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    flex: 1
  },

  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right'
  },

  smallText: {
    fontSize: 12
  },

  // Rows de taxa
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6
  },

  feeLabel: {
    fontSize: 16,
    color: '#AAAAAA'
  },

  feeValue: {
    fontSize: 16,
    color: '#FFFFFF'
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#555555',
    marginTop: 8,
    paddingTop: 12
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },

  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NFC_COLORS.STATUS.SUCCESS
  },

  // Avisos de segurança
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4
  },

  warninginfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6'
  },

  warningwarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B'
  },

  warningerror: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444'
  },

  warningIcon: {
    fontSize: 16,
    marginRight: 8
  },

  warningText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1
  },

  // Botão expandir
  expandButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8
  },

  expandButtonText: {
    fontSize: 14,
    color: NFC_COLORS.STATUS.CONNECTED,
    fontWeight: '600'
  },

  // Detalhes técnicos
  technicalDetails: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8
  },

  // Botões
  buttonsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#262728',
    borderTopWidth: 1,
    borderTopColor: '#373737'
  },

  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },

  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#EF4444',
    marginRight: 8
  },

  confirmButton: {
    backgroundColor: NFC_COLORS.STATUS.SUCCESS,
    marginLeft: 8
  },

  buttonDisabled: {
    opacity: 0.6
  },

  rejectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444'
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

export default NFCTransactionPreview;