import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, UserPlus, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../config/api';
import { useForm, usePasswordField, useCapsLock } from '../hooks';
import { validators } from '../utils';
import Input from './ui/Input';
import Button from './ui/Button';
import PasswordStrengthMeter from './ui/PasswordStrengthMeter';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [success, setSuccess] = useState('');
  const passwordField = usePasswordField();
  const confirmPasswordField = usePasswordField();
  const isCapsLockOn = useCapsLock();

  const { values, errors, loading, setFieldValue, handleSubmit } = useForm<RegisterFormData>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    onSubmit: async (formData) => {
      setSuccess('');
      try {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });

        if (response.ok) {
          setSuccess('Conta criada com sucesso! Faça login para continuar.');
          setTimeout(() => {
            onSwitchToLogin();
          }, 2000);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao criar conta');
        }
      } catch (err: any) {
        throw err;
      }
    },
    validate: (values) => {
      const validationErrors: Record<keyof RegisterFormData, string> = {} as Record<keyof RegisterFormData, string>;
      
      // Validate name
      const nameError = validators.required(values.name, 'Nome');
      if (nameError) validationErrors.name = nameError;
      
      // Validate email
      const emailError = validators.required(values.email, 'Email') || validators.email(values.email);
      if (emailError) validationErrors.email = emailError;
      
      // Validate password
      const passwordError = validators.required(values.password, 'Senha') || validators.strongPassword(values.password);
      if (passwordError) validationErrors.password = passwordError;
      
      // Validate confirmPassword
      const confirmPasswordError = validators.required(values.confirmPassword, 'Confirmar senha') || 
        validators.passwordMatch(values.password, values.confirmPassword);
      if (confirmPasswordError) validationErrors.confirmPassword = confirmPasswordError;

      return Object.keys(validationErrors).length > 0 ? validationErrors : null;
    }
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
          <p className="text-gray-600 mt-2">Preencha os dados para se registrar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div 
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
              aria-live="polite"
              role="status"
            >
              {success}
            </div>
          )}

          <Input
            label="Nome completo"
            type="text"
            value={values.name}
            onChange={(e) => setFieldValue('name', e.target.value)}
            placeholder="Seu nome completo"
            leftIcon={<User className="h-5 w-5 text-gray-400" />}
            error={errors.name}
            required
          />

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
            
            {/* Medidor de força de senha */}
            <PasswordStrengthMeter password={values.password} />
            
            {/* Aviso de Caps Lock */}
            {isCapsLockOn && (
              <div className="mt-2 flex items-center space-x-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Caps Lock está ativado</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar senha
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={confirmPasswordField.inputType}
                value={values.confirmPassword}
                onChange={(e) => setFieldValue('confirmPassword', e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={confirmPasswordField.togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={confirmPasswordField.showPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                    aria-pressed={confirmPasswordField.showPassword}
                    disabled={loading}
                  >
                    {confirmPasswordField.showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.confirmPassword}
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
            variant="success"
            size="lg"
            loading={loading}
            leftIcon={<UserPlus className="w-5 h-5" />}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={loading}
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 