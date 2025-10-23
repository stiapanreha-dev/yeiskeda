import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storesAPI } from '../services/api';
import Layout from '../components/Layout';

const StoreSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
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
  }, []);

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
      const response = await storesAPI.getMy();
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
        await storesAPI.update(data);
        alert('Магазин успешно обновлен!');
      } else {
        await storesAPI.create(data);
        alert('Магазин успешно создан!');
      }
      navigate('/store/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || `Ошибка при ${isEditMode ? 'обновлении' : 'создании'} магазина`);
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
        <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Редактирование магазина' : 'Создание магазина'}</h1>

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Как найти координаты вашего магазина:</p>
          <ol className="list-decimal ml-5 mt-2">
            <li>Откройте <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a> или <a href="https://yandex.ru/maps" target="_blank" rel="noopener noreferrer" className="underline">Яндекс.Карты</a></li>
            <li>Найдите адрес вашего магазина</li>
            <li>Кликните правой кнопкой мыши на точку магазина или подержите на экране мобильного телефона несколько секунд на адресе вашего магазина</li>
            <li>Скопируйте координаты (первое число - широта, второе - долгота)</li>
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

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Адрес *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
                placeholder="г. Астана, ул. Кабанбай Батыра, 15"
              />
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
