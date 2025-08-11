import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, LogIn, AlertTriangle, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useForm, usePasswordField, useCapsLock } from '../hooks';
import { validators } from '../utils';
import Input from './ui/Input';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const passwordField = usePasswordField();
  const isCapsLockOn = useCapsLock();
  const navigate = useNavigate();

  // Função para navegar adequadamente baseada no estado de autenticação
  const handleNavigation = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const { values, errors, loading, setFieldValue, handleSubmit } = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: ''
    },
    onSubmit: async (formData) => {
      setError('');
      try {
        await login(formData.email, formData.password);
        // Redirecionar para o dashboard após login bem-sucedido
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Erro ao fazer login');
      }
    },
    validate: (values) => {
      const validationErrors: Record<keyof LoginFormData, string> = {} as Record<keyof LoginFormData, string>;
      
      // Validate email
      const emailError = validators.required(values.email, 'Email') || validators.email(values.email);
      if (emailError) validationErrors.email = emailError;
      
      // Validate password
      const passwordError = validators.required(values.password, 'Senha');
      if (passwordError) validationErrors.password = passwordError;

      return Object.keys(validationErrors).length > 0 ? validationErrors : null;
    }
  });

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Botão Voltar - Posicionado acima da caixa de login */}
      <div className="mb-4 text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNavigation}
          className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
          leftIcon={isAuthenticated ? undefined : <Home className="w-4 h-4" />}
        >
          {isAuthenticated ? '← Voltar ao Dashboard' : '← Voltar ao Início'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
          <p className="text-gray-600 mt-2">Faça login para acessar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              aria-live="polite"
              role="alert"
            >
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => setFieldValue('email', e.target.value)}
            placeholder="seu@email.com"
            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            error={errors.email}
            required
          />

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={passwordField.inputType}
                value={values.password}
                onChange={(e) => setFieldValue('password', e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={passwordField.togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={passwordField.showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={passwordField.showPassword}
                    disabled={loading}
                  >
                    {passwordField.showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.password}
                required
              />
            </div>
            
            {/* Aviso de Caps Lock */}
            {isCapsLockOn && (
              <div className="mt-2 flex items-center space-x-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Caps Lock está ativado</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            leftIcon={<LogIn className="w-5 h-5" />}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Esqueceu sua senha?{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={loading}
            >
              Recuperar senha
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 