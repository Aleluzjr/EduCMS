import { toast, ToastOptions } from 'react-toastify';

// Configuração padrão para os toasts
const defaultConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Hook personalizado para notificações
export const useToast = () => {
  const success = (message: string, config?: ToastOptions) => {
    toast.success(message, { ...defaultConfig, ...config });
  };

  const error = (message: string, config?: ToastOptions) => {
    toast.error(message, { ...defaultConfig, ...config });
  };

  const warning = (message: string, config?: ToastOptions) => {
    toast.warning(message, { ...defaultConfig, ...config });
  };

  const info = (message: string, config?: ToastOptions) => {
    toast.info(message, { ...defaultConfig, ...config });
  };

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };
}; 