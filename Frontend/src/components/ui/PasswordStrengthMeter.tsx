import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
  showTips?: boolean;
}

interface StrengthLevel {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  color: string;
  label: string;
  percentage: number;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  showTips = true 
}) => {
  const calculateStrength = (password: string): StrengthLevel => {
    if (!password) {
      return { level: 'weak', color: 'bg-gray-200', label: '', percentage: 0 };
    }

    let score = 0;
    const tips: string[] = [];

    // Comprimento mínimo
    if (password.length >= 8) {
      score += 1;
    } else {
      tips.push('Pelo menos 8 caracteres');
    }

    // Letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      tips.push('Incluir letras minúsculas');
    }

    // Letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      tips.push('Incluir letras maiúsculas');
    }

    // Números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      tips.push('Incluir números');
    }

    // Caracteres especiais
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      tips.push('Incluir caracteres especiais (!@#$%^&*)');
    }

    // Comprimento extra
    if (password.length >= 12) {
      score += 1;
    }

    // Determinar nível de força
    if (score <= 2) {
      return { 
        level: 'weak', 
        color: 'bg-red-500', 
        label: 'Fraca', 
        percentage: Math.min(score * 20, 40) 
      };
    } else if (score <= 4) {
      return { 
        level: 'medium', 
        color: 'bg-yellow-500', 
        label: 'Média', 
        percentage: Math.min(score * 20, 80) 
      };
    } else if (score <= 5) {
      return { 
        level: 'strong', 
        color: 'bg-blue-500', 
        label: 'Forte', 
        percentage: Math.min(score * 20, 100) 
      };
    } else {
      return { 
        level: 'very-strong', 
        color: 'bg-green-500', 
        label: 'Muito Forte', 
        percentage: 100 
      };
    }
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Barra de força */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.level === 'weak' ? 'text-red-600' :
          strength.level === 'medium' ? 'text-yellow-600' :
          strength.level === 'strong' ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {strength.label}
        </span>
      </div>

      {/* Dicas */}
      {showTips && (
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-medium">Dicas para uma senha forte:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {password.length < 8 && <li>Pelo menos 8 caracteres</li>}
            {!/[a-z]/.test(password) && <li>Incluir letras minúsculas</li>}
            {!/[A-Z]/.test(password) && <li>Incluir letras maiúsculas</li>}
            {!/\d/.test(password) && <li>Incluir números</li>}
            {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && <li>Incluir caracteres especiais (!@#$%^&*)</li>}
            {password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) && (
              <li className="text-green-600">✓ Senha atende todos os critérios!</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
