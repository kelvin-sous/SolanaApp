// src/screens/main/CommunityVault/CreateVaultDetailsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PublicKey } from '@solana/web3.js';
import { styles } from './createVaultDetailsStyles';

interface CreateVaultDetailsScreenProps {
  onBack: () => void;
  onNext: (details: VaultDetails) => void;
  publicKey: PublicKey;
  previousConfig: any;
}

interface VaultDetails {
  icon: string | null;
  name: string;
  description: string;
  allowMinimumWithdrawals: boolean;
  minimumWithdrawalLimit?: number;
  displayDeposits: {
    founders: boolean;
    admins: boolean;
    guests: boolean;
  };
  displayWithdrawals: {
    founders: boolean;
    admins: boolean;
    guests: boolean;
  };
}

const CreateVaultDetailsScreen: React.FC<CreateVaultDetailsScreenProps> = ({ 
  onBack, 
  onNext, 
  publicKey,
  previousConfig 
}) => {
  const [details, setDetails] = useState<VaultDetails>({
    icon: null,
    name: '',
    description: '',
    allowMinimumWithdrawals: false,
    minimumWithdrawalLimit: 0,
    displayDeposits: {
      founders: true,
      admins: false,
      guests: false,
    },
    displayWithdrawals: {
      founders: true,
      admins: false,
      guests: false,
    },
  });

  const [selectedIcon, setSelectedIcon] = useState<number | null>(null);

  // Ícones pré-definidos
  const predefinedIcons = [
    require('../../../../assets/icons/phantom.png'),
    require('../../../../assets/icons/moneyBranco.png'),
    require('../../../../assets/icons/solana.png'),
  ];

  const handleSelectIcon = (index: number) => {
    setSelectedIcon(index);
    setDetails({ ...details, icon: `predefined_${index}` });
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão Negada', 'É necessário permitir acesso à galeria para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedIcon(null);
      setDetails({ ...details, icon: result.assets[0].uri });
    }
  };

  const handleNext = () => {
    if (!details.name.trim()) {
      Alert.alert('Erro', 'Digite um nome para o caixa comunitário');
      return;
    }

    if (details.name.length > 80) {
      Alert.alert('Erro', 'O nome deve ter no máximo 80 caracteres');
      return;
    }

    if (details.description.length > 200) {
      Alert.alert('Erro', 'A descrição deve ter no máximo 200 caracteres');
      return;
    }

    if (details.allowMinimumWithdrawals && (!details.minimumWithdrawalLimit || details.minimumWithdrawalLimit <= 0)) {
      Alert.alert('Erro', 'Digite um limite válido para saques automáticos');
      return;
    }

    onNext(details);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Título e indicador de progresso */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Criar caixa comunitário</Text>
        <View style={styles.progressIndicator}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.configContainer}>
          
          {/* Seleção de ícone */}
          <View style={styles.iconSection}>
            <Text style={styles.sectionTitle}>Escolha o ícone do seu caixa:</Text>
            
            <View style={styles.iconGrid}>
              {predefinedIcons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconOption,
                    selectedIcon === index && styles.iconOptionSelected
                  ]}
                  onPress={() => handleSelectIcon(index)}
                >
                  <Image source={icon} style={styles.iconImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[
                  styles.iconOption,
                  details.icon && !selectedIcon && styles.iconOptionSelected
                ]}
                onPress={handlePickImage}
              >
                {details.icon && !selectedIcon ? (
                  <Image source={{ uri: details.icon }} style={styles.iconImage} resizeMode="cover" />
                ) : (
                  <View style={styles.uploadIconContainer}>
                    <Text style={styles.uploadIconText}>📷</Text>
                    <Text style={styles.uploadText}>Editar ícone</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Nome do caixa */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Dê um nome ao seu caixa comunitário:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Vaquinha viagem"
              placeholderTextColor="#666"
              value={details.name}
              onChangeText={(text) => setDetails({ ...details, name: text })}
              maxLength={80}
            />
            <Text style={styles.charCount}>{details.name.length}/80</Text>
          </View>

          {/* Descrição do caixa */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Adicione uma descrição ao seu caixa:</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Ex: Objetivos, regras, motivação..."
              placeholderTextColor="#666"
              value={details.description}
              onChangeText={(text) => setDetails({ ...details, description: text })}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{details.description.length}/200</Text>
          </View>

          <View style={styles.divider} />

          {/* Toggle: Saques mínimos automáticos */}
          <View style={styles.configItem}>
            <View style={styles.configTextContainer}>
              <Text style={styles.configLabel}>
                Permitir saques mínimos sem a necessidade de votos?
              </Text>
              <Text style={styles.configHint}>
                Esta opção dá direito a qualquer membro realizar um saque dentro do limite selecionado!
              </Text>
            </View>
            <Switch
              value={details.allowMinimumWithdrawals}
              onValueChange={(value) => setDetails({...details, allowMinimumWithdrawals: value})}
              trackColor={{ false: "#767577", true: "#AB9FF3" }}
              thumbColor={details.allowMinimumWithdrawals ? "#FFFFFF" : "#f4f3f4"}
            />
          </View>

          {/* Limite de saque automático */}
          {details.allowMinimumWithdrawals && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Limite de saque máximo automático:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00 SOL"
                placeholderTextColor="#666"
                value={details.minimumWithdrawalLimit?.toString() || ''}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 0;
                  setDetails({ ...details, minimumWithdrawalLimit: value });
                }}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.divider} />

          {/* Checkbox: Exibir valor depositado */}
          <View style={styles.checkboxSection}>
            <Text style={styles.sectionTitle}>Exibir valor depositado por membro:</Text>
            
            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => setDetails({
                ...details,
                displayDeposits: { ...details.displayDeposits, founders: !details.displayDeposits.founders }
              })}
            >
              <View style={styles.checkbox}>
                {details.displayDeposits.founders && <View style={styles.checkboxChecked} />}
              </View>
              <Text style={styles.checkboxLabel}>Fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => setDetails({
                ...details,
                displayDeposits: { ...details.displayDeposits, admins: !details.displayDeposits.admins }
              })}
            >
              <View style={styles.checkbox}>
                {details.displayDeposits.admins && <View style={styles.checkboxChecked} />}
              </View>
              <Text style={styles.checkboxLabel}>Administradores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => setDetails({
                ...details,
                displayDeposits: { ...details.displayDeposits, guests: !details.displayDeposits.guests }
              })}
            >
              <View style={styles.checkbox}>
                {details.displayDeposits.guests && <View style={styles.checkboxChecked} />}
              </View>
              <Text style={styles.checkboxLabel}>Convidados</Text>
            </TouchableOpacity>
          </View>

          {/* Checkbox: Exibir valor sacado */}
          <View style={styles.checkboxSection}>
            <Text style={styles.sectionTitle}>Exibir valor sacado:</Text>
            
            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => setDetails({
                ...details,
                displayWithdrawals: { ...details.displayWithdrawals, founders: !details.displayWithdrawals.founders }
              })}
            >
              <View style={styles.checkbox}>
                {details.displayWithdrawals.founders && <View style={styles.checkboxChecked} />}
              </View>
              <Text style={styles.checkboxLabel}>Fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => setDetails({
                ...details,
                displayWithdrawals: { ...details.displayWithdrawals, admins: !details.displayWithdrawals.admins }
              })}
            >
              <View style={styles.checkbox}>
                {details.displayWithdrawals.admins && <View style={styles.checkboxChecked} />}
              </View>
              <Text style={styles.checkboxLabel}>Administradores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => setDetails({
                ...details,
                displayWithdrawals: { ...details.displayWithdrawals, guests: !details.displayWithdrawals.guests }
              })}
            >
              <View style={styles.checkbox}>
                {details.displayWithdrawals.guests && <View style={styles.checkboxChecked} />}
              </View>
              <Text style={styles.checkboxLabel}>Convidados</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Botões de ação */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateVaultDetailsScreen;