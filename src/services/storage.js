import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutripet_app_v2';

export const StorageService = {
  // Salva o estado completo (pets, activePetId)
  saveAppState: async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Erro ao salvar no storage:', e);
      return false;
    }
  },

  // Carrega o estado completo do storage (inicia vazio se não houver cadastro)
  loadAppState: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        return JSON.parse(json);
      }
      return {
        pets: [],
        activePetId: null
      };
    } catch (e) {
      console.error('Erro ao ler storage:', e);
      return { pets: [], activePetId: null };
    }
  },

  // Adiciona um novo pet
  addPet: async (newPet) => {
    const state = await StorageService.loadAppState();
    const pets = [...state.pets, newPet];
    const newState = {
      pets,
      activePetId: newPet.id
    };
    await StorageService.saveAppState(newState);
    return newState;
  },

  // Atualiza um pet existente
  updatePet: async (updatedPet) => {
    const state = await StorageService.loadAppState();
    const pets = state.pets.map(p => p.id === updatedPet.id ? updatedPet : p);
    const newState = {
      ...state,
      pets
    };
    await StorageService.saveAppState(newState);
    return newState;
  },

  // Exclui um pet
  deletePet: async (petId) => {
    const state = await StorageService.loadAppState();
    const pets = state.pets.filter(p => p.id !== petId);
    const activePetId = pets.length > 0 ? pets[0].id : null;
    const newState = { pets, activePetId };
    await StorageService.saveAppState(newState);
    return newState;
  },

  // Limpa tudo (útil para testes de cadastro do zero)
  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { pets: [], activePetId: null };
  }
};
