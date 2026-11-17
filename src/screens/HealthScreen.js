import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NutritionEngine } from '../services/nutritionEngine';
import { NotificationService } from '../services/notificationService';
import { isValidDateString, showMessage } from '../services/validation';

export default function HealthScreen({ pet, vaccines, onUpdateVaccines, onShowToast }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;

  const [newVacName, setNewVacName] = useState('');
  const [newVacDate, setNewVacDate] = useState('');

  const heatInfo = (!pet.isNeutered && pet.gender === 'female')
    ? NutritionEngine.calculateNextHeatCycle(pet.lastHeatDate, pet.heatCycleDays)
    : null;

  const handleToggleVaccine = (id) => {
    const updated = vaccines.map(v => {
      if (v.id === id) {
        return {
          ...v,
          done: !v.done,
          dateApplied: !v.done ? new Date().toISOString().split('T')[0] : null
        };
      }
      return v;
    });
    onUpdateVaccines(updated);
  };

  const handleDeleteVaccine = (id) => {
    const updated = vaccines.filter(v => v.id !== id);
    onUpdateVaccines(updated);
  };

  const handleAddVaccine = () => {
    if (!newVacName.trim()) {
      showMessage(Platform, Alert, 'Atenção', 'Informe o nome da vacina!');
      return;
    }
    const dueDate = newVacDate.trim();
    if (dueDate && !isValidDateString(dueDate)) {
      showMessage(Platform, Alert, 'Atenção', 'Data do reforço inválida. Use o formato AAAA-MM-DD (ex: 2027-05-15).');
      return;
    }

    const newVac = {
      id: Date.now().toString(),
      name: newVacName.trim(),
      dateApplied: new Date().toISOString().split('T')[0],
      nextDueDate: dueDate || '2027-01-01',
      done: true
    };

    onUpdateVaccines([...vaccines, newVac]);
    setNewVacName('');
    setNewVacDate('');

    if (onShowToast) {
      onShowToast({
        title: '💉 Vacina Adicionada!',
        body: `${newVac.name} foi registrada na carteira de ${pet.name}.`,
        type: 'success'
      });
    }
  };

  const handleTestVaccineAlert = async () => {
    const pendingVac = vaccines.find(v => !v.done) || vaccines[0];
    const vacName = pendingVac ? pendingVac.name : 'Reforço Anual V10';

    await NotificationService.scheduleReminder({
      title: `💉 Alerta de Vacina: ${pet.name}`,
      body: `A dose da vacina "${vacName}" está próxima do vencimento! Agende com o veterinário.`,
      seconds: 3,
      onTriggerInApp: (notif) => {
        if (onShowToast) {
          onShowToast({
            title: notif.title,
            body: notif.body,
            type: 'bell'
          });
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.gridRow, isWide && styles.gridRowWide]}>
        {/* Card 1: Ciclo Reprodutivo / Status */}
        <View style={[styles.card, styles.gridCol, !pet.isNeutered && pet.gender === 'female' ? styles.heatCard : styles.neuteredCard]}>
          <View>
            <View style={styles.cardHeader}>
              <Ionicons
                name={!pet.isNeutered && pet.gender === 'female' ? 'flower-outline' : 'shield-checkmark-outline'}
                size={20}
                color={!pet.isNeutered && pet.gender === 'female' ? '#BE123C' : '#0D9488'}
              />
              <Text style={styles.cardTitle}>
                {!pet.isNeutered && pet.gender === 'female' ? 'Monitor de Ciclo Reprodutivo (Cio)' : 'Status Reprodutivo'}
              </Text>
            </View>

            {!pet.isNeutered && pet.gender === 'female' && heatInfo ? (
              <View>
                <View style={styles.heatBadgeRow}>
                  <View style={styles.pinkBadge}>
                    <Text style={styles.pinkBadgeText}>Fêmea Não Castrada</Text>
                  </View>
                  <Text style={styles.cycleSmall}>Ciclo médio: {pet.heatCycleDays || 180} dias</Text>
                </View>

                <View style={styles.heatHighlightBox}>
                  <Text style={styles.heatLabel}>PREVISÃO DO PRÓXIMO CIO</Text>
                  <Text style={styles.heatBigDate}>{heatInfo.nextDate}</Text>
                  <Text style={styles.heatRemaining}>
                    {heatInfo.daysRemaining > 0
                      ? `Faltam aproximadamente ${heatInfo.daysRemaining} dias`
                      : 'Ciclo previsto para este período! Redobre os cuidados.'}
                  </Text>
                </View>

                <Text style={styles.heatTip}>
                  💡 Dica Veterinária: Durante o cio, evite passeios sem guia e mantenha hidratação reforçada.
                </Text>
              </View>
            ) : !pet.isNeutered && pet.gender === 'female' ? (
              <View style={styles.neuteredBox}>
                <Text style={styles.neuteredTitle}>Data do último cio não informada</Text>
                <Text style={styles.neuteredDesc}>
                  Edite o perfil de {pet.name} e informe a data aproximada do último cio para ver a previsão do próximo.
                </Text>
              </View>
            ) : (
              <View style={styles.neuteredBox}>
                <View style={styles.neuteredIconCircle}>
                  <Ionicons
                    name={pet.isNeutered ? 'checkmark-done' : 'male'}
                    size={28}
                    color="#0D9488"
                  />
                </View>
                <Text style={styles.neuteredTitle}>
                  {pet.isNeutered
                    ? `${pet.name} é castrado(a)`
                    : `${pet.name} é macho não castrado`}
                </Text>
                <Text style={styles.neuteredDesc}>
                  {pet.isNeutered
                    ? 'Animais castrados não possuem ciclo de cio e têm menor risco de doenças reprodutivas. Lembre-se de controlar as calorias da ração para evitar sobrepeso!'
                    : 'Machos não possuem ciclo periódico de cio como as fêmeas, mas podem ficar agitados se houver fêmeas no cio por perto.'}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.testAlertBtn} onPress={handleTestVaccineAlert}>
            <Ionicons name="notifications-outline" size={16} color="#0F766E" />
            <Text style={styles.testAlertBtnText}>🔔 Testar Alerta de Vacina (3s)</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Adicionar Nova Vacina */}
        <View style={[styles.card, styles.gridCol]}>
          <View>
            <View style={styles.cardHeader}>
              <Ionicons name="medkit-outline" size={20} color="#0D9488" />
              <Text style={styles.cardTitle}>Registrar Vacina ou Vermífugo</Text>
            </View>
            <Text style={styles.subText}>
              Adicione doses anuais, reforços ou antipulgas à carteira digital de {pet.name}.
            </Text>

            <Text style={styles.label}>Nome da Vacina / Medicamento:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: V10, Antirrábica, Bravecto, Vermífugo..."
              placeholderTextColor="#94A3B8"
              value={newVacName}
              onChangeText={setNewVacName}
            />

            <Text style={styles.label}>Data do Próximo Reforço (AAAA-MM-DD):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2027-05-15"
              placeholderTextColor="#94A3B8"
              value={newVacDate}
              onChangeText={setNewVacDate}
            />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleAddVaccine}>
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Inserir na Carteira de Vacinação</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Carteira de Vacinação Completa */}
      <View style={styles.card}>
        <View style={styles.vacHeaderRow}>
          <View style={styles.cardHeaderNoMargin}>
            <Ionicons name="shield-outline" size={20} color="#0D9488" />
            <Text style={styles.cardTitle}>Carteira de Vacinação Digital de {pet.name}</Text>
          </View>

          <View style={styles.vacCounterBadge}>
            <Text style={styles.vacCounter}>
              {vaccines.filter(v => v.done).length} de {vaccines.length} aplicadas
            </Text>
          </View>
        </View>

        {vaccines.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma vacina registrada ainda.</Text>
        ) : (
          vaccines.map(v => (
            <View key={v.id} style={styles.vacItem}>
              <TouchableOpacity
                style={[styles.checkbox, v.done && styles.checkboxChecked]}
                onPress={() => handleToggleVaccine(v.id)}
              >
                {v.done && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </TouchableOpacity>

              <View style={styles.vacContent}>
                <Text style={[styles.vacName, v.done && styles.vacDone]}>{v.name}</Text>
                <Text style={styles.vacSub}>
                  {v.done
                    ? `Aplicada em: ${v.dateApplied || 'Registrada'} • Próximo reforço: ${v.nextDueDate}`
                    : `Dose pendente! Programada para: ${v.nextDueDate}`}
                </Text>
              </View>

              <View style={[styles.statusBadge, v.done ? styles.badgeDone : styles.badgePending]}>
                <Text style={[styles.statusBadgeText, v.done ? styles.textDone : styles.textPending]}>
                  {v.done ? 'Aplicada' : 'Pendente'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeVacBtn}
                onPress={() => handleDeleteVaccine(v.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  gridRow: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 20,
  },
  gridRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gridCol: {
    flex: 1,
    marginBottom: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardHeaderNoMargin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  subText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 19,
  },
  heatCard: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  neuteredCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
  },
  heatBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pinkBadge: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pinkBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#BE123C',
  },
  cycleSmall: {
    fontSize: 12,
    color: '#881337',
  },
  heatHighlightBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    marginVertical: 6,
  },
  heatLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BE123C',
    letterSpacing: 0.8,
  },
  heatBigDate: {
    fontSize: 28,
    fontWeight: '900',
    color: '#9F1239',
    marginVertical: 4,
  },
  heatRemaining: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E11D48',
  },
  heatTip: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 10,
  },
  neuteredBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  neuteredIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  neuteredTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  neuteredDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
  },
  testAlertBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 14,
  },
  testAlertBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 6,
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
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  vacHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  vacCounterBadge: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  vacCounter: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  vacItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  vacContent: {
    flex: 1,
  },
  vacName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  vacDone: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  vacSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  badgeDone: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textDone: {
    color: '#166534',
  },
  textPending: {
    color: '#991B1B',
  },
  removeVacBtn: {
    padding: 6,
  },
});
