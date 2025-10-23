import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <a
            href="https://vk.com/yeisk777"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 text-2xl font-bold transition-colors"
          >
            От Подслушано в Ейске
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
