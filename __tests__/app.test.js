import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from '../App';
import HealthScreen from '../src/screens/HealthScreen';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

async function cadastrarThor() {
  await render(<App />);
  await screen.findByText('Cadastrar Animal no NutriPet');
  await fireEvent.press(screen.getByText(/Carregar Cão/));
  await fireEvent.press(screen.getByText('Concluir Cadastro do Pet'));
  await screen.findByText('Resumo Clínico & Nutricional');
}

test('abre sem pets mostrando o cadastro (módulo de notificações ausente não derruba o app)', async () => {
  await render(<App />);
  expect(await screen.findByText('Cadastrar Animal no NutriPet')).toBeTruthy();
});

test('cadastra o Thor pelo preenchimento rápido e mostra o alerta de ração antiga', async () => {
  await cadastrarThor();
  expect(screen.getAllByText('Thor').length).toBeGreaterThan(0);
  expect(screen.getByText('Hora de Variar ou Complementar a Dieta!')).toBeTruthy();
});

test('nome vazio é rejeitado com aviso', async () => {
  const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await render(<App />);
  await screen.findByText('Cadastrar Animal no NutriPet');
  await fireEvent.press(screen.getByText('Concluir Cadastro do Pet'));
  expect(alerta).toHaveBeenCalled();
  expect(screen.queryByText('Resumo Clínico & Nutricional')).toBeNull();
});

test('peso com vírgula é aceito e data inválida é recusada', async () => {
  const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await render(<App />);
  await screen.findByText('Cadastrar Animal no NutriPet');
  await fireEvent.press(screen.getByText(/Carregar Cão/));
  await fireEvent.changeText(screen.getByPlaceholderText('Ex: 2026-09-01'), 'ontem');
  await fireEvent.press(screen.getByText('Concluir Cadastro do Pet'));
  expect(alerta).toHaveBeenCalledWith('Atenção', expect.stringMatching(/Data de início/));
  expect(screen.queryByText('Resumo Clínico & Nutricional')).toBeNull();

  await fireEvent.changeText(screen.getByPlaceholderText('Ex: 2026-09-01'), '2026-10-01');
  await fireEvent.changeText(screen.getByPlaceholderText('Ex: 12.5'), '12,5');
  await fireEvent.press(screen.getByText('Concluir Cadastro do Pet'));
  await screen.findByText('Resumo Clínico & Nutricional');
  expect(screen.getAllByText(/12.5 kg/).length).toBeGreaterThan(0);
});

test('excluir pede confirmação no celular e só apaga ao confirmar', async () => {
  const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await cadastrarThor();
  await fireEvent.press(screen.getByText('Excluir'));
  expect(alerta).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Resumo Clínico & Nutricional')).toBeTruthy(); // ainda não apagou

  const botoes = alerta.mock.calls[0][2];
  await act(async () => {
    botoes.find((b) => b.text === 'Excluir').onPress();
  });
  await waitFor(() => expect(screen.getByText('Cadastrar Animal no NutriPet')).toBeTruthy());
});

test('aba de vacinas: marcar, adicionar e data inválida', async () => {
  const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await cadastrarThor();
  await fireEvent.press(screen.getByText('Vacinas & Ciclo Reprodutivo'));
  await screen.findByText(/Carteira de Vacinação Digital de Thor/);

  await fireEvent.changeText(screen.getByPlaceholderText(/Ex: V10, Antirrábica/), 'Bravecto');
  await fireEvent.changeText(screen.getByPlaceholderText('Ex: 2027-05-15'), '15/05/2027');
  await fireEvent.press(screen.getByText('Inserir na Carteira de Vacinação'));
  expect(alerta).toHaveBeenCalledWith('Atenção', expect.stringMatching(/Data do reforço inválida/));

  await fireEvent.changeText(screen.getByPlaceholderText('Ex: 2027-05-15'), '2027-05-15');
  await fireEvent.press(screen.getByText('Inserir na Carteira de Vacinação'));
  expect(await screen.findByText('Bravecto')).toBeTruthy();
});

describe('HealthScreen: ciclo do cio', () => {
  const base = {
    id: 'x', name: 'Luna', species: 'cat', gender: 'female', isNeutered: false, heatCycleDays: 180,
  };
  test('data de cio inválida não derruba a tela e explica o que fazer', async () => {
    await render(<HealthScreen pet={{ ...base, lastHeatDate: 'lixo' }} vaccines={[]} onUpdateVaccines={() => {}} />);
    expect(screen.getByText('Data do último cio não informada')).toBeTruthy();
    expect(screen.queryByText(/macho não castrado/)).toBeNull();
  });
  test('data válida mostra a previsão', async () => {
    await render(<HealthScreen pet={{ ...base, lastHeatDate: '2026-06-10' }} vaccines={[]} onUpdateVaccines={() => {}} />);
    expect(screen.getByText('PREVISÃO DO PRÓXIMO CIO')).toBeTruthy();
  });
});
