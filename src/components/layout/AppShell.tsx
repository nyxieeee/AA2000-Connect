import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebarStore } from '../../stores/sidebarStore';
import { cn } from '../../utils/cn';

export const AppShell: React.FC = () => {
  const { collapsed } = useSidebarStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-off">
      <Sidebar />
      <main 
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Navbar />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.15 } }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
