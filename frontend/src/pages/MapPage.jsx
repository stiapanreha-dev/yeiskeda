import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { storesAPI } from '../services/api';
import Layout from '../components/Layout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons for different marker types
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

const MapPage = () => {
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState([46.71, 38.27]); // Yeisk coordinates
  const [radius, setRadius] = useState(5); // km
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }

    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getAll({
        latitude: userLocation[0],
        longitude: userLocation[1],
        radius
      });
      setStores(response.data.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
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

  const handleMarkerDragEnd = async (event) => {
    const marker = event.target;
    const position = marker.getLatLng();
    const newLocation = [position.lat, position.lng];
    setUserLocation(newLocation);

    // Автоматически обновляем список магазинов в новом радиусе
    setLoading(true);
    try {
      const response = await storesAPI.getAll({
        latitude: position.lat,
        longitude: position.lng,
        radius
      });
      setStores(response.data.data);
      console.log(`✓ Обновлено: найдено ${response.data.data.length} магазинов в радиусе ${radius} км`);
    } catch (err) {
      console.error('Ошибка при обновлении магазинов:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Карта магазинов</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                📍 Координаты (широта, долгота)
              </label>
              <input
                type="text"
                key={userLocation.join(',')}
                defaultValue={`${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}`}
                onBlur={handleLocationChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="46.71, 38.27"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Перетащите синий маркер на карте для изменения местоположения
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
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
            onClick={fetchStores}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary"
          >
            Найти магазины
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        {!loading && (
          <MapContainer
            center={userLocation}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeView center={userLocation} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location marker - draggable with custom icon */}
            <Marker
              position={userLocation}
              icon={userIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd
              }}
            >
              <Popup>
                <div>
                  <strong>Ваше местоположение</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    📍 Перетащите маркер для изменения
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Search radius circle */}
            <Circle
              center={userLocation}
              radius={radius * 1000}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />

            {/* Store markers with green icons */}
            {stores.map((store) => (
              <Marker
                key={store.id}
                position={[parseFloat(store.latitude), parseFloat(store.longitude)]}
                icon={storeIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg">
                      🏪 <a href={`/store/${store.slug}`} className="text-primary hover:underline">{store.name}</a>
                    </h3>
                    <p className="text-sm text-gray-600">{store.address}</p>
                    {store.products && (
                      <p className="text-sm mt-2">
                        📦 Товаров: {store.products.length}
                      </p>
                    )}
                    {store.distance && (
                      <p className="text-sm text-primary font-semibold">
                        📍 {store.distance.toFixed(1)} км от вас
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Найдено магазинов: {stores.length}</p>
      </div>
    </Layout>
  );
};

export default MapPage;
