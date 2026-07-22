import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-off">
      <Sidebar />
      <main className="ml-64 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto w-full overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
