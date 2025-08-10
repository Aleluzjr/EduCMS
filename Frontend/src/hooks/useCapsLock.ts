import { useState, useEffect } from 'react';

export function useCapsLock() {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detectar caps lock através da diferença entre keyCode e shiftKey
      if (e.getModifierState) {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      } else {
        // Fallback para navegadores mais antigos
        const isCaps = e.shiftKey && e.keyCode >= 65 && e.keyCode <= 90;
        setIsCapsLockOn(isCaps);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }
    };

    // Adicionar event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return isCapsLockOn;
}
