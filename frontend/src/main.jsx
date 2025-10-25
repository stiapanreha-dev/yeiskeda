import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/css/index.css';

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker зарегистрирован:', registration.scope);

        // Проверка обновлений каждые 30 минут
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        // Периодическая очистка кеша
        setInterval(() => {
          registration.active?.postMessage({ type: 'CLEANUP_CACHE' });
        }, 24 * 60 * 60 * 1000); // Раз в сутки
      })
      .catch((error) => {
        console.error('[PWA] Ошибка регистрации Service Worker:', error);
      });

    // Обработка обновлений Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Новая версия приложения активирована');
      // Можно показать уведомление пользователю
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
