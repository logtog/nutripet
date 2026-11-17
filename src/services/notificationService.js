import { Platform } from 'react-native';

// Carrega o expo-notifications só quando preciso. No Expo Go (Android) o módulo
// nativo não existe e importar no topo derruba o app inteiro; assim o app abre
// e usa o alerta dentro da tela como alternativa.
let Notifications = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.warn('expo-notifications indisponível neste ambiente:', e?.message);
    Notifications = null;
  }
}

export const NotificationService = {
  // Solicita permissão de notificação (Mobile e Navegador Web)
  requestPermissions: async () => {
    try {
      if (Platform.OS === 'web') {
        if ('Notification' in window) {
          const permission = await window.Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      } else {
        if (!Notifications) return false;
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        return finalStatus === 'granted';
      }
    } catch (e) {
      console.warn('Erro ao pedir permissão de notificação:', e);
      return false;
    }
  },

  // Agenda um alerta em X segundos (ideal para testar na aula ou agendar próxima refeição)
  scheduleReminder: async ({ title, body, seconds = 5, onTriggerInApp }) => {
    // 1. Dispara o callback visual in-app após o tempo determinado (garante funcionamento 100% em qualquer PC de laboratório)
    if (onTriggerInApp) {
      setTimeout(() => {
        onTriggerInApp({ title, body, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
      }, seconds * 1000);
    }

    // 2. Dispara a notificação real do Sistema Operacional (Android / iOS / Browser Web)
    try {
      if (Platform.OS === 'web') {
        if ('Notification' in window && window.Notification.permission === 'granted') {
          setTimeout(() => {
            new window.Notification(title, { body });
          }, seconds * 1000);
        } else if ('Notification' in window && window.Notification.permission !== 'denied') {
          window.Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
              setTimeout(() => {
                new window.Notification(title, { body });
              }, seconds * 1000);
            }
          });
        }
      } else {
        if (!Notifications) return false;
        await NotificationService.requestPermissions();
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger: {
            seconds: Math.max(1, seconds),
          },
        });
      }
      return true;
    } catch (e) {
      console.warn('Notificação nativa indisponível, usando banner In-App:', e);
      return false;
    }
  }
};
