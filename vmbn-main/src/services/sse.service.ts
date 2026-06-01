import { Response } from 'express';

class SSEService {
  private clients: Map<string, Response>;

  constructor() {
    this.clients = new Map();
  }

  initConnection(userId: string, res: Response) {
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const initialMessage = 'data: {"type": "connected", "message": "SSE Connected"}\n\n';
    res.write(initialMessage);

    this.clients.set(userId, res);
    console.log('Client added to map, total clients:', this.clients.size);

    const pingInterval = setInterval(() => {
      const pingMessage = 'data: {"type": "ping"}\n\n';
      res.write(pingMessage);
    }, 30000);

    res.on('close', () => {
      clearInterval(pingInterval);
      this.clients.delete(userId);
      console.log('Remaining clients:', this.clients.size);
    });
  }

  sendMessage(userId: string, message: any) {
    console.log('Attempting to send message to user:', userId, message);
    const client = this.clients.get(userId);
    if (client) {
      const messageStr = `data: ${JSON.stringify(message)}\n\n`;
      client.write(messageStr);
    } else {
      console.log('Client not found for user:', userId);
    }
  }

  broadcastMessage(userIds: string[], message: any) {
    userIds.forEach(userId => {
      this.sendMessage(userId, message);
    });
  }
}

export const sseService = new SSEService(); 