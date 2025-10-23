import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storesAPI } from '../services/api';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const StoreView = () => {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWorkingHours, setShowWorkingHours] = useState(false);
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

  // Форматирование времени работы
  const formatWorkingHours = (hours) => {
    if (typeof hours === 'string') {
      return hours;
    } else if (typeof hours === 'object' && hours.open && hours.close) {
      if (hours.closed) {
        return 'Выходной';
      }
      return `${hours.open}-${hours.close}`;
    }
    return 'Не указано';
  };

  useEffect(() => {
    fetchStore();
  }, [slug]);

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

  const fetchStore = async () => {
    try {
      const response = await storesAPI.getById(slug);
      setStore(response.data.data);
    } catch (err) {
      setError('Магазин не найден');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Загрузка...</p>
        </div>
      </Layout>
    );
  }

  if (error || !store) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Магазин не найден'}
          </div>
          <Link
            to="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary"
          >
            Вернуться на главную
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Заголовок магазина */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 relative">
          {store.photo ? (
            <div className="relative h-64 bg-gray-200 rounded-t-lg overflow-hidden">
              <img
                src={store.photo}
                alt={store.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                    <p className="text-lg">{store.address}</p>
                    {store.description && (
                      <p className="mt-2 text-sm opacity-90">{store.description}</p>
                    )}
                  </div>
                  {store.workingHours && (
                    <div className="ml-4" ref={workingHoursRef}>
                      <button
                        onClick={() => setShowWorkingHours(!showWorkingHours)}
                        className="p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        aria-label="Время работы"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-primary dark:bg-green-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                  <p className="text-lg">{store.address}</p>
                  {store.description && (
                    <p className="mt-2 text-sm opacity-90">{store.description}</p>
                  )}
                </div>
                {store.workingHours && (
                  <div className="ml-4" ref={workingHoursRef}>
                    <button
                      onClick={() => setShowWorkingHours(!showWorkingHours)}
                      className="p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      aria-label="Время работы"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Выпадающее меню времени работы (вне overflow-hidden) */}
          {showWorkingHours && store.workingHours && (
            <div className="absolute top-12 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3">Время работы</h3>
                {typeof store.workingHours === 'string' ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{store.workingHours}</p>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(store.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{dayTranslations[day] || day}:</span>
                        <span className="text-gray-800 dark:text-gray-200">{formatWorkingHours(hours)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Товары */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Товары со скидкой {store.products?.length > 0 && `(${store.products.length})`}
          </h2>
        </div>

        {store.products?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
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
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              В данный момент нет товаров со скидкой
            </p>
            <Link
              to="/"
              className="inline-block mt-4 text-primary dark:text-green-400 hover:underline"
            >
              Посмотреть другие магазины
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StoreView;
