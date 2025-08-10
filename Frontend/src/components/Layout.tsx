import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  FileText, 
  Settings, 
  Users, 
  LogOut, 
  User,
  Home,
  Layers
} from 'lucide-react';
import Button from './ui/Button';
import Tag from './ui/Tag';
import { NavigationItem } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Documentos', href: '/documentos', icon: FileText },
    { name: 'Slide Templates', href: '/slide-templates', icon: Layers , adminOnly: true},
    { name: 'Usuários', href: '/usuarios', icon: Users, adminOnly: true },
    { name: 'Configurações', href: '/configuracoes', icon: Settings, adminOnly: true },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.role === 'ADMIN'
  );

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'EDITOR': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para mobile */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">EduCMS</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4" role="navigation" aria-label="Navegação principal">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-semibold text-gray-900">EduCMS</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4" role="navigation" aria-label="Navegação principal">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b" role="banner">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <Tag variant={getRoleVariant(user?.role || '')} size="sm">
                  {user?.role}
                </Tag>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="py-6" role="main">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 