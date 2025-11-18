import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storesAPI } from '../services/api';
import Layout from '../components/Layout';

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_API_KEY;
const YANDEX_SUGGEST_KEY = import.meta.env.VITE_YANDEX_GEOSUGGEST_KEY;

const StoreSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('storeId'); // For admin access
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [ymapsReady, setYmapsReady] = useState(false);
  const ymapsRef = useRef(null);
  const suggestViewRef = useRef(null);
  const suggestTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    photo: null,
    workingHours: {
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '10:00-16:00',
      sunday: 'Выходной'
    }
  });

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  useEffect(() => {
    loadYandexMaps();
  }, []);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (suggestTimeoutRef.current) {
        clearTimeout(suggestTimeoutRef.current);
      }
    };
  }, []);

  // Загрузка Yandex Maps API
  const loadYandexMaps = () => {
    console.log('loadYandexMaps called');

    // Проверяем, загружен ли уже API
    if (window.ymaps && window.ymaps.ready) {
      console.log('Yandex Maps API already loaded');
      if (ymapsRef.current) {
        console.log('ymapsRef already set');
        return; // Уже инициализирован
      }

      window.ymaps.ready(() => {
        console.log('✅ Yandex Maps ready (existing)');
        ymapsRef.current = window.ymaps;
        setYmapsReady(true);
        console.log('✅ ymapsRef.current set:', ymapsRef.current);
      });
      return;
    }

    // Проверяем, есть ли уже скрипт в DOM
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existingScript) {
      console.log('Script already in DOM, waiting for load');
      // Скрипт уже добавлен, ждем загрузки
      if (window.ymaps) {
        window.ymaps.ready(() => {
          console.log('✅ Yandex Maps ready (from existing script)');
          ymapsRef.current = window.ymaps;
          setYmapsReady(true);
          console.log('✅ ymapsRef.current set:', ymapsRef.current);
        });
      }
      return;
    }

    console.log('Loading Yandex Maps API script');
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&suggest_apikey=${YANDEX_SUGGEST_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      console.log('Yandex Maps script loaded');
      window.ymaps.ready(() => {
        console.log('✅ Yandex Maps ready (new script)');
        ymapsRef.current = window.ymaps;
        setYmapsReady(true);
        console.log('✅ ymapsRef.current set:', ymapsRef.current);
      });
    };
    script.onerror = (error) => {
      console.error('Error loading Yandex Maps script:', error);
    };
    document.head.appendChild(script);
  };

  // Получение подсказок адресов через геокодирование
  const getSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!ymapsRef.current) {
      console.log('⚠️ ymaps not ready yet');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (typeof ymapsRef.current.geocode !== 'function') {
      console.error('❌ ymaps.geocode is not a function:', ymapsRef.current);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    console.log('Getting suggestions for:', query);
    setIsLoadingSuggestions(true);

    try {
      // Используем ymaps.suggest() - официальный метод для автодополнения
      const items = await ymapsRef.current.suggest(query, {
        results: 5
      });

      console.log('✅ Suggest items received:', items);

      // Преобразуем результаты suggest в формат с координатами
      const suggestions = await Promise.all(
        items.map(async (item) => {
          try {
            // Получаем координаты через geocode для каждого адреса
            const geocodeResult = await ymapsRef.current.geocode(item.value, { results: 1 });
            const firstGeoObject = geocodeResult.geoObjects.get(0);
            const coords = firstGeoObject ? firstGeoObject.geometry.getCoordinates() : null;

            return {
              displayName: item.displayName,
              value: item.value,
              coords: coords
            };
          } catch (err) {
            console.error('Error geocoding suggestion:', err);
            return {
              displayName: item.displayName,
              value: item.value,
              coords: null
            };
          }
        })
      );

      console.log('✅ Suggestions with coords:', suggestions);
      setSuggestions(suggestions.filter(s => s.coords)); // Только с координатами
      setShowSuggestions(suggestions.filter(s => s.coords).length > 0);
    } catch (error) {
      console.error('❌ Error getting suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Обработчик выбора адреса из списка
  const handleSelectSuggestion = (suggestion) => {
    console.log('✅ Selected suggestion:', suggestion);
    const address = suggestion.displayName || suggestion.value;
    const coords = suggestion.coords;

    // Сразу устанавливаем адрес и координаты
    setFormData(prev => ({
      ...prev,
      address: address,
      latitude: coords[0].toFixed(6),
      longitude: coords[1].toFixed(6)
    }));

    setShowSuggestions(false);
    setSuggestions([]);

    console.log('✅ Coordinates set:', { lat: coords[0].toFixed(6), lon: coords[1].toFixed(6) });
  };

  // Геокодирование адреса для получения координат
  const geocodeAddress = async (address) => {
    if (!ymapsRef.current || !address) {
      console.log('Cannot geocode: ymaps or address is missing');
      return;
    }

    console.log('Geocoding address:', address);

    try {
      const result = await ymapsRef.current.geocode(address, {
        results: 1
      });

      const firstGeoObject = result.geoObjects.get(0);

      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        console.log('✅ Coordinates found:', coords);

        setFormData(prev => ({
          ...prev,
          latitude: coords[0].toFixed(6),
          longitude: coords[1].toFixed(6)
        }));
      } else {
        console.log('❌ No geoobject found for address:', address);
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
    }
  };

  // Нормализация workingHours - преобразует сложный формат в простой
  const normalizeWorkingHours = (hours) => {
    if (!hours) return formData.workingHours;

    // Если это массив (испорченные данные) - пытаемся восстановить
    if (Array.isArray(hours)) {
      try {
        // Объединяем массив символов в строку и парсим
        const jsonString = hours.join('');
        const parsed = JSON.parse(jsonString);
        return normalizeWorkingHours(parsed); // Рекурсивно нормализуем
      } catch (e) {
        console.error('Failed to parse corrupted workingHours:', e);
        return formData.workingHours;
      }
    }

    const normalized = {};
    Object.entries(hours).forEach(([day, value]) => {
      // Пропускаем числовые ключи (остатки от испорченных данных)
      if (!isNaN(day)) return;

      if (typeof value === 'string') {
        // Уже в правильном формате
        normalized[day] = value;
      } else if (typeof value === 'object' && value.open && value.close) {
        // Сложный формат - преобразуем в простой
        if (value.closed) {
          normalized[day] = 'Выходной';
        } else {
          normalized[day] = `${value.open}-${value.close}`;
        }
      }
    });
    return normalized;
  };

  const fetchStore = async () => {
    try {
      const response = await storesAPI.getMy(storeId);
      const store = response.data.data;

      if (store) {
        setIsEditMode(true);
        setCurrentPhoto(store.photo);
        setFormData({
          name: store.name || '',
          description: store.description || '',
          address: store.address || '',
          latitude: store.latitude || '',
          longitude: store.longitude || '',
          photo: null,
          workingHours: normalizeWorkingHours(store.workingHours)
        });
      }
    } catch (err) {
      // Store doesn't exist yet - create mode
      console.log('No store found, create mode');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Обработчик изменения адреса
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, address: value });

    // Debounce для запроса подсказок
    if (suggestTimeoutRef.current) {
      clearTimeout(suggestTimeoutRef.current);
    }

    suggestTimeoutRef.current = setTimeout(() => {
      getSuggestions(value);
    }, 300);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleWorkingHoursChange = (day, value) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('workingHours', JSON.stringify(formData.workingHours));

      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      if (isEditMode) {
        await storesAPI.update(data, storeId);
        toast.success('Магазин успешно обновлен!');
      } else {
        await storesAPI.create(data, storeId);
        toast.success('Магазин успешно создан!');
      }
      // Navigate back with storeId if present (for admin)
      setTimeout(() => {
        navigate(storeId ? `/store/dashboard?storeId=${storeId}` : '/store/dashboard');
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || `Ошибка при ${isEditMode ? 'обновлении' : 'создании'} магазина`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="text-center py-12">Загрузка...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">{isEditMode ? 'Редактирование магазина' : 'Создание магазина'}</h1>

        <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-200 px-4 py-3 rounded mb-6">
          <p className="font-bold">Как заполнить адрес:</p>
          <ol className="list-decimal ml-5 mt-2">
            <li>Начните вводить адрес вашего магазина в поле "Адрес"</li>
            <li>Выберите нужный вариант из выпадающего списка подсказок</li>
            <li>Координаты определятся автоматически после выбора или нажатия вне поля</li>
            <li>При необходимости можно скорректировать координаты вручную</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Название магазина *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
                placeholder="Экстра Маркет"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Краткое описание вашего магазина"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Адрес * (начните вводить для подсказок)</label>
              <input
                type="text"
                id="address-input"
                name="address"
                value={formData.address}
                onChange={handleAddressChange}
                onFocus={() => formData.address.length >= 3 && getSuggestions(formData.address)}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
                placeholder="Например: г. Ейск, ул. Свердлова, 87"
                autoComplete="off"
              />

              {/* Выпадающий список подсказок */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white border-b dark:border-gray-600 last:border-b-0"
                    >
                      {suggestion.displayName || suggestion.value}
                    </div>
                  ))}
                </div>
              )}

              {isLoadingSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg px-4 py-2">
                  <span className="text-gray-600 dark:text-gray-300">Загрузка подсказок...</span>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {ymapsReady ? (
                  <>💡 Начните вводить адрес (мин. 3 символа), выберите вариант из списка - координаты определятся автоматически</>
                ) : (
                  <>⏳ Загрузка карт Яндекс... Подождите перед вводом адреса</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Широта (Latitude) *</label>
                <input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="51.1694"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Долгота (Longitude) *</label>
                <input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="71.4491"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Фото магазина</label>
              {currentPhoto && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Текущее фото:</p>
                  <img
                    src={currentPhoto}
                    alt="Store"
                    className="w-32 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-gray-600 mt-1">
                {isEditMode ? 'Оставьте пустым, чтобы сохранить текущее фото. ' : ''}
                Рекомендуемый размер: 800x600px
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Часы работы</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Укажите время работы для каждого дня недели. Формат: "09:00-18:00" или "Выходной"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries({
                  monday: 'Понедельник',
                  tuesday: 'Вторник',
                  wednesday: 'Среда',
                  thursday: 'Четверг',
                  friday: 'Пятница',
                  saturday: 'Суббота',
                  sunday: 'Воскресенье'
                }).map(([day, label]) => (
                  <div key={day}>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{label}</label>
                    <input
                      type="text"
                      value={formData.workingHours[day] || ''}
                      onChange={(e) => handleWorkingHoursChange(day, e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      placeholder="09:00-18:00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary disabled:opacity-50 font-medium"
            >
              {loading ? (isEditMode ? 'Сохранение...' : 'Создание...') : (isEditMode ? 'Сохранить изменения' : 'Создать магазин')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StoreSettings;
