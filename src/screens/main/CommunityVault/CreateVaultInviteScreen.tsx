// src/screens/main/CommunityVault/CreateVaultInviteScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Modal,
  Clipboard,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { styles } from './createVaultInviteStyles';
import { MemberRole } from '../../../services/communityVault/types';

interface CreateVaultInviteScreenProps {
  onBack: () => void;
  onCreate: (invites: VaultInvite[]) => void;
  publicKey: PublicKey;
  previousConfig: any;
  previousDetails: any;
}

interface VaultInvite {
  wallet: string;
  role: MemberRole;
}

const CreateVaultInviteScreen: React.FC<CreateVaultInviteScreenProps> = ({ 
  onBack, 
  onCreate, 
  publicKey,
  previousConfig,
  previousDetails
}) => {
  const [walletInput, setWalletInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>(MemberRole.GUEST);
  const [invitedMembers, setInvitedMembers] = useState<VaultInvite[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false); // NOVO
  const [showEditRolePicker, setShowEditRolePicker] = useState(false); // NOVO
  const [editingMember, setEditingMember] = useState<VaultInvite | null>(null);
  const [editingRole, setEditingRole] = useState<MemberRole>(MemberRole.GUEST);

  // Opções de cargo
  const roleOptions = [
    { value: MemberRole.GUEST, label: 'Convidado' },
    { value: MemberRole.ADMIN, label: 'Administrador' },
    { value: MemberRole.FOUNDER, label: 'Fundador' },
  ];

  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setWalletInput(text.trim());
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível colar o texto');
    }
  };

  const handleAddMember = () => {
    const trimmedWallet = walletInput.trim();

    if (!trimmedWallet) {
      Alert.alert('Erro', 'Digite uma wallet');
      return;
    }

    if (!isValidSolanaAddress(trimmedWallet)) {
      Alert.alert('Erro', 'Wallet Solana inválida');
      return;
    }

    if (trimmedWallet === publicKey.toString()) {
      Alert.alert('Erro', 'Você não pode convidar a si mesmo');
      return;
    }

    if (invitedMembers.some(m => m.wallet === trimmedWallet)) {
      Alert.alert('Erro', 'Esta wallet já foi convidada');
      return;
    }

    const newMember: VaultInvite = {
      wallet: trimmedWallet,
      role: selectedRole
    };

    setInvitedMembers([...invitedMembers, newMember]);
    setWalletInput('');
    setSelectedRole(MemberRole.GUEST);

    Alert.alert('Sucesso', 'Membro adicionado à lista de convites');
  };

  const handleEditMember = (member: VaultInvite) => {
    setEditingMember(member);
    setEditingRole(member.role);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingMember) {
      const updatedMembers = invitedMembers.map(m =>
        m.wallet === editingMember.wallet
          ? { ...m, role: editingRole }
          : m
      );
      setInvitedMembers(updatedMembers);
      setShowEditModal(false);
      setEditingMember(null);
      Alert.alert('Sucesso', 'Cargo atualizado');
    }
  };

  const handleRemoveMember = () => {
    if (editingMember) {
      Alert.alert(
        'Confirmar Remoção',
        'Deseja remover este membro da lista?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: () => {
              setInvitedMembers(invitedMembers.filter(m => m.wallet !== editingMember.wallet));
              setShowEditModal(false);
              setEditingMember(null);
              Alert.alert('Sucesso', 'Membro removido');
            }
          }
        ]
      );
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Criar Caixa Sozinho?',
      'Você pode adicionar membros depois. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => onCreate([])
        }
      ]
    );
  };

  const handleCreate = () => {
    if (invitedMembers.length < 1) {
      Alert.alert(
        'Atenção',
        'É necessário convidar pelo menos 1 pessoa para criar o caixa comunitário.\n\nOu clique em "Pular" para criar sozinho.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Criar Caixa Comunitário',
      `Você está criando um caixa com ${invitedMembers.length} convite(s).\n\nOs convites expiram em 7 dias.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Criar',
          onPress: () => onCreate(invitedMembers)
        }
      ]
    );
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const getRoleName = (role: MemberRole) => {
    const names = {
      [MemberRole.FOUNDER]: 'Fundador',
      [MemberRole.ADMIN]: 'Administrador',
      [MemberRole.GUEST]: 'Convidado'
    };
    return names[role];
  };

  const canCreate = invitedMembers.length >= 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      <View style={styles.headerSection}>
        <Text style={styles.title}>Criar caixa comunitário</Text>
        <View style={styles.progressIndicator}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.configContainer}>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Cole a wallet pública:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Endereço da wallet Solana"
                placeholderTextColor="#666"
                value={walletInput}
                onChangeText={setWalletInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.pasteButton}
                onPress={handlePaste}
              >
                <Text style={styles.pasteButtonText}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DROPDOWN CUSTOMIZADO */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Cargo:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowRolePicker(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {getRoleName(selectedRole)}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.addButton,
              !walletInput.trim() && styles.addButtonDisabled
            ]}
            onPress={handleAddMember}
            disabled={!walletInput.trim()}
          >
            <Text style={styles.addButtonText}>+ Adicionar</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.invitedSection}>
            <Text style={styles.invitedTitle}>
              Membros convidados ({invitedMembers.length})
            </Text>
            <Text style={styles.invitedSubtitle}>
              Mínimo de 1 membro para criar o caixa
            </Text>

            {invitedMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyText}>
                  Nenhum membro convidado ainda
                </Text>
              </View>
            ) : (
              invitedMembers.map((member, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.memberCard}
                  onPress={() => handleEditMember(member)}
                >
                  <View style={styles.memberCardHeader}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberWallet}>
                        {formatWallet(member.wallet)}
                      </Text>
                      <Text style={styles.memberRole}>
                        {getRoleName(member.role)}
                      </Text>
                    </View>
                    <View style={styles.menuButton}>
                      <Text style={styles.menuIcon}>⋮</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {invitedMembers.length === 0 && (
            <View style={styles.validationWarning}>
              <Text style={styles.warningText}>
                ⚠️ Convide pelo menos 1 pessoa ou clique em "Pular" para criar o caixa sozinho
              </Text>
            </View>
          )}

          {invitedMembers.length >= 1 && (
            <View style={styles.validationSuccess}>
              <Text style={styles.successText}>
                ✓ Pronto para criar! Os convites expiram em 7 dias
              </Text>
            </View>
          )}

        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Pular</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.createButton,
            !canCreate && styles.createButtonDisabled
          ]}
          onPress={handleCreate}
          disabled={!canCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>Criar</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PICKER DE CARGO (ADICIONAR) */}
      <Modal
        visible={showRolePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRolePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRolePicker(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerTitle}>Selecione o cargo</Text>
            {roleOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  selectedRole === option.value && styles.pickerOptionSelected
                ]}
                onPress={() => {
                  setSelectedRole(option.value);
                  setShowRolePicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  selectedRole === option.value && styles.pickerOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {selectedRole === option.value && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE EDIÇÃO */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Membro</Text>
            
            {editingMember && (
              <>
                <Text style={styles.modalWallet}>
                  {formatWallet(editingMember.wallet)}
                </Text>

                <Text style={styles.modalRoleLabel}>Cargo:</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowEditRolePicker(true)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {getRoleName(editingRole)}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={handleRemoveMember}
                >
                  <Text style={styles.removeButtonText}>Remover</Text>
                </TouchableOpacity>

                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalSaveButton}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.modalSaveText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL PICKER DE CARGO (EDITAR) */}
      <Modal
        visible={showEditRolePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditRolePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEditRolePicker(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerTitle}>Selecione o cargo</Text>
            {roleOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  editingRole === option.value && styles.pickerOptionSelected
                ]}
                onPress={() => {
                  setEditingRole(option.value);
                  setShowEditRolePicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  editingRole === option.value && styles.pickerOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {editingRole === option.value && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CreateVaultInviteScreen;