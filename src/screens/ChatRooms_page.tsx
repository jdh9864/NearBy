import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { StompSubscription } from '@stomp/stompjs';
import api from '../lib/api';
import { useUserStore } from '../store/use_user';
import { getUserIdFromToken } from '../lib/jwt';
import {
  connectChat,
  subscribeRoom,
  publishMessage,
  type IncomingMessage,
} from '../lib/chatSocket';

// ==========================================
// API 타입 정의 (백엔드 ChatDto 기준)
// ==========================================
export interface TargetUser {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
}

// 백엔드 ChatDto.ChatRoomListResponse
export interface ChatroomItem {
  chatRoomId: number;
  type: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  regionName?: string | null;
  targetUser?: TargetUser | null; // PERSONAL 타입일 때만 존재
}

// 시연용 동네(REGION) 코드. 인하대=인천 미추홀구 용현동 법정동코드.
// dummy_data.sql 에 이 코드로 REGION 방이 시드돼 있어야 입장 가능.
const REGION_CODE = import.meta.env.VITE_REGION_CODE ?? '2817710200';

export default function ChatRoomPage() {
  const accessToken = useUserStore((s) => s.accessToken);
  const myUserId = useMemo(() => getUserIdFromToken(accessToken), [accessToken]);

  const [rooms, setRooms] = useState<ChatroomItem[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, IncomingMessage[]>>({});
  const [inputText, setInputText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  // 스크롤 맨 아래로
  useEffect(() => {
    if (activeRoomId !== null) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRoomId]);

  // 1. 마운트 시: 동네방 자동 입장 -> 방 목록 로드 -> WebSocket 연결
  useEffect(() => {
    const init = async () => {
      try {
        // 동네 채팅방 입장(이미 멤버면 그대로). 멤버여야 메시지 전송 가능.
        await api.post('/api/chats/enter', { regionCode: REGION_CODE });
      } catch (error) {
        console.error('동네 채팅방 입장 실패:', error);
      }

      try {
        // 백엔드: GET /api/chats -> List<ChatRoomListResponse>
        const response = await api.get('/api/chats');
        const roomData = Array.isArray(response.data) ? response.data : response.data.content || [];
        setRooms(roomData);
      } catch (error) {
        console.error('채팅방 목록을 불러오는데 실패했습니다.', error);
      }

      // WebSocket 연결 미리 준비
      connectChat().catch((e) => console.error('채팅 서버 연결 실패:', e));
    };
    init();

    // 언마운트 시 현재 구독 해제
    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, []);

  // 2. 채팅방 클릭 -> WebSocket 구독 (히스토리 REST 없음: 라이브 메시지만)
  const handleRoomClick = async (roomId: number) => {
    setActiveRoomId(roomId);

    setRooms((prev) =>
      prev.map((room) => (room.chatRoomId === roomId ? { ...room, unreadCount: 0 } : room))
    );

    // 과거 메시지(히스토리) 먼저 로드 -> 그 위에 라이브 메시지 누적
    try {
      const res = await api.get(`/api/chats/${roomId}/messages`);
      const history: IncomingMessage[] = Array.isArray(res.data)
        ? res.data
        : res.data.content || [];
      setMessages((prev) => ({ ...prev, [roomId]: history }));
    } catch (error) {
      console.error('메시지 기록을 불러오는데 실패했습니다.', error);
    }

    try {
      await connectChat();
      // 이전 방 구독 해제 후 새 방 구독
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = subscribeRoom(roomId, (msg) => {
        setMessages((prev) => {
          const list = prev[roomId] || [];
          // 내가 보낸 echo면, 같은 내용의 임시 메시지(음수 id)를 실제 메시지로 교체
          if (msg.senderId === myUserId) {
            const idx = list.findIndex(
              (m) => m.messageId < 0 && m.senderId === msg.senderId && m.content === msg.content
            );
            if (idx !== -1) {
              const next = [...list];
              next[idx] = msg;
              return { ...prev, [roomId]: next };
            }
          }
          return { ...prev, [roomId]: [...list, msg] };
        });
      });
    } catch (error) {
      console.error('채팅방 연결에 실패했습니다.', error);
    }
  };

  // 채팅방 나가기 (목록으로) -> 구독 해제
  const leaveRoom = () => {
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;
    setActiveRoomId(null);
  };

  // 3. 메시지 전송 (STOMP 발행) + 낙관적 업데이트(내 메시지 즉시 표시).
  //    서버 echo 가 도착하면 구독 콜백에서 임시 메시지를 실제 메시지로 교체(중복 방지).
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || activeRoomId === null || myUserId === null) return;

    const content = inputText.trim();
    const roomId = activeRoomId;

    // 임시 메시지(음수 id) 즉시 추가 -> 내가 보낸 게 바로 보임
    const optimistic: IncomingMessage = {
      messageId: -Date.now(),
      senderId: myUserId,
      senderNickname: '나',
      type: 'TEXT',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({ ...prev, [roomId]: [...(prev[roomId] || []), optimistic] }));

    publishMessage(roomId, content, myUserId);
    setInputText('');
  };

  const activeRoom = rooms.find((r) => r.chatRoomId === activeRoomId);

  // 방 표시 이름: REGION 이면 동네명, PERSONAL 이면 상대 닉네임
  const roomTitle = (room: ChatroomItem) =>
    room.type === 'REGION'
      ? room.regionName || '동네 채팅'
      : room.targetUser?.nickname || '알 수 없음';

  // 시간 포맷팅 헬퍼 함수
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[100dvh] bg-[#121212] text-white overflow-hidden relative">

      {/* =======================================================
          View 1: 채팅방 목록
      ========================================================*/}
      {activeRoomId === null && (
        <div className="flex flex-col h-full w-full absolute inset-0">
          <header className="flex items-center h-[50px] px-4 border-b border-[#262626] shrink-0">
            <h1 className="text-lg font-bold">채팅</h1>
          </header>

          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-4 text-center text-[#888]">진행 중인 채팅이 없습니다.</div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.chatRoomId}
                  onClick={() => handleRoomClick(room.chatRoomId)}
                  className="flex items-center px-4 py-3 border-b border-[#1f1f1f] cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                >
                  {/* 프로필 이미지 (없으면 기본 이미지 대체) */}
                  <img
                    src={room.targetUser?.profileImageUrl || 'https://via.placeholder.com/50'}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover shrink-0 bg-[#262626]"
                  />

                  <div className="flex-1 ml-4 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-[15px] truncate">{roomTitle(room)}</span>
                      <span className="text-[#888] text-xs shrink-0 ml-2">
                        {formatTime(room.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#888] text-sm truncate">
                        {room.lastMessage || '새로운 채팅방입니다.'}
                      </span>
                      {room.unreadCount && room.unreadCount > 0 ? (
                        <span className="bg-[#3b82f6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {room.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          View 2: 채팅방 상세
      ========================================================*/}
      {activeRoomId !== null && activeRoom && (
        <div className="flex flex-col h-full w-full absolute inset-0 z-[100] bg-[#121212]">
          <header className="flex items-center h-[50px] px-2 border-b border-[#262626] bg-[#1a1a1a] shrink-0">
            <button
              onClick={leaveRoom}
              className="p-2 text-xl text-white focus:outline-none"
            >
              ←
            </button>
            <span className="font-bold ml-2">{roomTitle(activeRoom)}</span>
          </header>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages[activeRoomId]?.map((msg) => {
              // senderId 비교로 나와 상대방 구분
              const isMe = msg.senderId === myUserId;

              return (
                <div
                  key={msg.messageId}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <span className="text-[#888] text-[11px] mb-1 ml-1">{msg.senderNickname}</span>
                    )}
                    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`px-4 py-2 text-[15px] leading-snug break-words ${
                          isMe
                            ? 'bg-[#3b82f6] text-white rounded-2xl rounded-tr-sm'
                            : 'bg-[#262626] text-[#eee] rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[#666] text-[10px] shrink-0 mb-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 p-3 pb-6 border-t border-[#262626] bg-[#1a1a1a] shrink-0"
          >
            <button type="button" className="p-2 text-[#888] text-2xl focus:outline-none shrink-0 leading-none">
              +
            </button>

            <div className="flex-1 bg-[#262626] rounded-3xl flex items-end px-4 py-1.5 border border-[#333]">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="메시지 보내기..."
                className="flex-1 bg-transparent text-white text-[15px] outline-none resize-none max-h-24 py-1.5 scrollbar-hide"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as unknown as React.FormEvent);
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2 shrink-0 font-bold ${inputText.trim() ? 'text-[#3b82f6]' : 'text-[#555]'} focus:outline-none`}
            >
              전송
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
