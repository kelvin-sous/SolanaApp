// src/screens/main/CommunityVault/CreateVaultConfigScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { styles } from './createVaultConfigStyles';

interface CreateVaultConfigScreenProps {
  onBack: () => void;
  onNext: (config: VaultConfig) => void;
  publicKey: PublicKey;
}

interface VaultConfig {
  // Permissões de administradores
  adminCanInvite: boolean;
  adminCanPromote: boolean;
  adminCanRemove: boolean;
  
  // Métodos de saque
  founderWithdrawMethod: 'allFounders' | 'majorityFounders' | 'simpleMajority';
  generalWithdrawMethod: 'oneFounder' | 'allFounders' | 'majorityFounders' | 
                         'oneAdmin' | 'allAdmins' | 'simpleMajority';
  
  // Métodos de depósito
  depositMethod: 'oneFounder' | 'allFounders' | 'majorityFounders' | 
                 'oneAdmin' | 'allAdmins' | 'simpleMajority';
  
  // Quantidade de administradores
  maxAdmins: number;
}

const CreateVaultConfigScreen: React.FC<CreateVaultConfigScreenProps> = ({ 
  onBack, 
  onNext, 
  publicKey 
}) => {
  const [config, setConfig] = useState<VaultConfig>({
    adminCanInvite: false,
    adminCanPromote: false,
    adminCanRemove: false,
    founderWithdrawMethod: 'majorityFounders',
    generalWithdrawMethod: 'oneFounder',
    depositMethod: 'simpleMajority',
    maxAdmins: 3,
  });

  const handleNext = () => {
    // Simplesmente avança sem popup
    onNext(config);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262728" />
      
      {/* Título e indicador de progresso */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Criar caixa comunitário</Text>
        <View style={styles.progressIndicator}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.configContainer}>
          
          {/* SEÇÃO: Permissões de Administradores */}
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>Permissões de Administradores</Text>
            
            <View style={styles.configItem}>
              <View style={styles.configTextContainer}>
                <Text style={styles.configLabel}>
                  Usuário administrador pode convidar novos usuários?
                </Text>
              </View>
              <Switch
                value={config.adminCanInvite}
                onValueChange={(value) => setConfig({...config, adminCanInvite: value})}
                trackColor={{ false: "#767577", true: "#AB9FF3" }}
                thumbColor={config.adminCanInvite ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>

            <View style={styles.configItem}>
              <View style={styles.configTextContainer}>
                <Text style={styles.configLabel}>
                  Usuário administrador pode promover usuários convidados?
                </Text>
              </View>
              <Switch
                value={config.adminCanPromote}
                onValueChange={(value) => setConfig({...config, adminCanPromote: value})}
                trackColor={{ false: "#767577", true: "#AB9FF3" }}
                thumbColor={config.adminCanPromote ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>

            <View style={styles.configItem}>
              <View style={styles.configTextContainer}>
                <Text style={styles.configLabel}>
                  Usuário administrador pode remover usuários convidados do caixa comunitário?
                </Text>
              </View>
              <Switch
                value={config.adminCanRemove}
                onValueChange={(value) => setConfig({...config, adminCanRemove: value})}
                trackColor={{ false: "#767577", true: "#AB9FF3" }}
                thumbColor={config.adminCanRemove ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* SEÇÃO: Métodos de saques para fundadores */}
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>Métodos de saques para usuários fundadores:</Text>
            
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, founderWithdrawMethod: 'allFounders'})}
            >
              <View style={styles.radioButton}>
                {config.founderWithdrawMethod === 'allFounders' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de todos os usuários fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, founderWithdrawMethod: 'majorityFounders'})}
            >
              <View style={styles.radioButton}>
                {config.founderWithdrawMethod === 'majorityFounders' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto da maioria dos usuários fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, founderWithdrawMethod: 'simpleMajority'})}
            >
              <View style={styles.radioButton}>
                {config.founderWithdrawMethod === 'simpleMajority' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto por maioria simples</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* SEÇÃO: Métodos de saques gerais */}
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>Métodos de saques:</Text>
            <Text style={styles.warningText}>
              ⚠️ Usuários que abriram solicitação não podem votar!
            </Text>
            
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, generalWithdrawMethod: 'oneFounder'})}
            >
              <View style={styles.radioButton}>
                {config.generalWithdrawMethod === 'oneFounder' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de pelo menos um usuário fundador</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, generalWithdrawMethod: 'allFounders'})}
            >
              <View style={styles.radioButton}>
                {config.generalWithdrawMethod === 'allFounders' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de todos os usuários fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, generalWithdrawMethod: 'majorityFounders'})}
            >
              <View style={styles.radioButton}>
                {config.generalWithdrawMethod === 'majorityFounders' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto da maioria dos usuários fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, generalWithdrawMethod: 'oneAdmin'})}
            >
              <View style={styles.radioButton}>
                {config.generalWithdrawMethod === 'oneAdmin' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de pelo menos um administrador</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, generalWithdrawMethod: 'allAdmins'})}
            >
              <View style={styles.radioButton}>
                {config.generalWithdrawMethod === 'allAdmins' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de todos os administradores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, generalWithdrawMethod: 'simpleMajority'})}
            >
              <View style={styles.radioButton}>
                {config.generalWithdrawMethod === 'simpleMajority' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto por maioria simples</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* SEÇÃO: Métodos de depósitos */}
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>Métodos de depósitos:</Text>
            
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, depositMethod: 'oneFounder'})}
            >
              <View style={styles.radioButton}>
                {config.depositMethod === 'oneFounder' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de pelo menos um usuário fundador</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, depositMethod: 'allFounders'})}
            >
              <View style={styles.radioButton}>
                {config.depositMethod === 'allFounders' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de todos os usuários fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, depositMethod: 'majorityFounders'})}
            >
              <View style={styles.radioButton}>
                {config.depositMethod === 'majorityFounders' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto da maioria dos usuários fundadores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, depositMethod: 'oneAdmin'})}
            >
              <View style={styles.radioButton}>
                {config.depositMethod === 'oneAdmin' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de pelo menos um administrador</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, depositMethod: 'allAdmins'})}
            >
              <View style={styles.radioButton}>
                {config.depositMethod === 'allAdmins' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto de todos os administradores</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setConfig({...config, depositMethod: 'simpleMajority'})}
            >
              <View style={styles.radioButton}>
                {config.depositMethod === 'simpleMajority' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Voto por maioria simples</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* SEÇÃO: Quantidade de administradores */}
          <View style={styles.configSection}>
            <View style={styles.spinnerItem}>
              <Text style={styles.spinnerLabel}>Quantidade de usuários administradores:</Text>
              <View style={styles.spinnerContainer}>
                <TouchableOpacity 
                  style={styles.spinnerButton}
                  onPress={() => setConfig({
                    ...config, 
                    maxAdmins: Math.max(0, config.maxAdmins - 1)
                  })}
                >
                  <Text style={styles.spinnerButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.spinnerValue}>{config.maxAdmins}</Text>
                <TouchableOpacity 
                  style={styles.spinnerButton}
                  onPress={() => setConfig({
                    ...config, 
                    maxAdmins: Math.min(10, config.maxAdmins + 1)
                  })}
                >
                  <Text style={styles.spinnerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.spinnerHint}>Máximo de 10</Text>
            </View>
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

export default CreateVaultConfigScreen;