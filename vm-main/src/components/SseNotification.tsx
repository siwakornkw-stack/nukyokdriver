import { useEffect } from 'react';
import type { SSENotificationData } from '@/contexts/notification-context';
import { getDomain } from '../../helpers/helper';
import Cookies from 'js-cookie';

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';
const POLL_INTERVAL = 60000;

interface SSENotificationProps {
    onNotification: (data: SSENotificationData) => void;
}

function SSENotification({ onNotification }: SSENotificationProps): null {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let stopped = false;

        const poll = async (): Promise<void> => {
            const domain = getDomain();
            const accessToken = Cookies.get('access_token');
            if (domain && accessToken) {
                try {
                    const res = await fetch(`${urlApi}/notification`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'x-domain': domain,
                        },
                    });
                    if (res.ok) {
                        const body = (await res.json()) as { data?: SSENotificationData[] };
                        body.data?.forEach((item) => onNotification(item));
                    }
                } catch (error) {
                    console.error('Notification poll error:', error);
                }
            }
            if (!stopped) timer = setTimeout(poll, POLL_INTERVAL);
        };

        poll();
        return () => {
            stopped = true;
            clearTimeout(timer);
        };
    }, [onNotification]);

    return null;
}

export default SSENotification;
