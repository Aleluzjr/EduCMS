import { AuthBroadcastMessage } from './types';

export class AuthBroadcaster {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('auth');
    }
  }

  send(type: 'login' | 'refresh' | 'logout', data?: any): void {
    if (this.channel) {
      const message: AuthBroadcastMessage = {
        type,
        timestamp: Date.now(),
        data
      };
      this.channel.postMessage(message);
    }
  }

  onMessage(callback: (message: AuthBroadcastMessage) => void): void {
    if (this.channel) {
      this.channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
        const { type, timestamp, data } = event.data;
        
        // Ignorar mensagens antigas (mais de 5 segundos)
        if (Date.now() - timestamp > 5000) {
          return;
        }

        callback({ type, timestamp, data });
      };
    }
  }

  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
