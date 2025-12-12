import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle2 size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
};

const colors = {
    success: 'bg-success/90 border-green-300 text-white',
    error: 'bg-error/90 border-red-300 text-white',
    info: 'bg-woopi-blue/90 border-blue-300 text-white',
};


const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div className={`flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-md w-full max-w-sm animate-toast-in ${colors[toast.type]}`}>
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
       <button onClick={() => onDismiss(toast.id)} className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-black/20 transition-colors">
            <X size={16} />
        </button>
    </div>
  );
};

export default Toast;