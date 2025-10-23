import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { storesAPI } from '../services/api';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Home = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openWorkingHours, setOpenWorkingHours] = useState(null);
  const workingHoursRefs = useRef({});

  // Правильный порядок дней недели (понедельник - воскресенье)
  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
    fetchStores();
  }, []);

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openWorkingHours && workingHoursRefs.current[openWorkingHours]) {
        if (!workingHoursRefs.current[openWorkingHours].contains(event.target)) {
          setOpenWorkingHours(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openWorkingHours]);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getAll();
      setStores(response.data.data);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Продукты со скидкой
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Спаси еду от выбрасывания! Покупай товары близкие к окончанию срока годности со скидкой от 30%
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {stores.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Пока нет доступных товаров
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {stores.map((store) => (
            <div key={store.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
              {store.photo ? (
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={store.photo}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">
                          <Link to={`/store/${store.slug}`} className="hover:underline">
                            {store.name}
                          </Link>
                        </h2>
                        <p className="text-sm mt-1">{store.address}</p>
                      </div>
                      {store.workingHours && (
                        <div className="ml-2" ref={(el) => workingHoursRefs.current[store.id] = el}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenWorkingHours(openWorkingHours === store.id ? null : store.id);
                            }}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            aria-label="Время работы"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-primary dark:bg-green-600 text-white p-4 rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        <Link to={`/store/${store.slug}`} className="hover:underline">
                          {store.name}
                        </Link>
                      </h2>
                      <p className="text-sm mt-1">{store.address}</p>
                    </div>
                    {store.workingHours && (
                      <div className="ml-2" ref={(el) => workingHoursRefs.current[`no-photo-${store.id}`] = el}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenWorkingHours(openWorkingHours === `no-photo-${store.id}` ? null : `no-photo-${store.id}`);
                          }}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                          aria-label="Время работы"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Выпадающее меню времени работы (вне overflow-hidden) */}
              {openWorkingHours === store.id && store.workingHours && (
                <div className="absolute top-12 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3">Время работы</h3>
                    {typeof store.workingHours === 'string' ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{store.workingHours}</p>
                    ) : (
                      <div className="space-y-1">
                        {daysOrder
                          .filter(day => store.workingHours[day])
                          .map(day => (
                            <div key={day} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{dayTranslations[day]}:</span>
                              <span className="text-gray-800 dark:text-gray-200">{formatWorkingHours(store.workingHours[day])}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {openWorkingHours === `no-photo-${store.id}` && store.workingHours && (
                <div className="absolute top-12 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3">Время работы</h3>
                    {typeof store.workingHours === 'string' ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{store.workingHours}</p>
                    ) : (
                      <div className="space-y-1">
                        {daysOrder
                          .filter(day => store.workingHours[day])
                          .map(day => (
                            <div key={day} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{dayTranslations[day]}:</span>
                              <span className="text-gray-800 dark:text-gray-200">{formatWorkingHours(store.workingHours[day])}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {store.products?.map((product) => (
                    <div key={product.id} className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition bg-white dark:bg-gray-700">
                      {product.photo && (
                        <img
                          src={product.photo}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}

                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 dark:text-white">{product.name}</h3>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 dark:text-gray-400 line-through">
                            {parseFloat(product.originalPrice).toFixed(0)} ₽
                          </span>
                          <span className="text-2xl font-bold text-primary dark:text-green-400">
                            {parseFloat(product.discountPrice).toFixed(0)} ₽
                          </span>
                        </div>

                        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-1 rounded inline-block mb-2">
                          -{product.discountPercentage}%
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Срок годности: {format(new Date(product.expiryDate), 'dd MMMM yyyy', { locale: ru })}
                        </p>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Количество: {product.quantity} шт.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Home;
