import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../src/services/storage';

const pet = (id, name = id) => ({ id, name });

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('começa vazio', async () => {
  expect(await StorageService.loadAppState()).toEqual({ pets: [], activePetId: null });
});

test('adiciona, atualiza e exclui', async () => {
  await StorageService.addPet(pet('a', 'Thor'));
  let s = await StorageService.addPet(pet('b', 'Luna'));
  expect(s.pets.map((p) => p.id)).toEqual(['a', 'b']);
  expect(s.activePetId).toBe('b');

  s = await StorageService.updatePet({ id: 'a', name: 'Thor 2' });
  expect(s.pets[0].name).toBe('Thor 2');

  s = await StorageService.deletePet('a');
  expect(s.pets.map((p) => p.id)).toEqual(['b']);
  expect(s.activePetId).toBe('b');

  s = await StorageService.deletePet('b');
  expect(s).toEqual({ pets: [], activePetId: null });
});

test('gravações simultâneas não se sobrescrevem (condição de corrida)', async () => {
  await Promise.all(['1', '2', '3', '4', '5'].map((id) => StorageService.addPet(pet(id))));
  const s = await StorageService.loadAppState();
  expect(s.pets.map((p) => p.id).sort()).toEqual(['1', '2', '3', '4', '5']);
});

test('dados corrompidos não derrubam o app', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await AsyncStorage.setItem('@nutripet_app_v2', '{isso não é json');
  expect(await StorageService.loadAppState()).toEqual({ pets: [], activePetId: null });
  await AsyncStorage.setItem('@nutripet_app_v2', JSON.stringify({ pets: 'x' }));
  expect((await StorageService.loadAppState()).pets).toEqual([]);
  spy.mockRestore();
});

test('clearAll', async () => {
  await StorageService.addPet(pet('a'));
  await StorageService.clearAll();
  expect((await StorageService.loadAppState()).pets).toEqual([]);
});
