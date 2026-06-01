import { toast, ToastOptions, Bounce } from 'react-toastify';
import React from 'react';

const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,    
    rtl: false,
    pauseOnFocusLoss: true,
    theme: "light",
    transition: Bounce,
    style: { zIndex: 99999 },
  };

const createToastContent = (title: string, message: string) => {
  return React.createElement('div', {}, 
    React.createElement('strong', {}, title),
    React.createElement('br'),
    React.createElement('span', {}, message)
  );
};

export const CustomToast = {
  error: (title: string, message: string, options?: ToastOptions) => {
    toast.error(createToastContent(title, message), { ...defaultOptions, ...options });
  },
  success: (title: string, message: string, options?: ToastOptions) => {
    toast.success(createToastContent(title, message), { ...defaultOptions, ...options });
  },
  info: (title: string, message: string, options?: ToastOptions) => {
    toast.info(createToastContent(title, message), { ...defaultOptions, ...options });
  },
  warning: (title: string, message: string, options?: ToastOptions) => {
    toast.warning(createToastContent(title, message), { ...defaultOptions, ...options });
  },
  default: (title: string, message: string, options?: ToastOptions) => {
    toast(createToastContent(title, message), { ...defaultOptions, ...options });
  }
};