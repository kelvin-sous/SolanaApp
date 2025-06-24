// ========================================
// src/screens/main/SendPaymentScreen/index.tsx
// CORRIGIDO - Com integração do banco de dados
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
import { useTransfers } from '../../../hooks/useTransfers'; // ✨ ADICIONADO
import SolanaService from '../../../services/solana/SolanaService';
import PhantomService from '../../../services/phantom/PhantomService';
import RealtimePriceService from '../../../services/crypto/RealtimePriceService'; // ✨ ADICIONADO
import { styles } from './styles';

interface SendPaymentScreenProps {
    onBack: () => void;
    publicKey: PublicKey;
    session?: any;
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
    const { saveTransfer, updateTransferStatus } = useTransfers(publicKey); // ✨ ADICIONADO
    const [amount, setAmount] = useState('');
    const [solAmount, setSolAmount] = useState('0.00');
    const [isLoading, setIsLoading] = useState(false);
    const [solPrice, setSolPrice] = useState(100);

    // ✅ USAR VALOR DO QR CODE SE DISPONÍVEL
    useEffect(() => {
        if (recipientData?.amountUSD) {
            setAmount(recipientData.amountUSD.toString());
        } else if (recipientData?.amount) {
            const usdValue = recipientData.amount * solPrice;
            setAmount(usdValue.toFixed(2));
        }
    }, [recipientData, solPrice]);

    // ✅ BUSCAR PREÇO REAL DO SOL EM TEMPO REAL
    useEffect(() => {
        fetchSOLPrice();
    }, []);

    const fetchSOLPrice = async () => {
        try {
            // ✨ USAR SERVIÇO DE PREÇOS EM TEMPO REAL
            const priceService = RealtimePriceService.getInstance();
            const prices = priceService.getCurrentPrices();
            const solPriceData = prices.get('solana');
            
            if (solPriceData?.price) {
                setSolPrice(solPriceData.price);
                console.log('💰 Preço SOL em tempo real:', solPriceData.price);
            } else {
                // Fallback para SolanaService se não tiver preço em tempo real
                const solanaService = SolanaService.getInstance();
                const priceData = await solanaService.getSOLPrice();
                setSolPrice(priceData.usd);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar preço SOL:', error);
            setSolPrice(150); // Fallback atualizado
        }
    };

    useEffect(() => {
        if (amount) {
            const usdValue = parseFloat(amount) || 0;
            const solValue = usdValue / solPrice;
            setSolAmount(solValue.toFixed(6));
        } else {
            setSolAmount('0.00');
        }
    }, [amount, solPrice]);

    const validateTransaction = (): { isValid: boolean; error?: string } => {
        const usdValue = parseFloat(amount);
        const solValue = parseFloat(solAmount);
        const estimatedFee = 0.000005;

        if (!amount || usdValue <= 0) {
            return { isValid: false, error: 'Digite um valor válido para enviar' };
        }

        if (!recipientData?.address) {
            return { isValid: false, error: 'Endereço do destinatário não encontrado' };
        }

        try {
            new PublicKey(recipientData.address);
        } catch {
            return { isValid: false, error: 'Endereço do destinatário inválido' };
        }

        const phantomService = PhantomService.getInstance();
        if (!phantomService.isConnected()) {
            return { isValid: false, error: 'Phantom Wallet não conectado. Reconecte e tente novamente.' };
        }

        const availableBalance = balance?.balance || 0;
        const totalNeeded = solValue + estimatedFee;

        if (availableBalance < totalNeeded) {
            return {
                isValid: false,
                error: `Saldo insuficiente.\n\nNecessário: ${totalNeeded.toFixed(6)} SOL\nDisponível: ${availableBalance.toFixed(6)} SOL`
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

    // ✨ IMPLEMENTAÇÃO COM BANCO DE DADOS
    const executePayment = async () => {
        let transferRecord: any = null;
        
        try {
            setIsLoading(true);
            console.log('🚀 Executando pagamento com integração do banco...');

            const solValue = parseFloat(solAmount);
            const usdValue = parseFloat(amount);
            const solanaService = SolanaService.getInstance();
            const phantomService = PhantomService.getInstance();
            const connection = solanaService.getConnection();

            if (!phantomService.isConnected()) {
                throw new Error('Phantom Wallet desconectado. Reconecte e tente novamente.');
            }

            const fromPubkey = publicKey;
            const toPubkey = new PublicKey(recipientData!.address);
            const lamports = Math.floor(solValue * LAMPORTS_PER_SOL);

            // ✨ 1. SALVAR NO BANCO COMO PENDING
            console.log('💾 Salvando transferência no banco como pending...');
            transferRecord = await saveTransfer({
                transaction_signature: `temp_qr_${Date.now()}`, // Temporário
                from_address: fromPubkey.toString(),
                to_address: toPubkey.toString(),
                amount_sol: solValue,
                amount_usd: usdValue,
                fee_sol: 0.000005,
                status: 'pending',
                transfer_type: 'send',
                memo: recipientData?.message || recipientData?.label,
                network: 'devnet'
            });

            console.log('✅ Transferência salva no banco:', transferRecord.id);

            // ✨ 2. CRIAR E EXECUTAR TRANSAÇÃO
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports,
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            console.log('📋 Executando transação...');
            const signature = await phantomService.executeTransaction(transaction);

            // ✨ 3. ATUALIZAR STATUS PARA CONFIRMED
            console.log('💾 Atualizando status para confirmed...');
            await updateTransferStatus(transferRecord.transaction_signature, 'confirmed');

            console.log('🎉 Transação e banco atualizados com sucesso!');

            // Atualizar saldo
            await refreshBalance();

            Alert.alert(
                '🎉 Pagamento Realizado',
                `✅ Transação confirmada e salva no histórico!\n\n` +
                `💰 Valor: $${usdValue.toFixed(2)} (${solValue.toFixed(6)} SOL)\n` +
                `📧 Para: ${recipientData!.address.slice(0, 8)}...${recipientData!.address.slice(-8)}\n` +
                `🔗 Signature: ${signature.slice(0, 8)}...\n\n` +
                `📋 Verifique seu histórico de transferências`,
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

            // ✨ ATUALIZAR STATUS PARA FAILED SE TIVER RECORD
            if (transferRecord) {
                try {
                    await updateTransferStatus(transferRecord.transaction_signature, 'failed');
                    console.log('💾 Status atualizado para failed no banco');
                } catch (dbError) {
                    console.error('❌ Erro ao atualizar status no banco:', dbError);
                }
            }

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

    const estimatedFee = 0.000005;
    const solValue = parseFloat(solAmount);
    const totalSOL = solValue + estimatedFee;
    const availableBalance = balance?.balance || 0;
    const isInsufficientBalance = availableBalance < totalSOL;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#262728" />

            <View style={styles.header}>
                <Image
                    source={require('../../../../assets/icons/qr-codeBRANCO.png')}
                    style={styles.headerIcon}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.title}>Pagar</Text>
                <Text style={styles.balanceIndicator}>
                    💰 Saldo: {availableBalance.toFixed(6)} SOL
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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