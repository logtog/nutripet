import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutripet_app_v2';
const EMPTY_STATE = () => ({ pets: [], activePetId: null });

// Fila de operações: cada "ler → alterar → gravar" espera a anterior terminar.
// Sem isso, dois toques rápidos podiam ler o mesmo estado e um sobrescrever o outro.
let queue = Promise.resolve();
const enqueue = (task) => {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
};

const readState = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return EMPTY_STATE();
    const data = JSON.parse(json);
    // Protege contra dados corrompidos ou de formato antigo.
    return {
      ...data,
      pets: Array.isArray(data?.pets) ? data.pets : [],
      activePetId: data?.activePetId ?? null,
    };
  } catch (e) {
    console.error('Erro ao ler storage:', e);
    return EMPTY_STATE();
  }
};

const writeState = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Erro ao salvar no storage:', e);
    return false;
  }
};

export const StorageService = {
  // Salva o estado completo (pets, activePetId)
  saveAppState: (data) => enqueue(() => writeState(data)),

  // Carrega o estado completo do storage (inicia vazio se não houver cadastro)
  loadAppState: () => enqueue(readState),

  // Adiciona um novo pet
  addPet: (newPet) =>
    enqueue(async () => {
      const state = await readState();
      const newState = { pets: [...state.pets, newPet], activePetId: newPet.id };
      await writeState(newState);
      return newState;
    }),

  // Atualiza um pet existente
  updatePet: (updatedPet) =>
    enqueue(async () => {
      const state = await readState();
      const newState = {
        ...state,
        pets: state.pets.map((p) => (p.id === updatedPet.id ? updatedPet : p)),
      };
      await writeState(newState);
      return newState;
    }),

  // Exclui um pet
  deletePet: (petId) =>
    enqueue(async () => {
      const state = await readState();
      const pets = state.pets.filter((p) => p.id !== petId);
      const newState = { pets, activePetId: pets.length > 0 ? pets[0].id : null };
      await writeState(newState);
      return newState;
    }),

  // Limpa tudo (útil para testes de cadastro do zero)
  clearAll: () =>
    enqueue(async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return EMPTY_STATE();
    }),
};
