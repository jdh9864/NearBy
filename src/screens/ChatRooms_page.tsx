import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// ==========================================
// API 타입 정의 (주신 명세 기반)
// ==========================================
export interface TargetUser {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
}

export interface ChatroomItem {
  chatroomId: number;
  type: string;
  targetUser: TargetUser;
  lastMessage?: string; // API 응답에 따라 다를 수 있음
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  messageId: number;
  user: {
    nickname: string;
  };
  type: string;
  content: string;
  time: string;
}

export default function ChatRoomPage() {
  // 💡 [핵심] 상태 관리
  const [rooms, setRooms] = useState<ChatroomItem[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');
  
  // 내 닉네임 (메시지 좌우 배치를 위해 비교할 용도 - 실제 로그인 유저 정보로 교체 필요)
  const MY_NICKNAME = "내닉네임"; 

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 맨 아래로
  useEffect(() => {
    if (activeRoomId !== null) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRoomId]);

  // 1. 컴포넌트 마운트 시 채팅방 목록 불러오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('/api/chats');
        // API 응답 구조에 맞게 수정 필요 (배열을 반환한다고 가정)
        const roomData = Array.isArray(response.data) ? response.data : response.data.content || [];
        setRooms(roomData);
      } catch (error) {
        console.error('채팅방 목록을 불러오는데 실패했습니다.', error);
      }
    };
    fetchRooms();
  }, []);

  // 2. 채팅방 클릭 -> 입장 및 메시지 목록 불러오기
  const handleRoomClick = async (roomId: number) => {
    setActiveRoomId(roomId);
    
    // 안읽은 메시지 수 초기화 (UI 업데이트)
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.chatroomId === roomId ? { ...room, unreadCount: 0 } : room
      )
    );

    try {
      const response = await axios.get(`/api/chat/${roomId}/messages`);
      // API 응답 구조에 맞게 수정 필요 (배열 반환 가정)
      const fetchedMessages: ChatMessage[] = Array.isArray(response.data) ? response.data : response.data.content || [];
      
      setMessages(prev => ({
        ...prev,
        [roomId]: fetchedMessages
      }));
    } catch (error) {
      console.error('메시지를 불러오는데 실패했습니다.', error);
    }
  };

  // 3. 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || activeRoomId === null) return;

    const messageText = inputText;
    setInputText(''); // 입력창 즉시 초기화

    try {
      // 서버로 메시지 전송 (명세에 없어서 일반적인 POST 구조로 작성)
      await axios.post(`/api/chat/${activeRoomId}/messages`, {
        content: messageText,
        type: 'TEXT'
      });

      // 낙관적 업데이트 (서버 응답 기다리지 않고 화면에 먼저 표시)
      const newMessage: ChatMessage = {
        messageId: Date.now(), // 임시 ID
        user: { nickname: MY_NICKNAME },
        type: 'TEXT',
        content: messageText,
        time: new Date().toISOString(),
      };

      setMessages(prev => ({
        ...prev,
        [activeRoomId]: [...(prev[activeRoomId] || []), newMessage]
      }));

      // 방 목록의 마지막 메시지 갱신
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.chatroomId === activeRoomId 
            ? { ...room, lastMessage: messageText, lastMessageTime: "방금" } 
            : room
        )
      );
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  // 현재 활성화된 방 정보 추출
  const activeRoom = rooms.find(r => r.chatroomId === activeRoomId);

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
              rooms.map(room => (
                <div 
                  key={room.chatroomId}
                  onClick={() => handleRoomClick(room.chatroomId)}
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
                      <span className="font-bold text-[15px] truncate">
                        {room.targetUser?.nickname || '알 수 없음'}
                      </span>
                      <span className="text-[#888] text-xs shrink-0 ml-2">
                        {formatTime(room.lastMessageTime)}
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
              onClick={() => setActiveRoomId(null)} 
              className="p-2 text-xl text-white focus:outline-none"
            >
              ←
            </button>
            <span className="font-bold ml-2">{activeRoom.targetUser?.nickname}</span>
          </header>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages[activeRoomId]?.map((msg) => {
              // 💡 닉네임 비교로 나와 상대방 구분
              const isMe = msg.user.nickname === MY_NICKNAME;
              
              return (
                <div 
                  key={msg.messageId} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end max-w-[75%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
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
                      {formatTime(msg.time)}
                    </span>
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