import { BREEDS_DATABASE } from '../data/database';

export const NutritionEngine = {
  // Calcula quantos dias o pet está consumindo a mesma ração
  getDaysOnCurrentFood: (startDateString) => {
    if (!startDateString) return 0;
    const start = new Date(startDateString);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  // Próxima refeição com base no intervalo e última refeição
  getNextMealTime: (lastMealIso, intervalHours) => {
    if (!lastMealIso) return new Date();
    const last = new Date(lastMealIso);
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
  calculateNextHeatCycle: (lastHeatDateString, cycleDays = 180) => {
    if (!lastHeatDateString) return null;
    const last = new Date(lastHeatDateString);
    const next = new Date(last.getTime() + cycleDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffDays = Math.ceil((next - now) / (1000 * 60 * 60 * 24));

    return {
      nextDate: next.toISOString().split('T')[0],
      daysRemaining: diffDays,
      isClose: diffDays <= 15 && diffDays >= 0,
      isOverdue: diffDays < 0
    };
  }
};
