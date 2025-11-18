import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect, useRef } from 'react';
import { storesAPI } from '../services/api';
import InstallPWA from './InstallPWA';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const workingHoursRef = useRef(null);

  // Словарь для перевода дней недели
  const dayTranslations = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  };

  // Форматирование времени работы - поддержка обоих форматов
  const formatWorkingHours = (hours) => {
    if (typeof hours === 'string') {
      return hours; // Простой формат: "08:00-22:00"
    } else if (typeof hours === 'object' && hours.open && hours.close) {
      // Сложный формат: {open: '09:00', close: '18:00', closed: false}
      if (hours.closed) {
        return 'Выходной';
      }
      return `${hours.open}-${hours.close}`;
    }
    return 'Не указано';
  };

  useEffect(() => {
    // Проверяем сохраненную тему при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Загружаем данные магазина для владельцев
  useEffect(() => {
    if (user?.role === 'store') {
      fetchStoreData();
    }
  }, [user]);

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (workingHoursRef.current && !workingHoursRef.current.contains(event.target)) {
        setShowWorkingHours(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await storesAPI.getMy();
      setStoreData(response.data.data);
    } catch (err) {
      console.error('Error fetching store data:', err);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/almaz.png"
              alt="Спаси Еду"
              className="h-12 w-12 object-contain"
            />
          </Link>

          <nav className="flex items-center space-x-2 md:space-x-6 w-full md:w-auto justify-end">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400">
              Главная
            </Link>
            <Link to="/map" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400">
              Карта
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400"
                  title="Войти"
                >
                  <span className="hidden md:inline">Войти</span>
                  <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white rounded-lg hover:bg-secondary dark:bg-green-600 dark:hover:bg-green-700 px-4 py-2 md:px-4 md:py-2"
                  title="Регистрация"
                >
                  <span className="hidden md:inline">Регистрация</span>
                  <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'customer' && (
                  <span className="text-gray-700 dark:text-gray-300">
                    Покупатель
                  </span>
                )}
                {user?.role === 'store' && (
                  <Link
                    to="/store/dashboard"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400"
                  >
                    Мой магазин
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400"
                  >
                    Админ-панель
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  title="Выйти"
                >
                  <span className="hidden md:inline">Выйти</span>
                  <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}

            {/* Время работы для владельцев магазинов */}
            {user?.role === 'store' && storeData && (
              <div className="relative" ref={workingHoursRef}>
                <button
                  onClick={() => setShowWorkingHours(!showWorkingHours)}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Время работы"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {showWorkingHours && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-3">Время работы</h3>
                      {storeData.workingHours ? (
                        typeof storeData.workingHours === 'string' ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300">{storeData.workingHours}</p>
                        ) : (
                          <div className="space-y-1">
                            {Object.entries(storeData.workingHours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{dayTranslations[day] || day}:</span>
                                <span className="text-gray-800 dark:text-gray-200">{formatWorkingHours(hours)}</span>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Не указано</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Кнопка установки PWA */}
            <InstallPWA />

            {/* Переключатель темы */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Переключить тему"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
