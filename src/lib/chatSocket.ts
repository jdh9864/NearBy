// STOMP over SockJS 채팅 클라이언트
// 백엔드: 핸드셰이크 /ws-connect, 구독 /sub/chats/room/{id}, 발행 /pub/chats/room/{id}
import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

// 백엔드 ChatDto.MessageDto
export interface IncomingMessage {
  messageId: number;
  senderId: number;
  senderNickname: string;
  type: string;
  content: string;
  createdAt: string;
}

let client: Client | null = null;
let connectedPromise: Promise<void> | null = null;

function ensureClient(): Client {
  if (!client) {
    client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws-connect`),
      reconnectDelay: 3000,
    });
  }
  return client;
}

// WebSocket 연결 (이미 연결돼 있으면 즉시 resolve)
export function connectChat(): Promise<void> {
  const c = ensureClient();
  if (c.connected) return Promise.resolve();
  if (connectedPromise) return connectedPromise;

  connectedPromise = new Promise((resolve) => {
    c.onConnect = () => resolve();
    c.activate();
  });
  return connectedPromise;
}

// 특정 방 구독. 메시지 도착 시 cb 호출. 반환된 구독은 leave 시 unsubscribe().
export function subscribeRoom(
  roomId: number,
  cb: (msg: IncomingMessage) => void
): StompSubscription {
  return ensureClient().subscribe(`/sub/chats/room/${roomId}`, (frame) => {
    cb(JSON.parse(frame.body) as IncomingMessage);
  });
}

// 메시지 발행. 서버가 구독자(=발신자 포함) 전체에게 다시 broadcast 함.
export function publishMessage(roomId: number, content: string, senderId: number) {
  ensureClient().publish({
    destination: `/pub/chats/room/${roomId}`,
    body: JSON.stringify({ content, type: 'TEXT', senderId }),
  });
}
