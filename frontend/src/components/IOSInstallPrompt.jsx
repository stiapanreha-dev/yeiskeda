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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-3">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            Для установки приложения:
          </p>

          <div className="space-y-3 text-sm">
            {/* Шаг 1 */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold mr-3">1</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Нажмите</p>
                <div className="flex items-center mt-1">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">внизу Safari</span>
                </div>
              </div>
            </div>

            {/* Шаг 2 */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-base font-bold mr-3">2</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Выберите</p>
                <div className="flex items-center mt-1">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4m-8-8h8"/>
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">"На экран «Домой»"</span>
                </div>
              </div>
            </div>

            {/* Шаг 3 */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-base font-bold mr-3">3</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Нажмите "Добавить"</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Готово! Иконка появится на экране</p>
              </div>
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
