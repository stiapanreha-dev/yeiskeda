import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MapPage from './pages/MapPage';
import StoreView from './pages/StoreView';
import StoreDashboard from './pages/StoreDashboard';
import StoreSettings from './pages/StoreSettings';
import AdminPanel from './pages/AdminPanel';

// Components
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/store/:slug" element={<StoreView />} />

          {/* Store routes */}
          <Route
            path="/store/dashboard"
            element={
              <ProtectedRoute allowedRoles={['store']}>
                <StoreDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store/settings"
            element={
              <ProtectedRoute allowedRoles={['store']}>
                <StoreSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Страница не найдена</p>
                  <a href="/" className="text-primary hover:underline mt-4 inline-block">
                    Вернуться на главную
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
