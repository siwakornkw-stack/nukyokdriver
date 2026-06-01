export interface LineWebhookEvent {
    destination: string;
    events: Event[];
}

interface Event {
    type: string;
    message?: Message;
    postback?: Postback;
    webhookEventId: string;
    deliveryContext: DeliveryContext;
    timestamp: number;
    source: Source;
    replyToken?: string;
    mode: string;
}

interface Postback {
    data: string;
    params?: Record<string, string>;
}

interface Message {
    type: string;
    id: string;
    quoteToken: string;
    text: string;
}

interface DeliveryContext {
    isRedelivery: boolean;
}

interface Source {
    type: string;
    userId: string;
}