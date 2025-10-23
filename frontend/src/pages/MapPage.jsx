import { useEffect, useState, useRef } from 'react';
import { storesAPI } from '../services/api';
import Layout from '../components/Layout';

const YANDEX_API_KEY = '5bb7a43b-1132-46a7-b74b-0cdd299885fd';

const MapPage = () => {
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState([46.71, 38.27]); // Yeisk coordinates
  const [radius, setRadius] = useState(5); // km
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const ymapsRef = useRef(null);
  const userMarkerRef = useRef(null);
  const storeMarkersRef = useRef([]);
  const circleRef = useRef(null);

  // Загрузка Яндекс.Карт API
  useEffect(() => {
    if (window.ymaps) {
      ymapsRef.current = window.ymaps;
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => {
        ymapsRef.current = window.ymaps;
        initMap();
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.destroy();
      }
    };
  }, []);

  // Получение местоположения пользователя
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          if (mapRef.current && userMarkerRef.current) {
            userMarkerRef.current.geometry.setCoordinates(newLocation);
            mapRef.current.setCenter(newLocation);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Обновление карты при изменении местоположения или радиуса
  useEffect(() => {
    if (mapRef.current) {
      updateMap();
    }
  }, [userLocation, radius]);

  const initMap = () => {
    if (!ymapsRef.current || mapRef.current) return;

    const map = new ymapsRef.current.Map('yandex-map', {
      center: userLocation,
      zoom: 12,
      controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
    });

    mapRef.current = map;

    // Создаем маркер пользователя (синий)
    const userMarker = new ymapsRef.current.Placemark(userLocation, {
      balloonContent: '<strong>Ваше местоположение</strong><br><small>Перетащите маркер для изменения</small>',
      iconCaption: 'Вы здесь'
    }, {
      preset: 'islands#blueCircleDotIcon',
      draggable: true
    });

    userMarker.events.add('dragend', function (e) {
      const coords = userMarker.geometry.getCoordinates();
      setUserLocation(coords);
      fetchStoresAtLocation(coords);
    });

    map.geoObjects.add(userMarker);
    userMarkerRef.current = userMarker;

    // Создаем круг радиуса
    const circle = new ymapsRef.current.Circle([userLocation, radius * 1000], {}, {
      fillColor: '#0000FF22',
      strokeColor: '#0000FF',
      strokeWidth: 2
    });

    map.geoObjects.add(circle);
    circleRef.current = circle;

    setLoading(false);
    fetchStores();
  };

  const updateMap = () => {
    if (!mapRef.current) return;

    // Обновляем круг радиуса
    if (circleRef.current) {
      mapRef.current.geoObjects.remove(circleRef.current);
    }

    const circle = new ymapsRef.current.Circle([userLocation, radius * 1000], {}, {
      fillColor: '#0000FF22',
      strokeColor: '#0000FF',
      strokeWidth: 2
    });

    mapRef.current.geoObjects.add(circle);
    circleRef.current = circle;

    // Обновляем маркер пользователя
    if (userMarkerRef.current) {
      userMarkerRef.current.geometry.setCoordinates(userLocation);
    }

    mapRef.current.setCenter(userLocation);
  };

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getAll({
        latitude: userLocation[0],
        longitude: userLocation[1],
        radius
      });
      setStores(response.data.data);
      updateStoreMarkers(response.data.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const fetchStoresAtLocation = async (coords) => {
    setLoading(true);
    try {
      const response = await storesAPI.getAll({
        latitude: coords[0],
        longitude: coords[1],
        radius
      });
      setStores(response.data.data);
      updateStoreMarkers(response.data.data);
      console.log(`✓ Найдено ${response.data.data.length} магазинов в радиусе ${radius} км`);
    } catch (err) {
      console.error('Ошибка при обновлении магазинов:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStoreMarkers = (storesData) => {
    if (!mapRef.current || !ymapsRef.current) return;

    // Удаляем старые маркеры магазинов
    storeMarkersRef.current.forEach(marker => {
      mapRef.current.geoObjects.remove(marker);
    });
    storeMarkersRef.current = [];

    // Добавляем новые маркеры магазинов (зеленые)
    storesData.forEach(store => {
      const marker = new ymapsRef.current.Placemark(
        [parseFloat(store.latitude), parseFloat(store.longitude)],
        {
          balloonContent: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
                🏪 <a href="/store/${store.slug}" style="color: #2c5f2d; text-decoration: none;">${store.name}</a>
              </h3>
              <p style="margin: 4px 0; font-size: 14px; color: #666;">${store.address}</p>
              ${store.products ? `<p style="margin: 4px 0; font-size: 14px;">📦 Товаров: ${store.products.length}</p>` : ''}
              ${store.distance ? `<p style="margin: 4px 0; font-size: 14px; color: #2c5f2d; font-weight: bold;">📍 ${store.distance.toFixed(1)} км от вас</p>` : ''}
            </div>
          `,
          iconCaption: store.name
        },
        {
          preset: 'islands#greenDotIcon'
        }
      );

      mapRef.current.geoObjects.add(marker);
      storeMarkersRef.current.push(marker);
    });
  };

  const handleRadiusChange = (e) => {
    setRadius(parseFloat(e.target.value));
  };

  const handleLocationChange = (e) => {
    const [lat, lng] = e.target.value.split(',').map(v => parseFloat(v.trim()));
    if (!isNaN(lat) && !isNaN(lng)) {
      setUserLocation([lat, lng]);
    }
  };

  const handleSearch = () => {
    fetchStores();
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Карта магазинов</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                📍 Координаты (широта, долгота)
              </label>
              <input
                type="text"
                key={userLocation.join(',')}
                defaultValue={`${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}`}
                onBlur={handleLocationChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="46.71, 38.27"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 Перетащите синий маркер на карте для изменения местоположения
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Радиус поиска: {radius} км
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={handleRadiusChange}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary dark:bg-green-600 dark:hover:bg-green-700"
          >
            Найти магазины
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Загрузка карты...</p>
            </div>
          </div>
        )}
        <div id="yandex-map" style={{ height: '100%', width: '100%' }}></div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <p>Найдено магазинов: {stores.length}</p>
      </div>
    </Layout>
  );
};

export default MapPage;
