import { io, type Socket } from "socket.io-client";
import { WS_URL } from "./constants";

let mailSocket: Socket | null = null;

export function getMailSocket(token: string): Socket {
  if (mailSocket?.connected) {
    mailSocket.auth = { token };
    return mailSocket;
  }

  if (mailSocket) {
    mailSocket.disconnect();
    mailSocket = null;
  }

  mailSocket = io(`${WS_URL}/mail`, {
    auth: { token },
    autoConnect: true,
    withCredentials: true,
  });

  return mailSocket;
}

export function disconnectMailSocket(): void {
  mailSocket?.disconnect();
  mailSocket = null;
}
