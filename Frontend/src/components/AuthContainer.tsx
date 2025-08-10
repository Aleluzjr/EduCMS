import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthContainer: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <div>
            <LoginForm />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  onClick={switchToRegister}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </div>
        ) : (
          <RegisterForm onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
};

export default AuthContainer; 