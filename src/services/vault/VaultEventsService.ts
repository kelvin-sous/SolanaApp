// src/services/vault/VaultEventsService.ts

import firestore from '@react-native-firebase/firestore';
import { PublicKey } from '@solana/web3.js';

export interface VaultEvent {
    id: string;
    vaultId: string;
    type:
    | 'create'
    | 'join'
    | 'leave'
    | 'deposit'
    | 'withdraw'
    | 'deposit_request'
    | 'withdraw_request'
    | 'deposit_approved'
    | 'withdraw_approved'
    | 'vote'
    | 'settings_changed';
    wallet: string;
    amount?: number;
    timestamp: Date;
    status?: 'pending' | 'approved' | 'rejected';
    votes?: {
        favor: number;
        against: number;
        total: number;
    };
    voters?: { [wallet: string]: 'favor' | 'against' };
    userVote?: 'favor' | 'against' | null;
    role?: string;
    canVote?: boolean;
    targetWallet?: string;
    metadata?: any;
}

export class VaultEventsService {
    /**
     * Buscar eventos de um caixa específico
     */
    static async getVaultEvents(vaultId: string): Promise<VaultEvent[]> {
        try {
            console.log('Buscando eventos do caixa:', vaultId);

            const eventsSnapshot = await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .orderBy('timestamp', 'asc')
                .limit(50)
                .get();

            const events: VaultEvent[] = eventsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    vaultId: vaultId,
                    type: data.type,
                    wallet: data.wallet,
                    amount: data.amount,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    status: data.status,
                    votes: data.votes,
                    userVote: data.userVote,
                    role: data.role,
                    canVote: data.canVote,
                    targetWallet: data.targetWallet,
                    metadata: data.metadata,
                };
            });

            console.log('Eventos carregados:', events.length);
            return events;

        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            return [];
        }
    }

    /**
     * Escutar eventos em tempo real
     */
    static subscribeToVaultEvents(
        vaultId: string,
        callback: (events: VaultEvent[]) => void
    ): () => void {
        console.log('Inscrevendo-se em eventos do caixa:', vaultId);

        const unsubscribe = firestore()
            .collection('vaults')
            .doc(vaultId)
            .collection('events')
            .orderBy('timestamp', 'asc')
            .limit(50)
            .onSnapshot(
                snapshot => {
                    const events: VaultEvent[] = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            vaultId: vaultId,
                            type: data.type,
                            wallet: data.wallet,
                            amount: data.amount,
                            timestamp: data.timestamp?.toDate() || new Date(),
                            status: data.status,
                            votes: data.votes,
                            userVote: data.userVote,
                            role: data.role,
                            canVote: data.canVote,
                            targetWallet: data.targetWallet,
                            metadata: data.metadata,
                        };
                    });

                    console.log('Eventos atualizados:', events.length);
                    callback(events);
                },
                error => {
                    console.error('Erro ao escutar eventos:', error);
                }
            );

        return unsubscribe;
    }

    /**
     * Criar evento de criação do caixa
     */
    static async createVaultCreationEvent(
        vaultId: string,
        creatorWallet: PublicKey,
        vaultName: string
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'create',
                    wallet: creatorWallet.toString(),
                    timestamp: firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        vaultName: vaultName,
                    },
                });

            console.log('Evento de criação registrado');
        } catch (error) {
            console.error('Erro ao criar evento:', error);
        }
    }

    /**
     * Criar evento de depósito
     */
    static async createDepositEvent(
        vaultId: string,
        wallet: PublicKey,
        amount: number,
        role: string
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'deposit',
                    wallet: wallet.toString(),
                    amount: amount,
                    role: role,
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });

            console.log('Evento de depósito registrado');
        } catch (error) {
            console.error('Erro ao criar evento de depósito:', error);
        }
    }

    /**
     * Criar evento de saque
     */
    static async createWithdrawEvent(
        vaultId: string,
        wallet: PublicKey,
        amount: number,
        role: string
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'withdraw',
                    wallet: wallet.toString(),
                    amount: amount,
                    role: role,
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });

            console.log('Evento de saque registrado');
        } catch (error) {
            console.error('Erro ao criar evento de saque:', error);
        }
    }

    /**
     * Criar evento de solicitação de depósito
     */
    static async createDepositRequestEvent(
        vaultId: string,
        wallet: PublicKey,
        amount: number,
        totalMembers: number
    ): Promise<string> {
        try {
            const eventRef = await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'deposit_request',
                    wallet: wallet.toString(),
                    amount: amount,
                    status: 'pending',
                    votes: {
                        favor: 0,
                        against: 0,
                        total: totalMembers,
                    },
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });

            console.log('Evento de solicitação de depósito criado');
            return eventRef.id;
        } catch (error) {
            console.error('Erro ao criar evento de solicitação:', error);
            throw error;
        }
    }

    /**
     * Criar evento de solicitação de saque
     */
    static async createWithdrawRequestEvent(
        vaultId: string,
        wallet: PublicKey,
        amount: number,
        totalMembers: number
    ): Promise<string> {
        try {
            const eventRef = await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'withdraw_request',
                    wallet: wallet.toString(),
                    amount: amount,
                    status: 'pending',
                    votes: {
                        favor: 0,
                        against: 0,
                        total: totalMembers,
                    },
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });

            console.log('Evento de solicitação de saque criado');
            return eventRef.id;
        } catch (error) {
            console.error('Erro ao criar evento de solicitação:', error);
            throw error;
        }
    }

    /**
     * Registrar voto em solicitação
     */
    static async hasUserVoted(
        vaultId: string,
        eventId: string,
        voterWallet: PublicKey
    ): Promise<boolean> {
        try {
            const eventRef = firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .doc(eventId);

            const eventDoc = await eventRef.get();
            const eventData = eventDoc.data();

            if (!eventData) {
                return false;
            }

            const voters = eventData.voters || {};
            return !!voters[voterWallet.toString()];
        } catch (error) {
            console.error('❌ Erro ao verificar voto:', error);
            return false;
        }
    }

    /**
     * Registrar voto em solicitação
     */
    static async registerVote(
        vaultId: string,
        eventId: string,
        voterWallet: PublicKey,
        voteType: 'favor' | 'against',
        totalMembers: number,
        requiredPercentage: number = 0.5
    ): Promise<{ approved: boolean; finished: boolean }> {
        try {
            // Verificar se já votou
            const hasVoted = await this.hasUserVoted(vaultId, eventId, voterWallet);
            if (hasVoted) {
                throw new Error('Você já votou nesta solicitação');
            }

            const eventRef = firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .doc(eventId);

            const eventDoc = await eventRef.get();
            const eventData = eventDoc.data();

            if (!eventData) {
                throw new Error('Evento não encontrado');
            }

            const votes = eventData.votes || { favor: 0, against: 0, total: totalMembers };

            if (voteType === 'favor') {
                votes.favor += 1;
            } else {
                votes.against += 1;
            }

            await eventRef.update({
                votes: votes,
                [`voters.${voterWallet.toString()}`]: voteType,
            });

            // Criar evento de voto
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'vote',
                    wallet: voterWallet.toString(),
                    userVote: voteType,
                    timestamp: firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        relatedEventId: eventId,
                    },
                });

            console.log('✅ Voto registrado');

            // VERIFICAR SE A VOTAÇÃO DEVE SER ENCERRADA
            const result = await this.checkVotingResult(
                vaultId,
                eventId,
                totalMembers,
                requiredPercentage
            );

            return result;

        } catch (error) {
            console.error('Erro ao registrar voto:', error);
            throw error;
        }
    }

    /**
    * Verificar se votação deve ser encerrada e executar ação
    */
    static async checkVotingResult(
        vaultId: string,
        eventId: string,
        totalMembers: number,
        requiredPercentage: number = 0.5 // 50% por padrão
    ): Promise<{ approved: boolean; finished: boolean }> {
        try {
            const eventRef = firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .doc(eventId);

            const eventDoc = await eventRef.get();
            const eventData = eventDoc.data();

            if (!eventData) {
                return { approved: false, finished: false };
            }

            const votes = eventData.votes || { favor: 0, against: 0, total: totalMembers };

            // Total de votos já computados
            const totalVotes = votes.favor + votes.against;

            // Votos necessários para maioria (arredondado para cima)
            const votesNeededForMajority = Math.ceil(totalMembers * requiredPercentage);

            // Verificar se tem votos suficientes a favor
            const approved = votes.favor >= votesNeededForMajority;

            // Verificar se tem votos suficientes contra
            const rejected = votes.against >= votesNeededForMajority;

            // Verificar se todos já votaram
            const allVoted = totalVotes >= totalMembers;

            // Votação termina se:
            // 1. Maioria a favor
            // 2. Maioria contra
            // 3. Todos votaram
            const finished = approved || rejected || allVoted;

            if (finished) {
                // Atualizar status do evento
                await eventRef.update({
                    status: approved ? 'approved' : 'rejected',
                    finishedAt: firestore.FieldValue.serverTimestamp(),
                });

                console.log(`   Votação encerrada: ${approved ? 'APROVADO' : 'REJEITADO'}`);
                console.log(`   Votos a favor: ${votes.favor}/${votesNeededForMajority}`);
                console.log(`   Votos contra: ${votes.against}`);
            }

            return { approved, finished };

        } catch (error) {
            console.error('Erro ao verificar resultado:', error);
            return { approved: false, finished: false };
        }
    }

    /**
    * Buscar dados de uma solicitação específica
    */
    static async getRequestEventData(
        vaultId: string,
        eventId: string
    ): Promise<{ wallet: string; amount: number } | null> {
        try {
            const eventRef = firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .doc(eventId);

            const eventDoc = await eventRef.get();
            const eventData = eventDoc.data();

            if (!eventData) {
                return null;
            }

            return {
                wallet: eventData.wallet,
                amount: eventData.amount
            };
        } catch (error) {
            console.error('Erro ao buscar dados da solicitação:', error);
            return null;
        }
    }

    /**
     * Criar evento de membro adicionado
     */
    static async createMemberJoinEvent(
        vaultId: string,
        adderWallet: PublicKey,
        newMemberWallet: PublicKey
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'join',
                    wallet: adderWallet.toString(),
                    targetWallet: newMemberWallet.toString(),
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });

            console.log('Evento de membro adicionado registrado');
        } catch (error) {
            console.error('Erro ao criar evento de membro:', error);
        }
    }

    /**
     * Criar evento de membro saiu
     */
    static async createMemberLeaveEvent(
        vaultId: string,
        memberWallet: PublicKey
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'leave',
                    wallet: memberWallet.toString(),
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });

            console.log('Evento de saída registrado');
        } catch (error) {
            console.error('Erro ao criar evento de saída:', error);
        }
    }

    /**
     * Criar evento de depósito aprovado
     */
    static async createDepositApprovedEvent(
        vaultId: string,
        requestEventId: string
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'deposit_approved',
                    wallet: 'system',
                    timestamp: firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        relatedEventId: requestEventId,
                    },
                });

            console.log('Evento de depósito aprovado registrado');
        } catch (error) {
            console.error('Erro ao criar evento:', error);
        }
    }

    /**
     * Criar evento de saque aprovado
     */
    static async createWithdrawApprovedEvent(
        vaultId: string,
        requestEventId: string
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'withdraw_approved',
                    wallet: 'system',
                    timestamp: firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        relatedEventId: requestEventId,
                    },
                });

            console.log('Evento de saque aprovado registrado');
        } catch (error) {
            console.error('Erro ao criar evento:', error);
        }
    }

    /**
     * Criar evento de configurações alteradas
     */
    static async createSettingsChangedEvent(
        vaultId: string,
        changerWallet: PublicKey
    ): Promise<void> {
        try {
            await firestore()
                .collection('vaults')
                .doc(vaultId)
                .collection('events')
                .add({
                    type: 'settings_changed',
                    wallet: changerWallet.toString(),
                    timestamp: firestore.FieldValue.serverTimestamp(),
                });

            console.log('Evento de alteração de configurações registrado');
        } catch (error) {
            console.error('Erro ao criar evento:', error);
        }
    }
}