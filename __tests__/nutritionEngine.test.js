import { NutritionEngine } from '../src/services/nutritionEngine';

const NOW = new Date('2026-11-17T12:00:00Z');

describe('getDaysOnCurrentFood', () => {
  test('conta dias passados', () => {
    expect(NutritionEngine.getDaysOnCurrentFood('2026-10-10', NOW)).toBe(38);
  });
  test('data futura conta 0 (antes contava como dias positivos)', () => {
    expect(NutritionEngine.getDaysOnCurrentFood('2026-12-25', NOW)).toBe(0);
  });
  test.each([undefined, null, '', 'texto', '2026-99-99'])('data inválida %p vira 0', (d) => {
    expect(NutritionEngine.getDaysOnCurrentFood(d, NOW)).toBe(0);
  });
});

describe('analyzeDiet', () => {
  test('Golden Retriever: limite de 30 dias', () => {
    expect(NutritionEngine.analyzeDiet('Golden Retriever', 10).status).toBe('good');
    expect(NutritionEngine.analyzeDiet('Golden Retriever', 25).status).toBe('warning');
    expect(NutritionEngine.analyzeDiet('Golden Retriever', 31).status).toBe('urgent');
  });
  test('raça desconhecida usa o padrão e sempre traz sugestões', () => {
    const r = NutritionEngine.analyzeDiet('Raça Inexistente', 5);
    expect(r.suggestions.length).toBeGreaterThan(0);
    expect(r.maxDays).toBeGreaterThan(0);
  });
});

describe('getNextMealTime', () => {
  test('soma o intervalo', () => {
    const next = NutritionEngine.getNextMealTime('2026-11-17T08:00:00Z', 6);
    expect(next.toISOString()).toBe('2026-11-17T14:00:00.000Z');
  });
  test('data inválida não quebra', () => {
    expect(Number.isNaN(NutritionEngine.getNextMealTime('lixo', 6).getTime())).toBe(false);
  });
});

describe('calculateNextHeatCycle', () => {
  test('calcula a próxima data', () => {
    const r = NutritionEngine.calculateNextHeatCycle('2026-06-10', 180, NOW);
    expect(r.nextDate).toBe('2026-12-07');
    expect(r.daysRemaining).toBe(20);
    expect(r.isClose).toBe(false);
  });
  test('próximo de 15 dias', () => {
    expect(NutritionEngine.calculateNextHeatCycle('2026-05-25', 180, NOW).isClose).toBe(true);
  });
  test('atrasado', () => {
    expect(NutritionEngine.calculateNextHeatCycle('2025-01-01', 180, NOW).isOverdue).toBe(true);
  });
  test.each([undefined, null, '', 'lixo', '2026-13-45'])('data inválida %p retorna null em vez de lançar erro', (d) => {
    expect(() => NutritionEngine.calculateNextHeatCycle(d, 180, NOW)).not.toThrow();
    expect(NutritionEngine.calculateNextHeatCycle(d, 180, NOW)).toBeNull();
  });
});
