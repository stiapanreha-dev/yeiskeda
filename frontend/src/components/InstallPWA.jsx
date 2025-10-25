import { useState, useEffect } from 'react';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Проверяем, установлено ли уже PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Проверяем, мобильное ли устройство
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();

    // Ловим событие установки PWA
    const handleBeforeInstallPrompt = (e) => {
      // Предотвращаем автоматическое окно (если хотим контроль)
      // e.preventDefault(); // Раскомментировать для полного контроля

      // Сохраняем промпт для использования позже
      setInstallPrompt(e);
      console.log('[PWA] Приложение готово к установке');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Следим за успешной установкой
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Приложение установлено');
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }

    // Показываем диалог установки
    installPrompt.prompt();

    // Ждём ответа пользователя
    const { outcome } = await installPrompt.userChoice;
    console.log(`[PWA] Пользователь ${outcome === 'accepted' ? 'принял' : 'отклонил'} установку`);

    // Очищаем промпт
    setInstallPrompt(null);
  };

  // Не показываем кнопку если:
  // - PWA уже установлено
  // - Браузер не поддерживает установку
  // - Не мобильное устройство (опционально)
  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="p-2 rounded-lg bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition-colors group relative"
      aria-label="Установить приложение"
      title="Установить приложение"
    >
      {/* Иконка скачивания */}
      <svg
        className="w-5 h-5 text-green-700 dark:text-green-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>

      {/* Подсказка при наведении (только на десктопе) */}
      <span className="hidden md:block absolute right-0 top-full mt-2 w-48 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        Установить приложение на устройство
      </span>
    </button>
  );
};

export default InstallPWA;
