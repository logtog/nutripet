import { BREEDS_DATABASE } from '../data/database';

const DAY_MS = 1000 * 60 * 60 * 24;

export const NutritionEngine = {
  // Calcula quantos dias o pet está consumindo a mesma ração.
  // Data ausente, inválida ou no futuro conta como 0 dias.
  getDaysOnCurrentFood: (startDateString, now = new Date()) => {
    if (!startDateString) return 0;
    const start = new Date(startDateString);
    if (Number.isNaN(start.getTime())) return 0;
    const diff = now - start;
    return diff > 0 ? Math.floor(diff / DAY_MS) : 0;
  },

  // Próxima refeição com base no intervalo e última refeição
  getNextMealTime: (lastMealIso, intervalHours) => {
    if (!lastMealIso) return new Date();
    const last = new Date(lastMealIso);
    if (Number.isNaN(last.getTime())) return new Date();
    const next = new Date(last.getTime() + (intervalHours || 8) * 60 * 60 * 1000);
    return next;
  },

  // Análise nutricional: indica se precisa variar ou adicionar vegetais
  analyzeDiet: (breedName, daysOnCurrentFood) => {
    const breedInfo = BREEDS_DATABASE.find(b => b.name === breedName) || BREEDS_DATABASE[0];
    const maxDays = breedInfo.maxDaysSameFood || 30;

    let status = 'good'; // 'good', 'warning', 'urgent'
    let message = '';
    let suggestions = breedInfo.recommendedComplements;

    if (daysOnCurrentFood > maxDays) {
      status = 'urgent';
      message = `Atenção: O pet já está há ${daysOnCurrentFood} dias com a mesma ração! Recomendamos introduzir vegetais seguros para complementar vitaminas e evitar tédio alimentar.`;
    } else if (daysOnCurrentFood >= (maxDays - 7)) {
      status = 'warning';
      message = `Seu pet está há ${daysOnCurrentFood} dias nesta ração. Em breve será benéfico complementar a dieta com legumes cozidos ou frutas seguras.`;
    } else {
      status = 'good';
      message = `Tudo ótimo! A ração atual está sendo consumida há ${daysOnCurrentFood} dias (dentro do período ideal de ${maxDays} dias).`;
    }

    return {
      status,
      message,
      daysOnCurrentFood,
      maxDays,
      suggestions
    };
  },

  // Previsão do próximo ciclo de cio para não castrados
  // Retorna null se a data for ausente ou inválida (antes, uma data inválida derrubava o app).
  calculateNextHeatCycle: (lastHeatDateString, cycleDays = 180, now = new Date()) => {
    if (!lastHeatDateString) return null;
    const last = new Date(lastHeatDateString);
    if (Number.isNaN(last.getTime())) return null;
    const next = new Date(last.getTime() + cycleDays * DAY_MS);
    const diffDays = Math.ceil((next - now) / DAY_MS);

    return {
      nextDate: next.toISOString().split('T')[0],
      daysRemaining: diffDays,
      isClose: diffDays <= 15 && diffDays >= 0,
      isOverdue: diffDays < 0
    };
  }
};
