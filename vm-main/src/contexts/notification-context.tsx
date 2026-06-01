'use client';

import SSENotification from '@/components/SseNotification';
import React, { createContext, useContext, useCallback } from 'react';

export type SSENotificationData = {
    type: string,
    data?: {
        title: string,
        message: string,
        timestamp: Date
    }
}

type NotificationCallback = (data: SSENotificationData) => void;

interface NotificationContextInterface {
    onNotification: (callback: NotificationCallback) => void;
    handleNotification: (data: SSENotificationData) => void;
}

const NotificationContext = createContext<NotificationContextInterface | null>(null);

interface NotificationWrapperProps {
    children: React.ReactNode;
}

export function NotificationWrapper({ children }: NotificationWrapperProps) {
    const [callback, setCallback] = React.useState<NotificationCallback | null>(null);

    const onNotification = useCallback((newCallback: NotificationCallback) => {
        setCallback(() => newCallback);
    }, []);

    const handleNotification = useCallback((data: SSENotificationData) => {
        if (data.type === 'notification') {
            if (callback && data.data) {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in notification callback:', error);
                }
            }
        } else {
            console.log('notification:', data.type);
        }
    }, [callback]);

    return (
        <NotificationContext.Provider value={{ onNotification, handleNotification }}>
            <SSENotification onNotification={handleNotification} />
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext)!;
}

export default NotificationContext; 