// Validações simples e puras dos campos digitados pelo usuário.

// Aceita somente AAAA-MM-DD e uma data de calendário real (rejeita 2026-02-31).
export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

// Aceita vírgula ou ponto como separador decimal ("12,5" e "12.5").
export function parseDecimal(value) {
  if (value === null || value === undefined) return NaN;
  const normalized = String(value).trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return NaN;
  return parseFloat(normalized);
}

export function parseIntegerStrict(value) {
  const normalized = String(value ?? '').trim();
  if (!/^\d+$/.test(normalized)) return NaN;
  return parseInt(normalized, 10);
}

export const LIMITS = {
  weightKg: { min: 0.1, max: 120 },
  mealIntervalHours: { min: 1, max: 24 },
  dailyGrams: { min: 10, max: 5000 },
};

// Valida a parte da dieta (marca, data de início, intervalo, gramas).
// Retorna { ok: true, values } ou { ok: false, message }.
export function validateDiet({ brandName, startDate, mealInterval, dailyGrams }) {
  if (!String(brandName ?? '').trim()) {
    return { ok: false, message: 'Por favor, informe qual a ração atual do pet!' };
  }
  if (!isValidDateString(startDate)) {
    return { ok: false, message: 'Data de início da ração inválida. Use o formato AAAA-MM-DD (ex: 2026-09-01).' };
  }
  const interval = parseIntegerStrict(mealInterval);
  if (!(interval >= LIMITS.mealIntervalHours.min && interval <= LIMITS.mealIntervalHours.max)) {
    return { ok: false, message: `O intervalo entre refeições deve ficar entre ${LIMITS.mealIntervalHours.min} e ${LIMITS.mealIntervalHours.max} horas.` };
  }
  const grams = parseIntegerStrict(dailyGrams);
  if (!(grams >= LIMITS.dailyGrams.min && grams <= LIMITS.dailyGrams.max)) {
    return { ok: false, message: `A quantidade diária deve ficar entre ${LIMITS.dailyGrams.min} e ${LIMITS.dailyGrams.max} gramas.` };
  }
  return {
    ok: true,
    values: { brandName: String(brandName).trim(), startDate, mealIntervalHours: interval, dailyGrams: grams },
  };
}

// Exibe mensagem de erro em qualquer plataforma.
export function showMessage(Platform, Alert, title, message) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    alert(message);
  } else {
    Alert.alert(title, message);
  }
}
