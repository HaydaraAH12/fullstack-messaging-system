import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Public } from '../auth/public.decorator';
import { extractWsJwtFromHandshake } from './ws-handshake-token';


@Public()
@WebSocketGateway({
  namespace: '/mail',
  cors: { origin: true, credentials: true },
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  static inboxRoom(userId: string): string {
    return `inbox:${userId}`;
  }

  handleConnection(client: Socket) {
    const token = extractWsJwtFromHandshake(client);
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      const userId = payload.sub;
      client.data.userId = userId;
      void client.join(MessagesGateway.inboxRoom(userId));
    } catch {
      client.disconnect();
    }
  }

  emitInboxNew(userId: string, row: Record<string, unknown>): void {
    this.server.to(MessagesGateway.inboxRoom(userId)).emit('inbox:new', {
      ok: true,
      data: row,
    });
  }
}
