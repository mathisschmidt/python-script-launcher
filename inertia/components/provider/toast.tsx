import React, {useState, createContext, useContext} from "react";
import {AlertTriangle, CheckCircle, X, XCircle} from "lucide-react";

type ToastInfo = {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {

    const id = Date.now();
    const toast = { id, type, title, message };
    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${
          toast.type === 'success' ? 'bg-green-50' :
            toast.type === 'error' ? 'bg-red-50' :
              toast.type === 'info' ? 'bg-blue-50' :
                'bg-yellow-50'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toast.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-400" /> :
                toast.type === 'error' ? <XCircle className="h-6 w-6 text-red-400" /> :
                  toast.type === 'info' ? <AlertTriangle className="h-6 w-6 text-blue-400" /> :
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${
                toast.type === 'success' ? 'text-green-900' :
                  toast.type === 'error' ? 'text-red-900' :
                    toast.type === 'info' ? 'text-blue-900' :
                      'text-yellow-900'
              }`}>
                {toast.title}
              </p>
              <p className={`mt-1 text-sm ${
                toast.type === 'success' ? 'text-green-700' :
                  toast.type === 'error' ? 'text-red-700' :
                    toast.type === 'info' ? 'text-blue-700' :
                      'text-yellow-700'
              }`}>
                {toast.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => removeToast(toast.id)}
                className={`inline-flex rounded-md focus:outline-none focus:ring-2 ${
                  toast.type === 'success' ? 'text-green-400 hover:text-green-500 focus:ring-green-600' :
                    toast.type === 'error' ? 'text-red-400 hover:text-red-500 focus:ring-red-600' :
                      toast.type === 'info' ? 'text-blue-400 hover:text-blue-500 focus:ring-blue-600' :
                        'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-600'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
    </ToastContext.Provider>
  )
}


// ToastContext
type ToastContextType = {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast have to be used within a ToastProvider');
  }
  return context;
};






