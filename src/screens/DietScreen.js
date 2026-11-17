import React, { useState, useEffect } from 'react';
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
import { FOOD_SAFETY_GUIDE } from '../data/database';
import { validateDiet, showMessage } from '../services/validation';

export default function DietScreen({ pet, diet, onUpdateDiet, onShowToast }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;

  const [brandName, setBrandName] = useState(diet.brandName);
  const [startDate, setStartDate] = useState(diet.startDate);
  const [mealInterval, setMealInterval] = useState(String(diet.mealIntervalHours));
  const [dailyGrams, setDailyGrams] = useState(String(diet.dailyGrams || 200));
  const [countdownSec, setCountdownSec] = useState(null);

  useEffect(() => {
    setBrandName(diet.brandName);
    setStartDate(diet.startDate);
    setMealInterval(String(diet.mealIntervalHours));
    setDailyGrams(String(diet.dailyGrams || 200));
  }, [pet.id, diet]);

  // Contador regressivo para simulação de notificação ao vivo na aula
  useEffect(() => {
    if (countdownSec === null) return;
    if (countdownSec <= 0) {
      setCountdownSec(null);
      return;
    }
    const timer = setTimeout(() => setCountdownSec(countdownSec - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdownSec]);

  const daysOnFood = NutritionEngine.getDaysOnCurrentFood(startDate);
  const analysis = NutritionEngine.analyzeDiet(pet.breed, daysOnFood);
  const nextMeal = NutritionEngine.getNextMealTime(diet.lastMealTimestamp, diet.mealIntervalHours);
  const lastMealDate = diet.lastMealTimestamp ? new Date(diet.lastMealTimestamp) : new Date();
  const gramsPerMeal = Math.round((diet.dailyGrams || 200) / (24 / (diet.mealIntervalHours || 8)));

  const handleRegisterMeal = () => {
    onUpdateDiet({
      ...diet,
      lastMealTimestamp: new Date().toISOString()
    });
    if (onShowToast) {
      onShowToast({
        title: `🥣 Refeição de ${pet.name} Registrada!`,
        body: `Servido ${gramsPerMeal}g de ${diet.brandName}. Próximo horário recalculado.`,
        type: 'success'
      });
    }
  };

  const handleSaveDietConfig = () => {
    const check = validateDiet({ brandName, startDate, mealInterval, dailyGrams });
    if (!check.ok) {
      showMessage(Platform, Alert, 'Atenção', check.message);
      return;
    }
    onUpdateDiet({
      ...diet,
      ...check.values
    });
    if (onShowToast) {
      onShowToast({
        title: '💾 Plano Alimentar Atualizado',
        body: `As configurações de ração de ${pet.name} foram salvas.`,
        type: 'info'
      });
    }
  };

  // Simulador de Notificação em 5 segundos (para demonstrar na aula!)
  const handleTestMealNotification = async () => {
    setCountdownSec(5);
    await NotificationService.scheduleReminder({
      title: `⏰ Hora de alimentar ${pet.name}!`,
      body: `Prepare ${gramsPerMeal}g da ração ${diet.brandName}. Que tal incluir ${analysis.suggestions[0]} hoje?`,
      seconds: 5,
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

  // Simulador rápido de 45 dias de ração para demonstrar a mudança de cor do alerta
  const handleSimulateLongFoodUsage = () => {
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(fortyFiveDaysAgo);
    onUpdateDiet({
      ...diet,
      startDate: fortyFiveDaysAgo
    });
    if (onShowToast) {
      onShowToast({
        title: '⚠️ Simulação de 45 Dias Ativada!',
        body: `Veja o painel de alerta recomendar vegetais para complementar a dieta de ${pet.name}.`,
        type: 'warning'
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* BANNER INTELIGENTE DE STATUS NUTRICIONAL */}
      <View style={[
        styles.alertCard,
        analysis.status === 'urgent' ? styles.alertUrgent :
        analysis.status === 'warning' ? styles.alertWarning : styles.alertGood
      ]}>
        <View style={styles.alertHeaderRow}>
          <View style={styles.alertTitleRow}>
            <Ionicons
              name={
                analysis.status === 'urgent' ? 'warning' :
                analysis.status === 'warning' ? 'alert-circle' : 'checkmark-circle'
              }
              size={22}
              color={
                analysis.status === 'urgent' ? '#DC2626' :
                analysis.status === 'warning' ? '#D97706' : '#059669'
              }
            />
            <Text style={styles.alertTitle}>
              {analysis.status === 'urgent' ? 'Hora de Variar ou Complementar a Dieta!' :
               analysis.status === 'warning' ? 'Ciclo da Ração Próximo do Limite' : 'Ciclo Nutricional Equilibrado'}
            </Text>
          </View>

          <View style={styles.daysBadge}>
            <Text style={styles.daysBadgeText}>Uso contínuo: {daysOnFood} de {analysis.maxDays} dias</Text>
          </View>
        </View>

        <Text style={styles.alertText}>{analysis.message}</Text>

        <View style={styles.suggestionsBox}>
          <Text style={styles.subSubtitle}>
            🥗 Vegetais e Alimentos Naturais Recomendados para {pet.breed}:
          </Text>
          <View style={styles.tagsContainer}>
            {analysis.suggestions.map((sug, i) => (
              <View key={i} style={styles.sugTag}>
                <Text style={styles.sugTagText}>🥦 {sug}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* GRID PRINCIPAL EM 2 COLUNAS */}
      <View style={[styles.gridRow, isWide && styles.gridRowWide]}>
        {/* Coluna 1: Relógio de Refeições + Central de Notificações */}
        <View style={[styles.card, styles.gridCol]}>
          <View>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={20} color="#0D9488" />
              <Text style={styles.cardTitle}>Cronograma de Refeições & Alertas</Text>
            </View>

            <View style={styles.mealHighlightBox}>
              <Text style={styles.mealLabel}>PRÓXIMA REFEIÇÃO PROGRAMADA</Text>
              <Text style={styles.mealTimeBig}>
                {nextMeal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.mealSubInfo}>
                Última refeição: {lastMealDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Intervalo: a cada {diet.mealIntervalHours}h
              </Text>
            </View>

            <View style={styles.portionStatsRow}>
              <View style={styles.portionStatBox}>
                <Text style={styles.portionStatValue}>{diet.dailyGrams || 200}g</Text>
                <Text style={styles.portionStatLabel}>Total Diário</Text>
              </View>
              <View style={styles.portionStatBox}>
                <Text style={styles.portionStatValue}>{gramsPerMeal}g</Text>
                <Text style={styles.portionStatLabel}>Por Refeição</Text>
              </View>
              <View style={styles.portionStatBox}>
                <Text style={styles.portionStatValue}>
                  {Math.round(24 / (diet.mealIntervalHours || 8))}x
                </Text>
                <Text style={styles.portionStatLabel}>Ao Dia</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtonsGroup}>
            <TouchableOpacity style={styles.feedBtn} onPress={handleRegisterMeal}>
              <Ionicons name="restaurant" size={18} color="#FFFFFF" />
              <Text style={styles.feedBtnText}>Acabei de Alimentar {pet.name}</Text>
            </TouchableOpacity>

            {/* Botão de Teste de Notificação Real */}
            <TouchableOpacity
              style={[styles.notifyTestBtn, countdownSec !== null && styles.notifyTestBtnActive]}
              onPress={handleTestMealNotification}
              disabled={countdownSec !== null}
            >
              <Ionicons name="notifications-outline" size={18} color="#0F766E" />
              <Text style={styles.notifyTestBtnText}>
                {countdownSec !== null
                  ? `Disparando notificação em ${countdownSec}s...`
                  : '🔔 Testar Notificação de Refeição (5s)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coluna 2: Configuração da Ração */}
        <View style={[styles.card, styles.gridCol]}>
          <View>
            <View style={styles.cardHeader}>
              <Ionicons name="nutrition-outline" size={20} color="#0D9488" />
              <Text style={styles.cardTitle}>Ração em Uso & Simulador</Text>
            </View>

            <Text style={styles.label}>Marca / Linha da Ração:</Text>
            <TextInput
              style={styles.input}
              value={brandName}
              onChangeText={setBrandName}
              placeholder="Ex: Premier, Golden, Royal Canin..."
            />

            <View style={styles.labelWithActionRow}>
              <Text style={styles.label}>Data de Abertura do Pacote:</Text>
              <TouchableOpacity onPress={handleSimulateLongFoodUsage}>
                <Text style={styles.simulateLink}>⚡ Simular 45 dias de uso</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="AAAA-MM-DD"
            />

            <View style={styles.inlineInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Intervalo (horas):</Text>
                <TextInput
                  style={styles.input}
                  value={mealInterval}
                  onChangeText={setMealInterval}
                  keyboardType="numeric"
                  placeholder="8"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Meta Diária (g):</Text>
                <TextInput
                  style={styles.input}
                  value={dailyGrams}
                  onChangeText={setDailyGrams}
                  keyboardType="numeric"
                  placeholder="200"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDietConfig}>
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Atualizar Ração e Horários</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GUIA DE SEGURANÇA ALIMENTAR */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book-outline" size={20} color="#0D9488" />
          <Text style={styles.cardTitle}>Guia Veterinário: Alimentos Permitidos vs Proibidos</Text>
        </View>

        <View style={[styles.gridRow, isWide && styles.gridRowWide, { marginBottom: 0 }]}>
          <View style={[styles.safetyCol, styles.safeBox]}>
            <Text style={styles.sectionHeaderGreen}>✅ Vegetais & Frutas Seguros (Complementos)</Text>
            {FOOD_SAFETY_GUIDE.safe.map((f, i) => (
              <View key={i} style={styles.foodRow}>
                <Text style={styles.foodNameGreen}>• {f.name}</Text>
                <Text style={styles.foodDesc}>{f.benefit} ({f.prep})</Text>
              </View>
            ))}
          </View>

          <View style={[styles.safetyCol, styles.toxicBox]}>
            <Text style={styles.sectionHeaderRed}>🚫 Alimentos Tóxicos (Proibidos!)</Text>
            {FOOD_SAFETY_GUIDE.toxic.map((f, i) => (
              <View key={i} style={styles.foodRow}>
                <Text style={styles.foodNameRed}>• {f.name}</Text>
                <Text style={styles.foodDesc}>{f.danger}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  alertCard: {
    padding: 22,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  alertGood: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  alertWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  alertUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  daysBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  daysBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  alertText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },
  suggestionsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  subSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sugTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sugTagText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '700',
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  mealHighlightBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 14,
  },
  mealLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.8,
  },
  mealTimeBig: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0F766E',
    marginVertical: 4,
  },
  mealSubInfo: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  portionStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  portionStatBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  portionStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  portionStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  actionButtonsGroup: {
    gap: 10,
  },
  feedBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
  },
  feedBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  notifyTestBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 12,
    paddingVertical: 12,
  },
  notifyTestBtnActive: {
    backgroundColor: '#CCFBF1',
  },
  notifyTestBtnText: {
    color: '#0F766E',
    fontWeight: '800',
    fontSize: 13,
  },
  labelWithActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  simulateLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 6,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  safetyCol: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  safeBox: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  toxicBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  sectionHeaderGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F766E',
    marginBottom: 10,
  },
  sectionHeaderRed: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 10,
  },
  foodRow: {
    marginBottom: 8,
  },
  foodNameGreen: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#115E59',
  },
  foodNameRed: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#991B1B',
  },
  foodDesc: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 10,
    lineHeight: 17,
  },
});
