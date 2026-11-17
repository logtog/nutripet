import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BREEDS_DATABASE, DEFAULT_VACCINES } from '../data/database';

export default function CreatePetScreen({ onSavePet, onCancel, existingPet = null }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;
  const isEditing = !!existingPet;

  const [photoUri, setPhotoUri] = useState(existingPet?.photoUri || null);
  const [name, setName] = useState(existingPet?.name || '');
  const [species, setSpecies] = useState(existingPet?.species || 'dog');
  const [breed, setBreed] = useState(
    existingPet?.breed || (species === 'dog' ? 'Vira-lata (SRD - Cão)' : 'Vira-lata (SRD - Gato)')
  );
  const [gender, setGender] = useState(existingPet?.gender || 'female');
  const [birthDate, setBirthDate] = useState(existingPet?.birthDate || '2023-01-01');
  const [weight, setWeight] = useState(existingPet?.weight ? String(existingPet.weight) : '');
  const [isNeutered, setIsNeutered] = useState(existingPet?.isNeutered ?? false);
  const [lastHeatDate, setLastHeatDate] = useState(existingPet?.lastHeatDate || '2026-08-01');

  const [foodBrand, setFoodBrand] = useState(existingPet?.diet?.brandName || '');
  const [foodStartDate, setFoodStartDate] = useState(
    existingPet?.diet?.startDate || new Date().toISOString().split('T')[0]
  );
  const [mealIntervalHours, setMealIntervalHours] = useState(
    existingPet?.diet?.mealIntervalHours ? String(existingPet.diet.mealIntervalHours) : '8'
  );
  const [dailyGrams, setDailyGrams] = useState(
    existingPet?.diet?.dailyGrams ? String(existingPet.diet.dailyGrams) : '200'
  );

  const [avatarBadge] = useState(existingPet?.avatarBadge || 'Super Pet ⭐');
  const [avatarColor] = useState(existingPet?.avatarColor || '#0D9488');

  const availableBreeds = BREEDS_DATABASE.filter(b => b.type === species);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const msg = 'Permita acesso à galeria para escolher a foto!';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Permissão', msg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Preenche automaticamente um Pet de Exemplo para facilitar testes rápidos em sala de aula!
  const handleQuickFillDemo = (demoType) => {
    if (demoType === 'dog') {
      setName('Thor');
      setSpecies('dog');
      setBreed('Golden Retriever');
      setGender('male');
      setWeight('28.5');
      setIsNeutered(true);
      setFoodBrand('Premier Golden Special Adultos');
      // Coloca 38 dias atrás para já disparar o alerta de vegetais!
      const pastDate = new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFoodStartDate(pastDate);
      setMealIntervalHours('8');
      setDailyGrams('360');
    } else {
      setName('Luna');
      setSpecies('cat');
      setBreed('Siamês');
      setGender('female');
      setWeight('4.2');
      setIsNeutered(false);
      setLastHeatDate('2026-06-10');
      setFoodBrand('Royal Canin Feline Indoor');
      setFoodStartDate(new Date().toISOString().split('T')[0]);
      setMealIntervalHours('6');
      setDailyGrams('75');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      const msg = 'Por favor, informe o nome do pet!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Atenção', msg);
      return;
    }

    if (!foodBrand.trim()) {
      const msg = 'Por favor, informe qual a ração atual do pet!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Atenção', msg);
      return;
    }

    const initialVaccines = existingPet?.vaccines || (
      DEFAULT_VACCINES[species].map((v, i) => ({
        id: String(i + 1),
        name: v.name,
        dateApplied: new Date().toISOString().split('T')[0],
        nextDueDate: '2027-01-01',
        done: i === 0 // Primeira vacina já marcada como exemplo
      }))
    );

    const petData = {
      id: existingPet?.id || Date.now().toString(),
      name: name.trim(),
      species,
      breed,
      gender,
      birthDate,
      weight: parseFloat(weight) || 5,
      isNeutered,
      lastHeatDate: (!isNeutered && gender === 'female') ? lastHeatDate : null,
      heatCycleDays: 180,
      photoUri,
      avatarBadge,
      avatarColor,
      diet: {
        brandName: foodBrand.trim(),
        startDate: foodStartDate,
        mealIntervalHours: parseInt(mealIntervalHours, 10) || 8,
        dailyGrams: parseInt(dailyGrams, 10) || 200,
        lastMealTimestamp: existingPet?.diet?.lastMealTimestamp || new Date().toISOString()
      },
      vaccines: initialVaccines
    };

    onSavePet(petData);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* BARRA SUPERIOR DE NAVEGAÇÃO (SEMPRE VISÍVEL PARA VOLTAR SE HOUVER CANCELAMENTO) */}
      {onCancel && (
        <View style={styles.topNavigationRow}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
            <Text style={styles.backButtonText}>Voltar ao Painel Principal</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* HERO BANNER DE CADASTRO */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTextCol}>
          <View style={styles.heroBadge}>
            <Ionicons name="paw" size={14} color="#0D9488" />
            <Text style={styles.heroBadgeText}>GESTÃO INTELIGENTE DE PETS</Text>
          </View>
          <Text style={styles.headerTitle}>
            {isEditing ? `Editando Perfil de ${existingPet.name}` : 'Cadastrar Animal no NutriPet'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditing
              ? 'Altere os dados biológicos ou o plano nutricional abaixo.'
              : 'Registre seu cão ou gato para monitorar horários de alimentação, alertas de troca de ração, complemento de vegetais, vacinas e ciclo reprodutivo.'}
          </Text>

          {/* Atalhos Rápidos Didáticos para Sala de Aula */}
          {!isEditing && (
            <View style={styles.quickDemoRow}>
              <Text style={styles.quickDemoLabel}>⚡ Preenchimento Rápido para Teste:</Text>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleQuickFillDemo('dog')}
              >
                <Text style={styles.demoChipText}>🐶 Carregar Cão (Com Alerta de Ração)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleQuickFillDemo('cat')}
              >
                <Text style={styles.demoChipText}>🐱 Carregar Gata (Com Monitor de Cio)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.photoContainer} onPress={handlePickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoEmoji}>{species === 'cat' ? '🐱' : '🐶'}</Text>
              <View style={styles.photoUploadPill}>
                <Ionicons name="camera" size={12} color="#FFF" />
                <Text style={styles.photoText}>Foto</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* GRID EM 2 COLUNAS NA WEB */}
      <View style={[styles.gridRow, isWide && styles.gridRowWide]}>
        {/* Coluna 1: Identificação */}
        <View style={[styles.card, styles.gridCol]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>1</Text>
            </View>
            <Text style={styles.cardTitle}>Identificação e Perfil Biológico</Text>
          </View>

          <Text style={styles.label}>Nome do Animal *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Thor, Mel, Pipoca, Luna..."
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Espécie</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.choiceBtn, species === 'dog' && styles.choiceBtnActive]}
              onPress={() => {
                setSpecies('dog');
                setBreed('Vira-lata (SRD - Cão)');
              }}
            >
              <Text style={[styles.choiceBtnText, species === 'dog' && styles.choiceBtnTextActive]}>
                🐶 Canino (Cão)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceBtn, species === 'cat' && styles.choiceBtnActive]}
              onPress={() => {
                setSpecies('cat');
                setBreed('Vira-lata (SRD - Gato)');
              }}
            >
              <Text style={[styles.choiceBtnText, species === 'cat' && styles.choiceBtnTextActive]}>
                🐱 Felino (Gato)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Raça do Animal</Text>
          <View style={styles.tagsGrid}>
            {availableBreeds.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.breedTag, breed === b.name && styles.breedTagActive]}
                onPress={() => setBreed(b.name)}
              >
                <Text style={[styles.breedTagText, breed === b.name && styles.breedTagTextActive]}>
                  {b.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Sexo</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.choiceBtn, gender === 'female' && styles.choiceBtnActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.choiceBtnText, gender === 'female' && styles.choiceBtnTextActive]}>
                    ♀️ Fêmea
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.choiceBtn, gender === 'male' && styles.choiceBtnActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.choiceBtnText, gender === 'male' && styles.choiceBtnTextActive]}>
                    ♂️ Macho
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ width: 130 }}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 12.5"
                placeholderTextColor="#94A3B8"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>É Castrado(a)?</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.choiceBtn, isNeutered && styles.choiceBtnActive]}
              onPress={() => setIsNeutered(true)}
            >
              <Text style={[styles.choiceBtnText, isNeutered && styles.choiceBtnTextActive]}>
                ✂️ Sim, Castrado
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceBtn, !isNeutered && styles.choiceBtnActiveWarning]}
              onPress={() => setIsNeutered(false)}
            >
              <Text style={[styles.choiceBtnText, !isNeutered && styles.choiceBtnTextActive]}>
                🌱 Não Castrado
              </Text>
            </TouchableOpacity>
          </View>

          {!isNeutered && gender === 'female' && (
            <View style={styles.heatBox}>
              <Text style={styles.heatBoxTitle}>🌸 Monitor de Reprodução / Cio</Text>
              <Text style={styles.label}>Data aproximada do último cio (AAAA-MM-DD):</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 2026-07-20"
                value={lastHeatDate}
                onChangeText={setLastHeatDate}
              />
            </View>
          )}
        </View>

        {/* Coluna 2: Nutrição */}
        <View style={[styles.card, styles.gridCol]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>2</Text>
            </View>
            <Text style={styles.cardTitle}>Plano de Ração e Horários</Text>
          </View>

          <Text style={styles.label}>Marca / Nome da Ração Atual *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Premier, Golden Formula, Royal Canin..."
            placeholderTextColor="#94A3B8"
            value={foodBrand}
            onChangeText={setFoodBrand}
          />

          <Text style={styles.label}>Data em que começou esta ração (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2026-09-01"
            value={foodStartDate}
            onChangeText={setFoodStartDate}
          />
          <Text style={styles.helperText}>
            💡 Dica: Se colocar uma data de mais de 30 dias atrás, o sistema alertará sobre troca ou complemento com vegetais!
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Come a cada (horas):</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 8"
                value={mealIntervalHours}
                onChangeText={setMealIntervalHours}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gramas por dia:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 220"
                value={dailyGrams}
                onChangeText={setDailyGrams}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>✨ Recursos Ativados para {name || 'seu Pet'}:</Text>
            <Text style={styles.infoBoxItem}>• Cronômetro inteligente de refeições e notificações Push/Web.</Text>
            <Text style={styles.infoBoxItem}>• Monitoramento de fadiga nutricional por uso prolongado da mesma ração.</Text>
            <Text style={styles.infoBoxItem}>• Sugestão de vegetais seguros para a raça {breed}.</Text>
            <Text style={styles.infoBoxItem}>• Carteira de vacinas pré-configurada para {species === 'cat' ? 'Felinos' : 'Caninos'}.</Text>
          </View>
        </View>
      </View>

      {/* RODAPÉ DE AÇÕES */}
      <View style={styles.buttonsContainer}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Ionicons name="close-circle-outline" size={18} color="#475569" />
            <Text style={styles.cancelBtnText}>Cancelar e Voltar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>
            {isEditing ? 'Salvar Alterações' : 'Concluir Cadastro do Pet'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  container: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 1180,
    alignSelf: 'center',
    width: '100%',
  },
  topNavigationRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  heroTextCol: {
    flex: 1,
    minWidth: 260,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 20,
  },
  quickDemoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickDemoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  demoChip: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  photoContainer: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 40,
  },
  photoUploadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D9488',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  photoText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gridRow: {
    flexDirection: 'column',
    gap: 20,
  },
  gridRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gridCol: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#0D9488',
    marginTop: 6,
    lineHeight: 17,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  choiceBtnActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  choiceBtnActiveWarning: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  choiceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  choiceBtnTextActive: {
    color: '#FFFFFF',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  breedTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  breedTagActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  breedTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  breedTagTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  heatBox: {
    backgroundColor: '#FFF1F2',
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  heatBoxTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#BE123C',
  },
  infoBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E',
    marginBottom: 8,
  },
  infoBoxItem: {
    fontSize: 12,
    color: '#115E59',
    marginBottom: 4,
    lineHeight: 18,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  cancelBtnText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
});
