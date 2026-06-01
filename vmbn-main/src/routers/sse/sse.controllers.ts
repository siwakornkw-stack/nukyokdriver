import { Request, Response } from 'express';
import { sseService } from '../../services/sse.service';
import { ParsedToken } from '../../typings/token';
import { IGetUserAuthInfoRequest } from '../../typings/express';

export async function connectSSE(req: IGetUserAuthInfoRequest, res: Response) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
        
    const userId = parsedToken.customerId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: 'Unauthorized'
      });
    }

    sseService.initConnection(userId, res);
  } catch (error) {
    console.error('SSE connection error:', error);
    res.status(500).json({
        success: false,
        code: 500,
        message: error ?? 'Internal server error'
      });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { userId, message } = req.body;
    
    sseService.sendMessage(userId, {
      type: 'message',
      data: message
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 