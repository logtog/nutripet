# 🐾 NutriPet

Aplicativo mobile (e web) para acompanhar a **nutrição e a saúde de cães e gatos**, feito com Expo / React Native.

Tudo funciona **offline e sem conta**: os dados ficam salvos só no aparelho (AsyncStorage). Não há servidor, API ou chave de acesso.

## O que o app faz

- **Cadastro de vários pets** (cão ou gato): foto, raça, sexo, peso, castração e data de nascimento.
- **Nutrição**: marca da ração, intervalo entre refeições, porção diária e por refeição, botão "acabei de alimentar" que recalcula o próximo horário.
- **Alerta de ração repetida**: avisa quando o pet está há muitos dias com a mesma ração (limite varia por raça) e sugere vegetais seguros.
- **Guia de alimentos** permitidos e tóxicos (chocolate, uva, cebola etc.).
- **Saúde**: carteira de vacinação digital (marcar aplicada, adicionar, remover) e previsão do próximo cio para fêmeas não castradas.
- **Lembretes**: banner dentro do app e notificação do sistema (veja a observação sobre Expo Go abaixo).

## Como rodar

### Requisitos

- [Node.js](https://nodejs.org) **22.13+ ou 24.3+** (versão LTS).
- No celular: o app gratuito **Expo Go** (Play Store ou App Store).

### Passo a passo

Na pasta do projeto:

| Sistema | Comando |
|---|---|
| Windows | dê dois cliques em `iniciar.bat` (ou rode `iniciar.bat` no terminal) |
| Mac / Linux | `./iniciar.sh` |
| Qualquer um | `npm install` (só na 1ª vez) e depois `npx expo start` |

O `iniciar.bat` / `iniciar.sh` confere a versão do Node e instala as dependências se a pasta `node_modules` não existir. Depois abre o servidor e mostra um **QR Code**:

- **Android:** abra o Expo Go → "Scan QR Code".
- **iPhone:** aponte a câmera para o QR Code e toque em "Abrir no Expo Go".

Variações (funcionam no atalho e no `npx expo start`):

| Quando | Comando |
|---|---|
| Celular e PC na **mesma rede Wi-Fi** | `npx expo start` |
| Redes diferentes ou Wi-Fi que bloqueia (faculdade, 4G) | `npx expo start --tunnel` (pede login numa conta Expo gratuita) |
| Abrir no navegador do PC | `npx expo start --web` |

Se o Windows perguntar sobre o firewall para o Node.js, permita em **redes privadas**.

### Copiando o projeto para outra máquina

1. Copie a pasta inteira (pode incluir ou não a `node_modules`).
2. Na outra máquina, instale o Node.js e rode `iniciar.bat` (Windows) ou `./iniciar.sh`.
3. Se você copiou a `node_modules` de **outro sistema operacional** (ex.: Windows → Mac), apague essa pasta antes: o atalho a recria.

## Observações importantes

- **Notificações do sistema não funcionam no Expo Go do Android** (limitação do Expo Go). Nele, o app mostra o lembrete como banner dentro da tela. As notificações reais funcionam na versão web e em um app instalado (`.apk`, veja abaixo).
- Os dados ficam só no aparelho. Limpar os dados do app ou desinstalar apaga os pets.
- O app é uma ferramenta de apoio, **não substitui um veterinário**. Os intervalos de ração e o calendário de vacinas são valores de referência.

### Gerar um `.apk` instalável (Android)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

A compilação roda na nuvem da Expo (conta gratuita) e devolve um link e um QR Code de download. Para iPhone, a instalação fora do Expo Go exige conta de desenvolvedor Apple (paga).

## Testes

```bash
npm test
```

Cobrem validação de campos, cálculos de nutrição e cio, armazenamento (inclusive gravações simultâneas e dados corrompidos) e os fluxos principais das telas (cadastro, exclusão, vacinas). Para checar a saúde das dependências: `npx expo-doctor`.

## Estrutura

```
App.js                      tela principal, lista de pets e navegação
src/data/database.js        raças, alimentos seguros/tóxicos, vacinas padrão
src/services/storage.js     persistência local (fila de gravação)
src/services/nutritionEngine.js   dias de ração, próxima refeição, ciclo do cio
src/services/validation.js  validação de datas, números e dieta
src/services/notificationService.js   lembretes (sistema + banner no app)
src/screens/                cadastro, nutrição e saúde
src/components/             cartão do pet
__tests__/                  testes automatizados (Jest)
```

## Segurança e privacidade

- Sem rede, sem login, sem chaves ou tokens no código.
- Os campos digitados são validados antes de salvar (datas, peso, intervalos).
- As falhas listadas por `npm audit` estão nas ferramentas de desenvolvimento do Expo/React Native (servidor de desenvolvimento e empacotador), não no código que roda no aparelho. Elas são resolvidas atualizando o SDK do Expo.

## Licença

MIT. Veja o arquivo `LICENSE`.
