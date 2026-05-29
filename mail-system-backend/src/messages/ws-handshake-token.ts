import { Socket } from 'socket.io';

export function extractWsJwtFromHandshake(client: Socket): string | undefined {
  const auth = client.handshake.auth as { token?: string } | undefined;
  if (auth?.token && typeof auth.token === 'string') {
    return auth.token;
  }
  const header = client.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  const q = client.handshake.query.token;
  if (typeof q === 'string') return q;
  if (Array.isArray(q) && typeof q[0] === 'string') return q[0];
  return undefined;
}
