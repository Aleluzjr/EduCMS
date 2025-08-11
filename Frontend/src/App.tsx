import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loading das páginas
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const DocumentosPage = React.lazy(() => import('./pages/DocumentosPage'));
const SlideTemplatesPage = React.lazy(() => import('./pages/SlideTemplatesPage'));
const UsuariosPage = React.lazy(() => import('./pages/UsuariosPage'));
const Layout = React.lazy(() => import('./components/Layout'));

// Componente de fallback para páginas
const PageFallback = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rota pública - Landing Page */}
      <Route 
        path="/" 
        element={
          <Suspense fallback={<PageFallback message="Carregando página inicial..." />}>
            <LandingPage />
          </Suspense>
        } 
      />

      {/* Rota de login */}
      <Route 
        path="/login" 
        element={
          <Suspense fallback={<PageFallback message="Carregando página de login..." />}>
            <LoginPage />
          </Suspense>
        } 
      />

      {/* Rotas protegidas - apenas para usuários autenticados */}
      {isAuthenticated ? (
        <Route path="/dashboard" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
      ) : (
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      )}

      {isAuthenticated ? (
        <Route path="/documentos" element={
          <Layout>
            <DocumentosPage />
          </Layout>
        } />
      ) : (
        <Route path="/documentos" element={<Navigate to="/login" replace />} />
      )}

      {isAuthenticated ? (
        <Route path="/documentos/:id" element={
          <Layout>
            <DocumentosPage />
          </Layout>
        } />
      ) : (
        <Route path="/documentos/:id" element={<Navigate to="/login" replace />} />
      )}

      {isAuthenticated ? (
        <Route path="/documentos/:id/editar" element={
          <Layout>
            <DocumentosPage />
          </Layout>
        } />
      ) : (
        <Route path="/documentos/:id/editar" element={<Navigate to="/login" replace />} />
      )}

      {isAuthenticated ? (
        <Route path="/slide-templates" element={
          <Layout>
            <SlideTemplatesPage />
          </Layout>
        } />
      ) : (
        <Route path="/slide-templates" element={<Navigate to="/login" replace />} />
      )}

      {isAuthenticated ? (
        <Route path="/usuarios" element={
          <Layout>
            <UsuariosPage />
          </Layout>
        } />
      ) : (
        <Route path="/usuarios" element={<Navigate to="/login" replace />} />
      )}

      {/* Redirecionar rotas não encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <>
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
    </>
  );
}

export default App;