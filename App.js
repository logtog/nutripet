import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
  useWindowDimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { StorageService } from './src/services/storage';
import { showMessage } from './src/services/validation';
import CreatePetScreen from './src/screens/CreatePetScreen';
import PetAvatarCard from './src/components/PetAvatarCard';
import DietScreen from './src/screens/DietScreen';
import HealthScreen from './src/screens/HealthScreen';

const BADGES_LIST = ['Super Pet ⭐', 'Comilão 🦴', 'Explorador 🐾', 'Dorminhoco 💤', 'Guardião 🛡️'];
const COLORS_LIST = ['#0D9488', '#2563EB', '#D97706', '#E11D48', '#7C3AED'];

export default function App() {
  const { width } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && width >= 880;

  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [activePetId, setActivePetId] = useState(null);
  const [isCreatingNewPet, setIsCreatingNewPet] = useState(false);
  const [isEditingCurrentPet, setIsEditingCurrentPet] = useState(false);
  const [activeTab, setActiveTab] = useState('diet');
  const [inAppToast, setInAppToast] = useState(null);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    setLoading(true);
    const data = await StorageService.loadAppState();
    setPets(data.pets || []);
    setActivePetId(data.activePetId || (data.pets?.length > 0 ? data.pets[0].id : null));
    setLoading(false);
  };

  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (toastData) => {
    clearTimeout(toastTimer.current);
    setInAppToast(toastData);
    toastTimer.current = setTimeout(() => {
      setInAppToast((current) => (current === toastData ? null : current));
    }, 5500);
  };

  // Se o id ativo não existir mais, cai para o primeiro pet (evita tela quebrada).
  const activePet = pets.find(p => p.id === activePetId) || pets[0] || null;

  const handleSaveNewPet = async (petData) => {
    const newState = await StorageService.addPet(petData);
    setPets(newState.pets);
    setActivePetId(petData.id);
    setIsCreatingNewPet(false);
    showToast({
      title: `🐾 ${petData.name} Cadastrado!`,
      body: 'O plano nutricional e a carteira de vacinação já estão ativos.',
      type: 'success'
    });
  };

  const handleUpdateCurrentPet = async (updatedPetData) => {
    const newState = await StorageService.updatePet(updatedPetData);
    setPets(newState.pets);
    setIsEditingCurrentPet(false);
  };

  const performDelete = async (pet) => {
    const newState = await StorageService.deletePet(pet.id);
    setPets(newState.pets);
    setActivePetId(newState.activePetId);
    showToast({
      title: `🗑️ ${pet.name} removido`,
      body: 'O perfil foi excluído do armazenamento local.',
      type: 'info'
    });
  };

  const handleDeleteCurrentPet = () => {
    if (!activePet) return;
    const pet = activePet;
    const confirmMsg = `Deseja remover o perfil de ${pet.name}? Esta ação não pode ser desfeita.`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) performDelete(pet);
    } else {
      Alert.alert('Excluir perfil', confirmMsg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => performDelete(pet) },
      ]);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showMessage(Platform, Alert, 'Permissão', 'Permita o acesso à galeria para escolher foto!');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        handleUpdateCurrentPet({
          ...activePet,
          photoUri: res.assets[0].uri
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeBadge = () => {
    const currentIndex = BADGES_LIST.indexOf(activePet.avatarBadge || BADGES_LIST[0]);
    const nextBadge = BADGES_LIST[(currentIndex + 1) % BADGES_LIST.length];
    handleUpdateCurrentPet({ ...activePet, avatarBadge: nextBadge });
  };

  const handleChangeColor = () => {
    const currentIndex = COLORS_LIST.indexOf(activePet.avatarColor || COLORS_LIST[0]);
    const nextColor = COLORS_LIST[(currentIndex + 1) % COLORS_LIST.length];
    handleUpdateCurrentPet({ ...activePet, avatarColor: nextColor });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Carregando NutriPet Portal...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* BANNER FLUTUANTE DE NOTIFICAÇÃO AO VIVO (TOAST IN-APP) */}
      {inAppToast && (
        <View style={styles.toastWrapper}>
          <View style={[
            styles.toastBox,
            inAppToast.type === 'bell' && styles.toastBell,
            inAppToast.type === 'warning' && styles.toastWarning
          ]}>
            <View style={styles.toastIconCircle}>
              <Ionicons
                name={
                  inAppToast.type === 'bell' ? 'notifications' :
                  inAppToast.type === 'warning' ? 'warning' : 'checkmark-circle'
                }
                size={22}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{inAppToast.title}</Text>
              <Text style={styles.toastBody}>{inAppToast.body}</Text>
            </View>
            <TouchableOpacity onPress={() => setInAppToast(null)} style={styles.toastClose}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TOPBAR GLOBAL SEMPRE VISÍVEL (Permite cancelar o "+ Adicionar Pet" a qualquer momento!) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.brandRow}
          activeOpacity={0.8}
          onPress={() => {
            if (pets.length > 0) {
              setIsCreatingNewPet(false);
              setIsEditingCurrentPet(false);
            }
          }}
        >
          <View style={styles.logoIconBox}>
            <Ionicons name="paw" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>NutriPet</Text>
            <Text style={styles.headerSubtitle}>Saúde & Nutrição Inteligente</Text>
          </View>
          {pets.length > 0 && (
            <View style={styles.totalPetsBadge}>
              <Text style={styles.totalPetsBadgeText}>
                {pets.length} {pets.length === 1 ? 'Animal' : 'Animais'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Botão Dinâmico: Se estiver criando/editando, mostra "Voltar ao Painel"; senão mostra "+ Adicionar Pet" */}
        {pets.length > 0 && (
          isCreatingNewPet || isEditingCurrentPet ? (
            <TouchableOpacity
              style={styles.cancelHeaderBtn}
              onPress={() => {
                setIsCreatingNewPet(false);
                setIsEditingCurrentPet(false);
              }}
            >
              <Ionicons name="arrow-back" size={16} color="#0F172A" />
              <Text style={styles.cancelHeaderBtnText}>Voltar ao Painel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.newPetBtn}
              onPress={() => setIsCreatingNewPet(true)}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.newPetBtnText}>Adicionar Pet</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* SE ESTIVER CRIANDO OU EDITANDO PET */}
      {isCreatingNewPet || pets.length === 0 ? (
        <CreatePetScreen
          onSavePet={handleSaveNewPet}
          onCancel={pets.length > 0 ? () => setIsCreatingNewPet(false) : null}
        />
      ) : isEditingCurrentPet && activePet ? (
        <CreatePetScreen
          existingPet={activePet}
          onSavePet={handleUpdateCurrentPet}
          onCancel={() => setIsEditingCurrentPet(false)}
        />
      ) : (
        /* PORTAL PRINCIPAL COM SIDEBAR DE MÚLTIPLOS PETS + PAINEL CENTRAL */
        <View style={[styles.mainLayout, isWebWide && styles.mainLayoutWeb]}>
          
          {/* SIDEBAR DE ANIMAIS */}
          <View style={[styles.petsSidebar, isWebWide && styles.petsSidebarWeb]}>
            <View style={styles.sidebarHeaderRow}>
              <Text style={styles.sidebarSectionTitle}>MEUS PETS ({pets.length})</Text>
            </View>
            
            <ScrollView
              horizontal={!isWebWide}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.petListContainer, isWebWide && styles.petListContainerWeb]}
            >
              {pets.map(p => {
                const isSelected = p.id === activePetId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.petItem,
                      isWebWide && styles.petItemWeb,
                      isSelected && styles.petItemActive,
                      { borderLeftColor: p.avatarColor || '#0D9488' }
                    ]}
                    onPress={() => setActivePetId(p.id)}
                  >
                    <View style={[styles.petMiniThumb, { backgroundColor: (p.avatarColor || '#0D9488') + '25' }]}>
                      {p.photoUri ? (
                        <Image source={{ uri: p.photoUri }} style={styles.petMiniImage} />
                      ) : (
                        <Text style={styles.petMiniEmoji}>{p.species === 'cat' ? '🐱' : '🐶'}</Text>
                      )}
                    </View>

                    <View style={styles.petItemInfo}>
                      <Text style={[styles.petItemName, isSelected && styles.petItemNameActive]}>
                        {p.name}
                      </Text>
                      <Text style={styles.petItemSub} numberOfLines={1}>
                        {p.breed} • {p.weight}kg
                      </Text>
                    </View>

                    {isSelected && isWebWide && (
                      <Ionicons name="chevron-forward" size={16} color="#0D9488" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* CONTEÚDO CENTRAL */}
          <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentAreaInner}>
            
            {/* TOPO DO PAINEL: Personagem + Ficha Rápida */}
            <View style={[styles.dashboardTopCard, isWebWide && styles.dashboardTopCardWeb]}>
              <View style={{ flex: 1.3 }}>
                <PetAvatarCard
                  pet={activePet}
                  onPickImage={handlePickPhoto}
                  onChangeBadge={handleChangeBadge}
                  onChangeColor={handleChangeColor}
                />
              </View>

              <View style={[styles.petMetaPanel, isWebWide && styles.petMetaPanelWeb]}>
                <View>
                  <View style={styles.metaHeaderRow}>
                    <Ionicons name="document-text-outline" size={18} color="#0D9488" />
                    <Text style={styles.metaTitle}>Resumo Clínico & Nutricional</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Espécie / Sexo</Text>
                    <Text style={styles.metaValue}>
                      {activePet.species === 'cat' ? 'Felino' : 'Canino'} ({activePet.gender === 'female' ? 'Fêmea' : 'Macho'})
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Castração</Text>
                    <Text style={styles.metaValue}>{activePet.isNeutered ? 'Sim (Castrado)' : 'Não castrado'}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Ração em Uso</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{activePet.diet?.brandName || 'Não informada'}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Frequência</Text>
                    <Text style={styles.metaValue}>A cada {activePet.diet?.mealIntervalHours || 8}h ({activePet.diet?.dailyGrams || 200}g/dia)</Text>
                  </View>
                </View>

                <View style={styles.petManagementActions}>
                  <TouchableOpacity
                    style={styles.mgmtBtn}
                    onPress={() => setIsEditingCurrentPet(true)}
                  >
                    <Ionicons name="create-outline" size={15} color="#334155" />
                    <Text style={styles.mgmtBtnText}>Editar Perfil</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.mgmtBtn, styles.deleteBtn]}
                    onPress={handleDeleteCurrentPet}
                  >
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                    <Text style={[styles.mgmtBtnText, styles.deleteBtnText]}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* BARRA DE ABAS ESTILO PÍLULA MODERNA */}
            <View style={styles.segmentedTabsContainer}>
              <TouchableOpacity
                style={[styles.segmentedTab, activeTab === 'diet' && styles.segmentedTabActive]}
                onPress={() => setActiveTab('diet')}
              >
                <Ionicons
                  name="restaurant-outline"
                  size={16}
                  color={activeTab === 'diet' ? '#FFFFFF' : '#475569'}
                />
                <Text style={[styles.segmentedTabText, activeTab === 'diet' && styles.segmentedTabTextActive]}>
                  Nutrição, Ração & Notificações
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentedTab, activeTab === 'health' && styles.segmentedTabActive]}
                onPress={() => setActiveTab('health')}
              >
                <Ionicons
                  name="medkit-outline"
                  size={16}
                  color={activeTab === 'health' ? '#FFFFFF' : '#475569'}
                />
                <Text style={[styles.segmentedTabText, activeTab === 'health' && styles.segmentedTabTextActive]}>
                  Vacinas & Ciclo Reprodutivo
                </Text>
              </TouchableOpacity>
            </View>

            {/* CONTEÚDO DA ABA ATIVA */}
            {activeTab === 'diet' && (
              <DietScreen
                pet={activePet}
                diet={activePet.diet}
                onUpdateDiet={(newDiet) => handleUpdateCurrentPet({ ...activePet, diet: newDiet })}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'health' && (
              <HealthScreen
                pet={activePet}
                vaccines={activePet.vaccines}
                onUpdateVaccines={(newVac) => handleUpdateCurrentPet({ ...activePet, vaccines: newVac })}
                onShowToast={showToast}
              />
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  toastWrapper: {
    position: 'absolute',
    top: 76,
    right: 24,
    left: 24,
    zIndex: 9999,
    alignItems: 'flex-end',
    pointerEvents: 'box-none',
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    maxWidth: 440,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#10B981',
  },
  toastBell: {
    borderLeftColor: '#F59E0B',
  },
  toastWarning: {
    borderLeftColor: '#EF4444',
  },
  toastIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  toastBody: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  toastClose: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  totalPetsBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginLeft: 6,
  },
  totalPetsBadgeText: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
  },
  newPetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newPetBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  cancelHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  cancelHeaderBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  mainLayoutWeb: {
    flexDirection: 'row',
  },
  petsSidebar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  petsSidebarWeb: {
    width: 280,
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: '#E7E5E4',
    paddingVertical: 22,
  },
  sidebarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  petListContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  petListContainerWeb: {
    flexDirection: 'column',
    gap: 10,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    backgroundColor: '#FAF8F5',
    gap: 10,
    minWidth: 170,
  },
  petItemWeb: {
    minWidth: '100%',
    padding: 12,
    borderLeftWidth: 4,
  },
  petItemActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  petMiniThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petMiniImage: {
    width: '100%',
    height: '100%',
  },
  petMiniEmoji: {
    fontSize: 20,
  },
  petItemInfo: {
    flex: 1,
  },
  petItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  petItemNameActive: {
    color: '#0F766E',
  },
  petItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  contentArea: {
    flex: 1,
  },
  contentAreaInner: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  dashboardTopCard: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 20,
  },
  dashboardTopCardWeb: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  petMetaPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  petMetaPanelWeb: {
    maxWidth: 400,
  },
  metaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
    maxWidth: 190,
  },
  petManagementActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  mgmtBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  mgmtBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  deleteBtnText: {
    color: '#EF4444',
  },
  segmentedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E7E5E4',
    padding: 5,
    borderRadius: 14,
    marginBottom: 20,
    gap: 6,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  segmentedTabActive: {
    backgroundColor: '#0D9488',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  segmentedTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
