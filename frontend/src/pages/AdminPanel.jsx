import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import Layout from '../components/Layout';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, storesRes, customersRes] = await Promise.all([
        adminAPI.getStatistics(),
        adminAPI.getAllStores(),
        adminAPI.getAllCustomers()
      ]);

      setStatistics(statsRes.data.data);
      setStores(storesRes.data.data);
      setCustomers(customersRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterStore = (storeId) => {
    navigate(`/store/dashboard?storeId=${storeId}`);
  };

  const handleDeleteStore = async (id) => {
    if (!confirm('Удалить магазин?')) return;

    try {
      await adminAPI.deleteStore(id);
      toast.success('Магазин успешно удален');
      fetchData();
    } catch (err) {
      toast.error('Ошибка при удалении магазина');
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      toast.success('Статус пользователя изменен');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка при изменении статуса');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Загрузка...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Админ-панель</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 ${
              activeTab === 'stats'
                ? 'border-b-2 border-primary dark:border-green-400 text-primary dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Статистика
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 ${
              activeTab === 'stores'
                ? 'border-b-2 border-primary dark:border-green-400 text-primary dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Магазины ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 ${
              activeTab === 'customers'
                ? 'border-b-2 border-primary dark:border-green-400 text-primary dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Покупатели ({customers.length})
          </button>
        </div>

        {/* Statistics Tab */}
        {activeTab === 'stats' && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Всего покупателей</div>
              <div className="text-3xl font-bold text-primary dark:text-green-400">
                {statistics.totalCustomers}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Всего магазинов</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {statistics.totalStores}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Активных товаров</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.totalProducts}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Забрано товаров</div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {statistics.pickedUpProducts}
              </div>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Адрес
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Email владельца
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Телефон
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Товаров
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {stores.map((store) => (
                    <tr key={store.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{store.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{store.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{store.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {store.user?.phoneNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {store.products?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleEnterStore(store.id)}
                          className="text-primary dark:text-green-400 hover:text-secondary dark:hover:text-green-300 text-sm font-medium"
                        >
                          Войти
                        </button>
                        <button
                          onClick={() => handleDeleteStore(store.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stores.length === 0 && (
                <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                  Нет зарегистрированных магазинов
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {stores.map((store) => (
                <div key={store.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{store.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEnterStore(store.id)}
                        className="flex-1 text-primary hover:text-white border border-primary hover:bg-primary text-sm font-medium px-3 py-2 rounded transition-colors"
                      >
                        Войти в магазин
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-2 border border-red-600 rounded hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Адрес:</span>
                      <div className="text-gray-900 dark:text-gray-200">{store.address}</div>
                    </div>

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email владельца:</span>
                      <div className="text-gray-900 dark:text-gray-200">{store.user?.email}</div>
                    </div>

                    {store.user?.phoneNumber && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Телефон:</span>
                        <div className="text-gray-900 dark:text-gray-200">{store.user.phoneNumber}</div>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Товаров:</span>
                      <span className="text-gray-900 dark:text-gray-200 ml-2">{store.products?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}

              {stores.length === 0 && (
                <div className="text-center py-12 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow">
                  Нет зарегистрированных магазинов
                </div>
              )}
            </div>
          </>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Телефон
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Дата регистрации
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {customer.phoneNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            customer.isActive
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {customer.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(customer.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleUserStatus(customer.id)}
                          className="text-primary dark:text-green-400 hover:text-secondary dark:hover:text-green-300 text-sm font-medium"
                        >
                          {customer.isActive ? 'Деактивировать' : 'Активировать'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {customers.length === 0 && (
                <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                  Нет зарегистрированных покупателей
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">{customer.email}</div>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          customer.isActive
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {customer.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    {customer.phoneNumber && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Телефон:</span>
                        <div className="text-gray-900 dark:text-gray-200">{customer.phoneNumber}</div>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Дата регистрации:</span>
                      <div className="text-gray-900 dark:text-gray-200">
                        {new Date(customer.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleUserStatus(customer.id)}
                    className="w-full py-2 px-4 border border-primary dark:border-green-400 text-primary dark:text-green-400 hover:bg-primary dark:hover:bg-green-600 hover:text-white rounded text-sm font-medium transition-colors"
                  >
                    {customer.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                </div>
              ))}

              {customers.length === 0 && (
                <div className="text-center py-12 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow">
                  Нет зарегистрированных покупателей
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;
