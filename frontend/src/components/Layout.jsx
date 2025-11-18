import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <h3 className="text-gray-700 dark:text-gray-300 font-semibold text-lg">ПОДДЕРЖКА</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/Goodspeak7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                title="Написать в Telegram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span>@Goodspeak7</span>
              </a>
              <span className="text-gray-400">|</span>
              <a
                href="mailto:spasiedu@mail.ru"
                className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                title="Написать на Email"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>spasiedu@mail.ru</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
