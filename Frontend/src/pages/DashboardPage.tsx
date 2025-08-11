import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequestWithAuth } from '../config/api';
import { FileText, Settings, Users, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  documents: number;
  templates: number;
  users: number;
}

const DashboardPage: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    documents: 0,
    templates: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas do dashboard
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Carregar dados e contar itens
        const [documentsRes, templatesRes, usersRes] = await Promise.all([
          apiRequestWithAuth('/api/documents', {}, refreshAuth),
          apiRequestWithAuth('/api/slide-templates', {}, refreshAuth),
          apiRequestWithAuth('/users', {}, refreshAuth)
        ]);

        if (documentsRes.ok && templatesRes.ok && usersRes.ok) {
          const [documentsData, templatesData, usersData] = await Promise.all([
            documentsRes.json(),
            templatesRes.json(),
            usersRes.json()
          ]);

          setStats({
            documents: Array.isArray(documentsData) ? documentsData.length : 0,
            templates: Array.isArray(templatesData) ? templatesData.length : 0,
            users: Array.isArray(usersData) ? usersData.length : 0
          });
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [refreshAuth]);

  const quickActions = [
    {
      name: 'Documentos',
      description: 'Gerencie seus materiais educacionais',
      href: '/documentos',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Slide Templates',
      description: 'Configure modelos de slides',
      href: '/slide-templates',
      icon: Layers,
      color: 'bg-green-500',
    },
    {
      name: 'Usuários',
      description: 'Gerencie usuários do sistema',
      href: '/usuarios',
      icon: Users,
      color: 'bg-purple-500',
      adminOnly: true,
    },
    {
      name: 'Configurações',
      description: 'Configure o sistema',
      href: '/configuracoes',
      icon: Settings,
      color: 'bg-orange-500',
      adminOnly: true,
    },
  ];

  const filteredActions = quickActions.filter(action => 
    !action.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo de volta, {user?.name}! Aqui você pode gerenciar todo o sistema.
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Documentos</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? 'Carregando...' : stats.documents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Layers className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Templates Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? 'Carregando...' : stats.templates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Usuários</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? 'Carregando...' : stats.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-2xl font-semibold text-green-600">Ativo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Informações do usuário */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Conta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nome</p>
            <p className="text-lg text-gray-900">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Função</p>
            <p className="text-lg text-gray-900 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Ativo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 