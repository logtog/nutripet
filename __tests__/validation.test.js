import {
  isValidDateString,
  parseDecimal,
  parseIntegerStrict,
  validateDiet,
} from '../src/services/validation';

describe('isValidDateString', () => {
  test.each(['2026-09-01', '2024-02-29', '2000-12-31'])('aceita %s', (d) => {
    expect(isValidDateString(d)).toBe(true);
  });
  test.each(['', 'abc', '2026-13-01', '2026-02-31', '2025-02-29', '01/09/2026', '2026-9-1', null, undefined, 20260901])(
    'rejeita %p',
    (d) => {
      expect(isValidDateString(d)).toBe(false);
    }
  );
});

describe('parseDecimal', () => {
  test('aceita vírgula e ponto', () => {
    expect(parseDecimal('12,5')).toBe(12.5);
    expect(parseDecimal('12.5')).toBe(12.5);
    expect(parseDecimal(' 4 ')).toBe(4);
  });
  test.each(['', 'abc', '-3', '1,2,3', '12kg', null, undefined])('rejeita %p', (v) => {
    expect(parseDecimal(v)).toBeNaN();
  });
});

describe('parseIntegerStrict', () => {
  test('aceita inteiros', () => expect(parseIntegerStrict('8')).toBe(8));
  test.each(['8.5', '-1', '', 'x', '8h'])('rejeita %p', (v) => expect(parseIntegerStrict(v)).toBeNaN());
});

describe('validateDiet', () => {
  const ok = { brandName: ' Premier ', startDate: '2026-09-01', mealInterval: '8', dailyGrams: '200' };
  test('valores válidos', () => {
    expect(validateDiet(ok)).toEqual({
      ok: true,
      values: { brandName: 'Premier', startDate: '2026-09-01', mealIntervalHours: 8, dailyGrams: 200 },
    });
  });
  test('marca vazia', () => expect(validateDiet({ ...ok, brandName: '  ' }).ok).toBe(false));
  test('data inválida', () => expect(validateDiet({ ...ok, startDate: 'ontem' }).ok).toBe(false));
  test.each(['0', '25', '-5', 'abc', ''])('intervalo inválido %p', (v) =>
    expect(validateDiet({ ...ok, mealInterval: v }).ok).toBe(false));
  test.each(['0', '9', '5001', '-10', 'abc'])('gramas inválidas %p', (v) =>
    expect(validateDiet({ ...ok, dailyGrams: v }).ok).toBe(false));
});
