import { useState, useEffect } from 'react';

const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Проверяем: iOS + Safari + не установлено
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Показываем только на iOS Safari, если PWA не установлено
    if (isIOS && !isInStandaloneMode && isSafari) {
      // Проверяем localStorage - показывали ли уже
      const dismissed = localStorage.getItem('ios-install-prompt-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Запоминаем на 7 дней
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('ios-install-prompt-dismissed', expiryDate.toISOString());
  };

  const handleNeverShow = () => {
    setShowPrompt(false);
    // Запоминаем навсегда
    localStorage.setItem('ios-install-prompt-dismissed', 'forever');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t-4 border-green-600 shadow-2xl">
      <div className="max-w-md mx-auto">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <img src="/icon-72x72.png" alt="Спаси Еду!" className="w-12 h-12 rounded-xl mr-3" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Установите приложение</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Быстрый доступ с главного экрана</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Закрыть"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Инструкция */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3">
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
              <p>Нажмите кнопку <strong>"Поделиться"</strong>
                <svg className="inline w-5 h-5 mx-1 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                внизу экрана
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
              <p>Выберите <strong>"На экран «Домой»"</strong></p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
              <p>Нажмите <strong>"Добавить"</strong></p>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Позже
          </button>
          <button
            onClick={handleNeverShow}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Больше не показывать
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;
