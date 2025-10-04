// src/hooks/useCommunityVault.ts

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  CommunityVault, 
  CreateVaultForm, 
  Proposal, 
  VaultTransaction,
  VaultMember,
  MemberRole 
} from '../services/communityVault/types';

const STORAGE_KEY = '@community_vaults';

export const useCommunityVault = (userPublicKey: PublicKey) => {
  const [vaults, setVaults] = useState<CommunityVault[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar caixas do armazenamento local
  const loadVaults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Por enquanto, vamos usar AsyncStorage para persistência local
      // No futuro, isso virá da blockchain
      const storedVaults = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedVaults) {
        const parsedVaults = JSON.parse(storedVaults);
        // Filtrar apenas caixas que o usuário participa
        const userVaults = parsedVaults.filter((vault: CommunityVault) => 
          vault.creator.toString() === userPublicKey.toString() ||
          vault.members.some((m: VaultMember) => 
            m.publicKey.toString() === userPublicKey.toString()
          )
        );
        setVaults(userVaults);
      }
    } catch (err) {
      console.error('Erro ao carregar caixas:', err);
      setError('Não foi possível carregar os caixas');
    } finally {
      setIsLoading(false);
    }
  }, [userPublicKey]);

  // Salvar caixas no armazenamento
  const saveVaults = useCallback(async (newVaults: CommunityVault[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newVaults));
      setVaults(newVaults);
    } catch (err) {
      console.error('Erro ao salvar caixas:', err);
      throw err;
    }
  }, []);

  // Criar novo caixa
  const createVault = useCallback(async (form: CreateVaultForm): Promise<CommunityVault> => {
    try {
      setIsLoading(true);
      setError(null);

      // Gerar ID único para o caixa
      const vaultId = `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Criar o objeto do caixa
      const newVault: CommunityVault = {
        id: vaultId,
        name: form.name,
        description: form.description,
        icon: form.icon || '',
        creator: userPublicKey,
        balance: 0,
        members: [
          {
            publicKey: userPublicKey,
            role: MemberRole.FOUNDER,
            joinedAt: new Date(),
            nickname: 'Fundador',
            depositedAmount: 0,
            withdrawnAmount: 0
          }
        ],
        settings: {
          entryFee: form.entryFee,
          maxMembers: form.maxMembers,
          allowGuestDeposits: false,
          allowGuestWithdrawals: false,
          depositRules: {
            requiresVoting: false,
            minVotesRequired: 0,
            votingPeriod: 0
          },
          withdrawRules: {
            requiresVoting: form.requiresVotingForWithdraw,
            minVotesRequired: form.minVotesForWithdraw,
            votingPeriod: 86400 // 24 horas
          },
          adminPermissions: ['ADD_MEMBER', 'REMOVE_GUEST', 'CREATE_PROPOSAL'],
          guestPermissions: ['VIEW', 'DEPOSIT'],
          withdrawalLimit: form.withdrawalLimit
        },
        proposals: [],
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        inviteCode: generateInviteCode(),
        category: form.category,
        stats: {
          totalDeposited: 0,
          totalWithdrawn: 0,
          totalMembers: 1,
          activeProposals: 0,
          completedProposals: 0,
          lastActivity: new Date()
        }
      };

      // TODO: Aqui seria o momento de criar o caixa na blockchain
      // Por enquanto, vamos salvar localmente
      const allVaults = await loadAllVaults();
      allVaults.push(newVault);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allVaults));
      
      // Atualizar lista local
      setVaults([...vaults, newVault]);
      
      return newVault;
    } catch (err) {
      console.error('Erro ao criar caixa:', err);
      setError('Não foi possível criar o caixa');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userPublicKey, vaults]);

  // Entrar em um caixa com código
  const joinVault = useCallback(async (inviteCode: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const allVaults = await loadAllVaults();
      const vault = allVaults.find((v: CommunityVault) => 
        v.inviteCode === inviteCode.toUpperCase()
      );

      if (!vault) {
        throw new Error('Código de convite inválido');
      }

      // Verificar se já é membro
      const isMember = vault.members.some((m: VaultMember) => 
        m.publicKey.toString() === userPublicKey.toString()
      );

      if (isMember) {
        throw new Error('Você já é membro deste caixa');
      }

      // Verificar limite de membros
      if (vault.members.length >= vault.settings.maxMembers) {
        throw new Error('Este caixa já atingiu o limite de membros');
      }

      // TODO: Aqui seria o pagamento da taxa de entrada via blockchain
      // Por enquanto, vamos apenas adicionar o membro

      // Adicionar novo membro
      const newMember: VaultMember = {
        publicKey: userPublicKey,
        role: MemberRole.GUEST,
        joinedAt: new Date(),
        depositedAmount: vault.settings.entryFee,
        withdrawnAmount: 0
      };

      vault.members.push(newMember);
      vault.balance += vault.settings.entryFee;
      vault.stats.totalMembers += 1;
      vault.stats.totalDeposited += vault.settings.entryFee;
      vault.updatedAt = new Date();

      // Registrar transação de entrada
      const entryTransaction: VaultTransaction = {
        id: `tx_${Date.now()}`,
        vaultId: vault.id,
        type: 'FEE',
        amount: vault.settings.entryFee,
        from: userPublicKey,
        initiator: userPublicKey,
        comment: 'Taxa de entrada no caixa',
        timestamp: new Date()
      };

      vault.transactions.push(entryTransaction);

      // Salvar alterações
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allVaults));
      
      // Atualizar lista local
      await loadVaults();
    } catch (err: any) {
      console.error('Erro ao entrar no caixa:', err);
      setError(err.message || 'Não foi possível entrar no caixa');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userPublicKey, loadVaults]);

  // Fazer depósito no caixa
  const depositToVault = useCallback(async (
    vaultId: string, 
    amount: number, 
    comment: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implementar depósito via blockchain
      
      const vault = vaults.find(v => v.id === vaultId);
      if (!vault) {
        throw new Error('Caixa não encontrado');
      }

      // Atualizar saldo
      vault.balance += amount;
      vault.stats.totalDeposited += amount;
      
      // Registrar transação
      const transaction: VaultTransaction = {
        id: `tx_${Date.now()}`,
        vaultId,
        type: 'DEPOSIT',
        amount,
        from: userPublicKey,
        initiator: userPublicKey,
        comment: comment.substring(0, 150),
        timestamp: new Date()
      };

      vault.transactions.push(transaction);
      vault.updatedAt = new Date();
      vault.stats.lastActivity = new Date();

      // Salvar alterações
      await saveVaults(vaults);
    } catch (err: any) {
      console.error('Erro ao depositar:', err);
      setError(err.message || 'Não foi possível fazer o depósito');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vaults, userPublicKey, saveVaults]);

  // Criar proposta de saque
  const createWithdrawProposal = useCallback(async (
    vaultId: string,
    amount: number,
    description: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const vault = vaults.find(v => v.id === vaultId);
      if (!vault) {
        throw new Error('Caixa não encontrado');
      }

      if (amount > vault.balance) {
        throw new Error('Saldo insuficiente no caixa');
      }

      // TODO: Criar proposta na blockchain
      
      const proposal: Proposal = {
        id: `prop_${Date.now()}`,
        vaultId,
        proposer: userPublicKey,
        type: 'WITHDRAW' as any,
        amount,
        description: description.substring(0, 150),
        votes: [],
        status: 'PENDING' as any,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + vault.settings.withdrawRules.votingPeriod * 1000)
      };

      vault.proposals.push(proposal);
      vault.stats.activeProposals += 1;
      vault.updatedAt = new Date();

      await saveVaults(vaults);
    } catch (err: any) {
      console.error('Erro ao criar proposta:', err);
      setError(err.message || 'Não foi possível criar a proposta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vaults, userPublicKey, saveVaults]);

  // Carregar todos os caixas (helper)
  const loadAllVaults = async (): Promise<CommunityVault[]> => {
    const storedVaults = await AsyncStorage.getItem(STORAGE_KEY);
    return storedVaults ? JSON.parse(storedVaults) : [];
  };

  // Gerar código de convite
  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Carregar caixas ao montar
  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

  return {
    vaults,
    isLoading,
    error,
    createVault,
    joinVault,
    depositToVault,
    createWithdrawProposal,
    refreshVaults: loadVaults
  };
};