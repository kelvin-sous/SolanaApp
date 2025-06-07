// ========================================
// src/screens/main/SendPaymentScreen/index.tsx
// CORRIGIDO - Usar signAndSendTransaction do PhantomService
// ========================================

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useBalance } from '../../../hooks/useBalance';
import SolanaService from '../../../services/solana/SolanaService';
import PhantomService from '../../../services/phantom/PhantomService'; // ADICIONADO
import { styles } from './styles';

interface SendPaymentScreenProps {
    onBack: () => void;
    publicKey: PublicKey;
    session?: any; // Manter para compatibilidade, mas não usar para transações
    recipientData?: {
        address: string;
        label?: string;
        message?: string;
        amount?: number;
        amountUSD?: number;
    };
}

const SendPaymentScreen: React.FC<SendPaymentScreenProps> = ({
    onBack,
    publicKey,
    session,
    recipientData
}) => {
    const { balance, refreshBalance } = useBalance(publicKey);
    const [amount, setAmount] = useState('');
    const [solAmount, setSolAmount] = useState('0.00');
    const [isLoading, setIsLoading] = useState(false);
    const [solPrice, setSolPrice] = useState(100);

    // ✅ USAR VALOR DO QR CODE SE DISPONÍVEL
    useEffect(() => {
        if (recipientData?.amountUSD) {
            setAmount(recipientData.amountUSD.toString());
        } else if (recipientData?.amount) {
            // Se o QR code tem valor em SOL, converter para USD
            const usdValue = recipientData.amount * solPrice;
            setAmount(usdValue.toFixed(2));
        }
    }, [recipientData, solPrice]);

    // ✅ BUSCAR PREÇO REAL DO SOL
    useEffect(() => {
        fetchSOLPrice();
    }, []);

    const fetchSOLPrice = async () => {
        try {
            const solanaService = SolanaService.getInstance();
            const priceData = await solanaService.getSOLPrice();
            setSolPrice(priceData.usd);
            console.log('💰 Preço SOL obtido:', priceData.usd);
        } catch (error) {
            console.error('❌ Erro ao buscar preço SOL:', error);
            setSolPrice(100); // Fallback
        }
    };

    useEffect(() => {
        // Calcular valor em SOL quando USD muda
        if (amount) {
            const usdValue = parseFloat(amount) || 0;
            const solValue = usdValue / solPrice;
            setSolAmount(solValue.toFixed(6));
        } else {
            setSolAmount('0.00');
        }
    }, [amount, solPrice]);

    // ✅ VERIFICAÇÃO ATUALIZADA - SEM DEPENDÊNCIA DE session.signTransaction
    const validateTransaction = (): { isValid: boolean; error?: string } => {
        const usdValue = parseFloat(amount);
        const solValue = parseFloat(solAmount);
        const estimatedFee = 0.000005;

        // Verificar valor
        if (!amount || usdValue <= 0) {
            return { isValid: false, error: 'Digite um valor válido para enviar' };
        }

        // Verificar endereço
        if (!recipientData?.address) {
            return { isValid: false, error: 'Endereço do destinatário não encontrado' };
        }

        try {
            new PublicKey(recipientData.address);
        } catch {
            return { isValid: false, error: 'Endereço do destinatário inválido' };
        }

        // ✅ VERIFICAR PHANTOM SERVICE AO INVÉS DA SESSÃO
        const phantomService = PhantomService.getInstance();
        if (!phantomService.isConnected()) {
            return { isValid: false, error: 'Phantom Wallet não conectado. Reconecte e tente novamente.' };
        }

        // ✅ VERIFICAR SALDO SUFICIENTE
        const availableBalance = balance?.balance || 0;
        const totalNeeded = solValue + estimatedFee;

        console.log('💰 Verificação de saldo:', {
            disponível: availableBalance,
            necessário: solValue,
            taxa: estimatedFee,
            total: totalNeeded,
            suficiente: availableBalance >= totalNeeded
        });

        if (availableBalance < totalNeeded) {
            return {
                isValid: false,
                error: `Saldo insuficiente.\n\nNecessário: ${totalNeeded.toFixed(6)} SOL\nDisponível: ${availableBalance.toFixed(6)} SOL\n\nAdicione SOL à sua carteira para continuar.`
            };
        }

        return { isValid: true };
    };

    const handleConfirmPayment = () => {
        const validation = validateTransaction();

        if (!validation.isValid) {
            Alert.alert('❌ Erro', validation.error!);
            return;
        }

        const usdValue = parseFloat(amount);
        const solValue = parseFloat(solAmount);

        Alert.alert(
            '💸 Confirmar Pagamento',
            `Enviar $${usdValue.toFixed(2)} (${solValue.toFixed(6)} SOL) para:\n\n` +
            `${recipientData!.address.slice(0, 8)}...${recipientData!.address.slice(-8)}\n\n` +
            `Taxa estimada: 0.000005 SOL`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'default',
                    onPress: executePayment
                }
            ]
        );
    };

    // IMPLEMENTAÇÃO PhantomService.signAndSendTransaction
    const executePayment = async () => {
        try {
            setIsLoading(true);
            console.log('🚀 Executando pagamento via método híbrido...');

            const solValue = parseFloat(solAmount);
            const solanaService = SolanaService.getInstance();
            const phantomService = PhantomService.getInstance();
            const connection = solanaService.getConnection();

            // Verificar se ainda está conectado
            if (!phantomService.isConnected()) {
                throw new Error('Phantom Wallet desconectado. Reconecte e tente novamente.');
            }

            // Criar chaves públicas
            const fromPubkey = publicKey;
            const toPubkey = new PublicKey(recipientData!.address);
            const lamports = Math.floor(solValue * LAMPORTS_PER_SOL);

            console.log('💳 Dados da transação:', {
                from: fromPubkey.toString().slice(0, 8) + '...',
                to: toPubkey.toString().slice(0, 8) + '...',
                solAmount: solValue,
                lamports
            });

            // Criar transação
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports,
                })
            );

            // Obter blockhash recente
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            console.log('📋 Transação criada, tentando múltiplos métodos...');

            // 🔥 USAR MÉTODO HÍBRIDO QUE TENTA VÁRIAS ABORDAGENS
            const signature = await phantomService.executeTransaction(transaction);

            console.log('🎉 Transação concluída com sucesso!', signature);

            // Atualizar saldo
            await refreshBalance();

            Alert.alert(
                '🎉 Pagamento Realizado',
                `Transação concluída com sucesso!\n\n` +
                `💰 Valor: $${parseFloat(amount).toFixed(2)} (${solValue.toFixed(6)} SOL)\n` +
                `📧 Para: ${recipientData!.address.slice(0, 8)}...${recipientData!.address.slice(-8)}\n` +
                `🔗 Signature: ${signature.slice(0, 8)}...\n\n` +
                `Ver no Explorer da Solana (devnet)`,
                [
                    {
                        text: 'Ver Explorer',
                        onPress: () => {
                            console.log('🔗 Explorer URL:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
                        }
                    },
                    {
                        text: 'Concluir',
                        onPress: onBack
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Erro na transação:', error);

            let errorMessage = 'Erro desconhecido na transação';
            if (error instanceof Error) {
                if (error.message.includes('User rejected') || error.message.includes('cancelada pelo usuário')) {
                    errorMessage = 'Transação cancelada pelo usuário no Phantom';
                } else if (error.message.includes('insufficient funds')) {
                    errorMessage = 'Saldo insuficiente para completar a transação';
                } else if (error.message.includes('Todas as tentativas')) {
                    errorMessage = 'Não foi possível completar a transação após múltiplas tentativas.\n\nVerifique se o Phantom está atualizado e tente reconectar.';
                } else if (error.message.includes('Timeout')) {
                    errorMessage = 'Timeout na transação. Verifique o Phantom e tente novamente.';
                } else {
                    errorMessage = error.message;
                }
            }

            Alert.alert('❌ Erro na Transação', errorMessage, [
                {
                    text: 'Tentar Novamente',
                    onPress: executePayment
                },
                {
                    text: 'Reconectar Phantom',
                    onPress: () => {
                        console.log('🔄 Usuário solicitou reconexão Phantom');
                        onBack();
                    }
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrentDateTime = () => {
        const now = new Date();
        const date = now.toLocaleDateString('pt-BR');
        const time = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return { date, time };
    };

    const { date, time } = formatCurrentDateTime();

    // ✅ CALCULAR TOTAIS
    const estimatedFee = 0.000005;
    const solValue = parseFloat(solAmount);
    const totalSOL = solValue + estimatedFee;
    const availableBalance = balance?.balance || 0;
    const isInsufficientBalance = availableBalance < totalSOL;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#262728" />

            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../../../../assets/icons/qr-codeBRANCO.png')}
                    style={styles.headerIcon}
                    resizeMode="contain"
                />
            </View>

            {/* Título */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Pagar</Text>
                {/* ✅ MOSTRAR SALDO DISPONÍVEL */}
                <Text style={styles.balanceIndicator}>
                    💰 Saldo: {availableBalance.toFixed(6)} SOL
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Card de Valor */}
                <View style={styles.amountCard}>
                    <View style={styles.amountHeader}>
                        <Image
                            source={require('../../../../assets/icons/solana.png')}
                            style={styles.solanaIcon}
                            resizeMode="contain"
                        />
                        <View style={styles.currencyIndicator} />
                    </View>

                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        {/* ✅ DESABILITAR INPUT SE VALOR FIXO DO QR CODE */}
                        <TextInput
                            style={[
                                styles.amountInput,
                                (recipientData?.amount || recipientData?.amountUSD) ? styles.amountInputDisabled : undefined
                            ]}
                            placeholder="0,00"
                            placeholderTextColor="#888888"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                            editable={!(recipientData?.amount || recipientData?.amountUSD)}
                        />
                    </View>

                    <Text style={[
                        styles.solEquivalent,
                        isInsufficientBalance && styles.insufficientText
                    ]}>
                        = {solAmount} SOL {isInsufficientBalance && '⚠️ Saldo insuficiente'}
                    </Text>
                </View>

                {/* Card de Detalhes */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>Detalhes da Transação</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Para:</Text>
                        <Text style={styles.detailValue}>
                            {recipientData?.address ?
                                `${recipientData.address.slice(0, 8)}...${recipientData.address.slice(-8)}` :
                                'Endereço não informado'
                            }
                        </Text>
                    </View>

                    {recipientData?.label && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Descrição:</Text>
                            <Text style={styles.detailValue}>{recipientData.label}</Text>
                        </View>
                    )}

                    {recipientData?.message && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mensagem:</Text>
                            <Text style={styles.detailValue}>{recipientData.message}</Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>De:</Text>
                        <Text style={styles.detailValue}>
                            {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Data:</Text>
                        <Text style={styles.detailValue}>{date}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Hora:</Text>
                        <Text style={styles.detailValue}>{time}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Rede:</Text>
                        <Text style={styles.detailValue}>Solana Devnet</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Taxa estimada:</Text>
                        <Text style={styles.detailValue}>{estimatedFee.toFixed(6)} SOL</Text>
                    </View>

                    {/* ✅ MOSTRAR TOTAL */}
                    <View style={[styles.detailRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total necessário:</Text>
                        <Text style={[
                            styles.totalValue,
                            isInsufficientBalance && styles.insufficientText
                        ]}>
                            {totalSOL.toFixed(6)} SOL
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Botões */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (isInsufficientBalance || !amount || parseFloat(amount) <= 0) && styles.confirmButtonDisabled
                    ]}
                    onPress={handleConfirmPayment}
                    disabled={isInsufficientBalance || !amount || parseFloat(amount) <= 0 || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.confirmButtonText}>
                            {isInsufficientBalance ? 'Saldo Insuficiente' : 'Confirmar pagamento'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    disabled={isLoading}
                >
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SendPaymentScreen;