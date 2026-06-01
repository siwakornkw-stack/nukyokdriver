import { useEffect, useRef } from 'react';
import type { SSENotificationData } from '@/contexts/notification-context';
import { getDomain } from '../../helpers/helper';
import Cookies from 'js-cookie';

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

interface SSENotificationProps {
    onNotification: (data: SSENotificationData) => void;
}

function SSENotification({ onNotification }: SSENotificationProps): null {
    const eventSourceRef = useRef<EventSource>();

    useEffect(() => {
        const connectSSE = (): void => {
            const domain = getDomain();
            if (!domain) return;
            const accessToken = Cookies.get('access_token');
            if (!accessToken) return;
            eventSourceRef.current = new EventSource(`${urlApi}/sse/connect?domain=${domain}&token=${accessToken}`);

            eventSourceRef.current.onmessage = (event: MessageEvent<string>) => {
                const data = JSON.parse(event.data) as SSENotificationData;
                console.log('SSEdata', data);
                onNotification(data);
            };

            eventSourceRef.current.onerror = (error) => {
                console.error('SSE Error:', error);
                setTimeout(connectSSE, 5000);
            };
        };

        connectSSE();
        return () => {
            eventSourceRef.current?.close();
        };
    }, [onNotification]);

    return null;
}

export default SSENotification;