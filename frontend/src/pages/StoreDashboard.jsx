import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storesAPI, productsAPI } from '../services/api';
import Layout from '../components/Layout';

const StoreDashboard = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    originalPrice: '',
    discountPrice: '',
    quantity: 1,
    expiryDate: '',
    photo: null
  });

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const response = await storesAPI.getMy();
      setStore(response.data.data);
    } catch (err) {
      console.error('Error fetching store:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(productForm).forEach(key => {
      if (productForm[key]) {
        formData.append(key, productForm[key]);
      }
    });

    try {
      if (editingProduct) {
        // Обновление существующего товара
        await productsAPI.update(editingProduct.id, formData);
        alert('Товар успешно обновлен!');
        setEditingProduct(null);
      } else {
        // Создание нового товара
        await productsAPI.create(formData);
        alert('Товар успешно добавлен!');
      }
      setShowProductForm(false);
      setProductForm({ name: '', originalPrice: '', discountPrice: '', quantity: 1, expiryDate: '', photo: null });
      fetchStore();
    } catch (err) {
      alert(err.response?.data?.message || `Ошибка при ${editingProduct ? 'обновлении' : 'добавлении'} товара`);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      originalPrice: product.originalPrice,
      discountPrice: product.discountPrice,
      quantity: product.quantity,
      expiryDate: product.expiryDate,
      photo: null
    });
    setShowProductForm(true);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowProductForm(false);
    setProductForm({ name: '', originalPrice: '', discountPrice: '', quantity: 1, expiryDate: '', photo: null });
  };

  const handleMarkAsPickedUp = async (productId) => {
    if (confirm('Пометить товар как забранный?')) {
      try {
        await productsAPI.markAsPickedUp(productId);
        fetchStore();
      } catch (err) {
        alert('Ошибка при обновлении статуса');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Удалить товар?')) {
      try {
        await productsAPI.delete(productId);
        fetchStore();
      } catch (err) {
        alert('Ошибка при удалении');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Загрузка...</div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Создайте ваш магазин</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              У вас еще нет магазина. Создайте профиль магазина, чтобы начать добавлять товары со скидкой.
            </p>
            <Link
              to="/store/settings"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary font-medium"
            >
              Создать магазин
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 dark:text-white">{store.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">{store.address}</p>
            </div>
            <Link
              to="/store/settings"
              className="flex-shrink-0 p-3 rounded-lg bg-primary hover:bg-secondary text-white transition-colors"
              title="Редактировать магазин"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Мои товары</h2>
          <button
            onClick={() => editingProduct ? handleCancelEdit() : setShowProductForm(!showProductForm)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary"
          >
            {showProductForm ? 'Отмена' : '+ Добавить товар'}
          </button>
        </div>

        {showProductForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{editingProduct ? 'Редактирование товара' : 'Новый товар'}</h3>
            <form onSubmit={handleProductSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Название</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Фото</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({...productForm, photo: e.target.files[0]})}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Обычная цена</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Цена со скидкой (мин. -30%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({...productForm, discountPrice: e.target.value})}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Количество</label>
                  <input
                    type="number"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Срок годности</label>
                  <input
                    type="date"
                    value={productForm.expiryDate}
                    onChange={(e) => setProductForm({...productForm, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary"
              >
                {editingProduct ? 'Сохранить' : 'Добавить'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.products?.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {product.photo && (
                <img src={product.photo} alt={product.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg dark:text-white">{product.name}</h3>
                <div className="flex justify-between my-2">
                  <span className="text-gray-500 dark:text-gray-400 line-through">{product.originalPrice} ₽</span>
                  <span className="text-xl font-bold text-primary dark:text-green-400">{product.discountPrice} ₽</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Количество: {product.quantity}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Срок: {product.expiryDate}</p>

                <div className="mt-4 flex gap-2">
                  {product.isAvailable ? (
                    <button
                      onClick={() => handleMarkAsPickedUp(product.id)}
                      className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      Забрали
                    </button>
                  ) : (
                    <span className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm text-center">
                      Забран
                    </span>
                  )}
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Редакт.
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {store.products?.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300">У вас пока нет товаров</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StoreDashboard;
