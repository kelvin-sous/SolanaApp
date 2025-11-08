// src/services/firebase/FirebaseService.ts

import firestore from '@react-native-firebase/firestore';

export interface VaultInvite {
  id?: string;
  vaultId: string;
  vaultName: string;
  vaultColor: string;
  inviterWallet: string;
  invitedWallet: string;
  role: string;
  members: number;
  balance: number;
  invitedAt: any;
  expiresAt: any;
  status: 'pending' | 'accepted' | 'rejected';
}

export class FirebaseService {
  
  // ========================================
  // CONVITES
  // ========================================
  
  /**
   * Criar convite no Firebase
   */
  static async createInvite(inviteData: Omit<VaultInvite, 'id'>): Promise<string> {
    try {
      console.log('Firebase: Criando convite...');
      
      const inviteRef = await firestore()
        .collection('invites')
        .add({
          ...inviteData,
          invitedAt: firestore.FieldValue.serverTimestamp(),
          expiresAt: firestore.Timestamp.fromDate(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
          ),
          status: 'pending'
        });
      
      console.log('Firebase: Convite criado com ID:', inviteRef.id);
      return inviteRef.id;
    } catch (error) {
      console.error('Firebase: Erro ao criar convite:', error);
      throw error;
    }
  }

  /**
   * Buscar convites pendentes de um usuário
   */
  static async getUserInvites(walletAddress: string): Promise<VaultInvite[]> {
    try {
      console.log('Firebase: Buscando convites para:', walletAddress);
      
      const snapshot = await firestore()
        .collection('invites')
        .where('invitedWallet', '==', walletAddress)
        .where('status', '==', 'pending')
        .get();
      
      const invites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VaultInvite[];
      
      console.log(`Firebase: Encontrados ${invites.length} convites pendentes`);
      return invites;
    } catch (error) {
      console.error('Firebase: Erro ao buscar convites:', error);
      return [];
    }
  }

  /**
   * Aceitar um convite
   */
  static async acceptInvite(inviteId: string): Promise<void> {
    try {
      console.log('Firebase: Aceitando convite:', inviteId);
      
      await firestore()
        .collection('invites')
        .doc(inviteId)
        .update({
          status: 'accepted',
          acceptedAt: firestore.FieldValue.serverTimestamp()
        });
      
      console.log('Firebase: Convite aceito');
    } catch (error) {
      console.error('Firebase: Erro ao aceitar convite:', error);
      throw error;
    }
  }

  /**
   * Recusar um convite
   */
  static async rejectInvite(inviteId: string): Promise<void> {
    try {
      console.log('Firebase: Recusando convite:', inviteId);
      
      await firestore()
        .collection('invites')
        .doc(inviteId)
        .update({
          status: 'rejected',
          rejectedAt: firestore.FieldValue.serverTimestamp()
        });
      
      console.log('Firebase: Convite recusado');
    } catch (error) {
      console.error('Firebase: Erro ao recusar convite:', error);
      throw error;
    }
  }

  /**
   * Escutar convites em tempo real (para notificações)
   */
  static listenToInvites(
    walletAddress: string, 
    callback: (invites: VaultInvite[]) => void
  ): () => void {
    console.log('Firebase: Iniciando listener de convites para:', walletAddress);
    
    const unsubscribe = firestore()
      .collection('invites')
      .where('invitedWallet', '==', walletAddress)
      .where('status', '==', 'pending')
      .onSnapshot(
        snapshot => {
          const invites = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as VaultInvite[];
          
          console.log(`Firebase: Listener atualizado - ${invites.length} convites`);
          callback(invites);
        },
        error => {
          console.error('Firebase: Erro no listener:', error);
        }
      );
    
    // Retorna função para cancelar o listener
    return unsubscribe;
  }

  // ========================================
  // CAIXAS (VAULTS)
  // ========================================
  
  /**
   * Criar caixa no Firebase
   */
  static async createVault(vaultData: any): Promise<string> {
    try {
      console.log('Firebase: Criando caixa...');
      
      const vaultRef = await firestore()
        .collection('vaults')
        .add({
          ...vaultData,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      
      console.log('Firebase: Caixa criado com ID:', vaultRef.id);
      return vaultRef.id;
    } catch (error) {
      console.error('Firebase: Erro ao criar caixa:', error);
      throw error;
    }
  }

  /**
   * Buscar caixas de um usuário
   */
  static async getUserVaults(walletAddress: string): Promise<any[]> {
    try {
      console.log('Firebase: Buscando caixas de:', walletAddress);
      
      const snapshot = await firestore()
        .collection('vaults')
        .where('members', 'array-contains', walletAddress)
        .get();
      
      const vaults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Firebase: Encontrados ${vaults.length} caixas`);
      return vaults;
    } catch (error) {
      console.error('Firebase: Erro ao buscar caixas:', error);
      return [];
    }
  }

  /**
   * Adicionar membro ao caixa
   */
  static async addMemberToVault(
    vaultId: string, 
    memberWallet: string, 
    role: string
  ): Promise<void> {
    try {
      console.log('Firebase: Adicionando membro ao caixa:', vaultId);
      
      await firestore()
        .collection('vaults')
        .doc(vaultId)
        .update({
          members: firestore.FieldValue.arrayUnion(memberWallet),
          [`memberRoles.${memberWallet}`]: role,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      
      console.log('Firebase: Membro adicionado ao caixa');
    } catch (error) {
      console.error('Firebase: Erro ao adicionar membro:', error);
      throw error;
    }
  }
}