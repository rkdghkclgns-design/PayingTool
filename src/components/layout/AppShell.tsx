import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUiStore } from '../../stores/ui-store';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell() {
  const isDarkMode = useUiStore((s) => s.isDarkMode);

  // Apply dark class to html element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
