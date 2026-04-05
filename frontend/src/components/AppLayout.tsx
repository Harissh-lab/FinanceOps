import { BarChart3, FileClock, FileText, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reports', label: 'Reports', icon: FileClock, roles: ['ANALYST', 'ADMIN'] },
  { to: '/records', label: 'Records', icon: FileText, roles: ['ANALYST', 'ADMIN'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['ANALYST', 'ADMIN'] },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="grid min-h-screen w-full gap-3 p-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:p-4">
        <aside className="rounded-3xl border border-border bg-card p-4 shadow-panel lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <h1 className="font-display text-xl font-bold">FinanceOps</h1>
          <p className="mt-1 text-xs text-muted-foreground">Data Processing Console</p>

          <nav className="mt-6 space-y-1">
            {navItems
              .filter((item) => {
                if (item.adminOnly && user?.role !== 'ADMIN') {
                  return false;
                }
                if (item.roles && (!user || !item.roles.includes(user.role))) {
                  return false;
                }
                return true;
              })
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                      )
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
          </nav>
        </aside>

        <main className="min-h-[70vh] rounded-3xl border border-border bg-card p-4 shadow-panel md:p-6 lg:min-h-[calc(100vh-2rem)]">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="font-display text-lg font-bold">Welcome back, {user?.name}</p>
              <Badge>{user?.role}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
              >
                <LogOut size={16} className="mr-1" />
                Logout
              </Button>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
