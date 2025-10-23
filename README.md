# 🍎 Платформа продажи еды со скидкой

Веб-платформа для продажи продуктов близких к окончанию срока годности со скидкой. Аналог "Спаси еду" для одного города.

## 📋 Описание проекта

Сайт представляет из себя ленту с магазинами, в которые может заходить покупатель и смотреть какие товары магазин продает со скидкой. Если у магазина нет выставленных товаров, то он не появляется в ленте.

### Основные возможности

**Для покупателей:**
- 👀 Просмотр ленты товаров со скидкой от всех магазинов
- 🗺️ Карта магазинов с геолокацией и радиусом поиска
- 📍 Регулируемый радиус показа магазинов на карте
- 🔐 Простая регистрация (для подсчета пользователей)

**Для магазинов:**
- 🏪 Создание профиля магазина (название, адрес, фото, часы работы)
- 📦 Добавление товаров со скидкой (фото, цены, срок годности, количество)
- ✅ Автоматическая валидация скидки (минимум 30%)
- 🎯 Кнопка "Забрали" для удаления товара из ленты
- 📊 Управление товарами в личном кабинете

**Для администратора:**
- 👥 Управление зарегистрированными магазинами
- 📈 Статистика покупателей и магазинов
- ✏️ Редактирование/удаление магазинов
- 📞 Просмотр номеров телефонов магазинов

## 🛠️ Технологии

### Backend
- Node.js + Express
- PostgreSQL (с поддержкой геолокации)
- Sequelize ORM
- JWT Authentication
- Multer (загрузка файлов)

### Frontend
- React 18
- React Router
- Zustand (state management)
- TanStack Query
- Tailwind CSS
- Leaflet + OpenStreetMap (карты)
- Axios

## 📦 Установка и запуск

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование репозитория

```bash
cd food-discount-platform
```

### 2. Настройка Backend

```bash
cd backend
npm install
```

Создайте файл `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=food_discount_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./src/uploads

# CORS
CLIENT_URL=http://localhost:3001

# Admin (для первого запуска)
ADMIN_EMAIL=admin@fooddiscount.com
ADMIN_PASSWORD=admin123
```

### 3. Создание базы данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE food_discount_db;

# Выйдите
\q
```

### 4. Запуск Backend

```bash
# Development
npm run dev

# Production
npm start
```

Backend будет доступен на `http://localhost:5000`

### 5. Настройка Frontend

```bash
cd ../frontend
npm install
```

Создайте файл `.env` (опционально):

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Запуск Frontend

```bash
# Development
npm run dev

# Build для production
npm run build

# Preview production build
npm run preview
```

Frontend будет доступен на `http://localhost:3001`

## 🚀 Деплой на VPS/VDS

### Подготовка сервера

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установите PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установите Nginx
sudo apt install -y nginx

# Установите PM2 (для управления процессами)
sudo npm install -g pm2
```

### Настройка PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE food_discount_db;
CREATE USER food_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE food_discount_db TO food_app;
\q
```

### Загрузка проекта на сервер

```bash
# Клонируйте репозиторий
git clone <your-repo-url>
cd food-discount-platform

# Установите зависимости backend
cd backend
npm install --production
cp .env.example .env
nano .env  # Отредактируйте параметры

# Установите зависимости frontend
cd ../frontend
npm install
npm run build
```

### Настройка PM2 для Backend

```bash
cd backend

# Запустите backend через PM2
pm2 start src/server.js --name food-backend

# Настройте автозапуск
pm2 startup
pm2 save

# Просмотр логов
pm2 logs food-backend
```

### Настройка Nginx

Создайте конфигурацию Nginx:

```bash
sudo nano /etc/nginx/sites-available/food-discount
```

Добавьте:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/food-discount-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/food-discount /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL (HTTPS) с Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📚 API Документация

### Аутентификация

```
POST /api/auth/register - Регистрация
POST /api/auth/login - Вход
GET /api/auth/me - Получить текущего пользователя
```

### Магазины

```
GET /api/stores - Получить все магазины с товарами
GET /api/stores/:id - Получить магазин по ID
POST /api/stores - Создать магазин (только для store)
PUT /api/stores - Обновить магазин (только для store)
DELETE /api/stores - Удалить магазин (только для store)
GET /api/stores/my/store - Получить свой магазин (только для store)
```

### Товары

```
GET /api/products - Получить все товары
GET /api/products/:id - Получить товар по ID
POST /api/products - Создать товар (только для store)
PUT /api/products/:id - Обновить товар (только для store)
PATCH /api/products/:id/picked-up - Пометить как забранный (только для store)
DELETE /api/products/:id - Удалить товар (только для store)
```

### Админ-панель

```
GET /api/admin/statistics - Статистика
GET /api/admin/stores - Все магазины для админа
PUT /api/admin/stores/:id - Обновить магазин
DELETE /api/admin/stores/:id - Удалить магазин
GET /api/admin/customers - Все покупатели
PATCH /api/admin/users/:id/toggle-status - Переключить статус пользователя
```

## 🔐 Безопасность

- JWT токены с истечением срока действия
- Хеширование паролей с bcrypt
- Валидация данных на backend
- CORS защита
- Ограничение размера загружаемых файлов
- SQL injection защита через ORM

## 📁 Структура проекта

```
food-discount-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Конфигурация БД
│   │   ├── controllers/     # Контроллеры API
│   │   ├── middleware/      # Middleware (auth, upload)
│   │   ├── models/          # Модели Sequelize
│   │   ├── routes/          # Роуты API
│   │   ├── utils/           # Утилиты (JWT, geo)
│   │   ├── uploads/         # Загруженные файлы
│   │   └── server.js        # Точка входа
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── assets/          # CSS, изображения
    │   ├── components/      # React компоненты
    │   ├── pages/           # Страницы
    │   ├── services/        # API сервисы
    │   ├── store/           # Zustand store
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## 🎨 Дизайн

- Адаптивный дизайн (mobile, tablet, desktop)
- Современный UI с Tailwind CSS
- Зеленая цветовая палитра (эко-тема)
- Интуитивный UX

## 🔮 Будущие возможности

- ✅ Платная подписка для магазинов (уже предусмотрена в архитектуре БД)
- 📧 Email уведомления
- 📱 Мобильное приложение
- 💳 Система оплаты
- 🔔 Push-уведомления о новых товарах
- 📊 Расширенная аналитика
- ⭐ Рейтинг магазинов
- 💬 Чат с магазином

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs food-backend`
2. Проверьте подключение к БД
3. Убедитесь, что все зависимости установлены
4. Проверьте конфигурацию .env файлов

## 📄 Лицензия

MIT License

---

**Разработано для проекта "Спаси Еду"**
Версия: 1.0.0
Дата: 2025-10-21
