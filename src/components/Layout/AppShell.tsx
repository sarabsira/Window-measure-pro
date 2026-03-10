import React from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  FileDown,
  Wifi,
  WifiOff,
  Square,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../UI/Button';
import { ToastContainer } from '../UI/Toast';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { projects, activeProjectId } = useProjectStore();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/project/new');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e' && activeProjectId) {
        e.preventDefault();
        navigate(`/project/${activeProjectId}/export`);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, activeProjectId]);

  const activeProject = projects.find((p) => p.id === (params.id || activeProjectId));

  const breadcrumbs = React.useMemo(() => {
    const crumbs = [{ label: 'Dashboard', path: '/' }];
    if (params.id) {
      const project = projects.find((p) => p.id === params.id);
      if (project) {
        crumbs.push({ label: project.projectName, path: `/project/${params.id}` });
      }
    }
    if (params.roomId && params.id) {
      const project = projects.find((p) => p.id === params.id);
      const room = project?.rooms.find((r) => r.id === params.roomId);
      if (room) {
        crumbs.push({ label: room.name, path: `/project/${params.id}/room/${params.roomId}` });
      }
    }
    if (params.windowId && params.id && params.roomId) {
      const project = projects.find((p) => p.id === params.id);
      const room = project?.rooms.find((r) => r.id === params.roomId);
      const window = room?.windows.find((w) => w.id === params.windowId);
      if (window) {
        crumbs.push({ label: window.tag, path: location.pathname });
      }
    }
    return crumbs;
  }, [params, projects, location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
        } bg-[#0F1B2D] flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Square size={16} className="text-[#0F1B2D]" fill="currentColor" />
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold text-lg tracking-tight">MeasurePro</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-teal-400/20 text-teal-400'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          {activeProject && sidebarOpen && (
            <div className="mt-4">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Active Project
              </p>
              <Link
                to={`/project/${activeProject.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronRight size={14} className="text-teal-400" />
                <span className="truncate">{activeProject.projectName}</span>
              </Link>
              {activeProject.rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/project/${activeProject.id}/room/${room.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 ml-4 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span className="truncate">{room.name}</span>
                  <span className="ml-auto text-slate-500">{room.windows.length}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Bottom actions */}
        {sidebarOpen && activeProject && (
          <div className="px-3 py-4 border-t border-white/10">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileDown size={16} />}
              onClick={() => navigate(`/project/${activeProject.id}/export`)}
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Export PDF
            </Button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm flex-1 min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.path}>
                {i > 0 && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-slate-800 truncate">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-slate-400 hover:text-slate-600 transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Status indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              {isOnline ? (
                <>
                  <Wifi size={14} className="text-green-500" />
                  <span className="hidden sm:inline">Saved locally</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-amber-500" />
                  <span className="hidden sm:inline text-amber-600">Offline</span>
                </>
              )}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
