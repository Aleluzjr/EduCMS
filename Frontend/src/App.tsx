import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';

// Code-splitting por rota - carregamento lazy das páginas
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const DocumentosPage = React.lazy(() => import('./pages/DocumentosPage'));
const SlideTemplatesPage = React.lazy(() => import('./pages/SlideTemplatesPage'));
const UsuariosPage = React.lazy(() => import('./pages/UsuariosPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));

// Componente de fallback para carregamento lazy das páginas
const PageFallback = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated } = useAuth();

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageFallback message="Carregando página de login..." />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={<PageFallback message="Carregando dashboard..." />}>
              <DashboardPage />
            </Suspense>
          } 
        />
        <Route 
          path="/documentos" 
          element={
            <Suspense fallback={<PageFallback message="Carregando documentos..." />}>
              <DocumentosPage />
            </Suspense>
          } 
        />
        <Route 
          path="/documentos/:id" 
          element={
            <Suspense fallback={<PageFallback message="Carregando documento..." />}>
              <DocumentosPage />
            </Suspense>
          } 
        />
        <Route 
          path="/documentos/:id/editar" 
          element={
            <Suspense fallback={<PageFallback message="Carregando editor..." />}>
              <DocumentosPage />
            </Suspense>
          } 
        />
        <Route 
          path="/slide-templates" 
          element={
            <Suspense fallback={<PageFallback message="Carregando templates..." />}>
              <SlideTemplatesPage />
            </Suspense>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <Suspense fallback={<PageFallback message="Carregando usuários..." />}>
              <UsuariosPage />
            </Suspense>
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
        toastStyle={{ zIndex: 99999 }}
      />
    </ToastProvider>
  );
}

export default App;