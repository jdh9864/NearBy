import React, { useState, useRef, useEffect } from 'react';

// 💡 타입 정의
interface Room {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

// 초기 고정 데이터는 컴포넌트 외부로 분리
const DUMMY_ROOMS: Room[] = [
  { id: 1, name: "인하대 알고리즘 스터디", lastMessage: "오늘 다익스트라 문제 풀어오셨나요?", time: "오후 2:30", unreadCount: 2, avatar: "https://picsum.photos/id/10/50/50" },
  { id: 2, name: "구월동 핫플 탐험대", lastMessage: "거기 웨이팅 장난 아니에요 ㅠㅠ", time: "어제", unreadCount: 0, avatar: "https://picsum.photos/id/20/50/50" },
  { id: 3, name: "동네 밥친구", lastMessage: "오늘 저녁 돈까스 콜?", time: "오전 11:15", unreadCount: 5, avatar: "https://picsum.photos/id/30/50/50" },
];

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: "안녕하세요! 오늘 스터디 몇 시죠?", sender: 'other', time: "오후 2:00" },
    { id: 2, text: "오후 6시 본관 앞입니다.", sender: 'me', time: "오후 2:05" },
    { id: 3, text: "오늘 다익스트라 문제 풀어오셨나요?", sender: 'other', time: "오후 2:30" },
  ],
  2: [
    { id: 1, text: "주말에 로데오거리 카페 갈 사람?", sender: 'other', time: "어제" },
    { id: 2, text: "거기 웨이팅 장난 아니에요 ㅠㅠ", sender: 'other', time: "어제" },
  ],
  3: [
    { id: 1, text: "배고프네요", sender: 'other', time: "오전 11:00" },
    { id: 2, text: "오늘 저녁 돈까스 콜?", sender: 'other', time: "오전 11:15" },
  ],
};

export default function ChatRoom_page() {
  // 💡 [핵심 마이그레이션] 채팅방 목록을 상태(State)로 관리
  const [rooms, setRooms] = useState<Room[]>(DUMMY_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRoomId !== null) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRoomId]);

  // 💡 [핵심 변경 1] 채팅방 클릭 시 unreadCount를 0으로 초기화하는 핸들러
  const handleRoomClick = (roomId: number) => {
    // $O(N)$ 공간 불변성을 지키며 맵 배열 재생성
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
    // 상세 방 입장
    setActiveRoomId(roomId);
  };

  // 메시지 전송 로직
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || activeRoomId === null) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage]
    }));

    // 💡 [핵심 변경 2] 내가 메시지를 보내는 순간에도 최신 메시지 텍스트 갱신
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === activeRoomId ? { ...room, lastMessage: inputText, time: "방금" } : room
      )
    );

    setInputText('');
  };

  // 현재 활성화된 방 정보 추출
  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      
      {/* =======================================================
          View 1: 채팅방 목록
      ========================================================*/}
      {activeRoomId === null && (
        <>
          <header className="flex items-center h-[50px] px-4 border-b border-[#262626]">
            <h1 className="text-lg font-bold">채팅</h1>
          </header>

          <div className="flex-1 overflow-y-auto">
            {rooms.map(room => (
              <div 
                key={room.id}
                // 기존의 단순 state 변경에서 래핑된 초기화 함수 호출로 전환
                onClick={() => handleRoomClick(room.id)}
                className="flex items-center px-4 py-3 border-b border-[#1f1f1f] cursor-pointer hover:bg-[#1a1a1a] transition-colors"
              >
                <img src={room.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover shrink-0" />
                
                <div className="flex-1 ml-4 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[15px] truncate">{room.name}</span>
                    <span className="text-[#888] text-xs shrink-0 ml-2">{room.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#888] text-sm truncate">{room.lastMessage}</span>
                    {room.unreadCount > 0 && (
                      <span className="bg-[#3b82f6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* =======================================================
          View 2: 채팅방 상세
      ========================================================*/}
      {activeRoomId !== null && activeRoom && (
        <div className="flex flex-col absolute inset-0 z-[1000] bg-[#121212]">
          <header className="flex items-center h-[50px] px-2 border-b border-[#262626] bg-[#1a1a1a] shrink-0">
            <button 
              onClick={() => setActiveRoomId(null)} 
              className="p-2 text-xl text-white focus:outline-none"
            >
              ←
            </button>
            <span className="font-bold ml-2">{activeRoom.name}</span>
          </header>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages[activeRoomId]?.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end max-w-[75%] gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div 
                    className={`px-4 py-2 text-[15px] leading-snug break-words ${
                      msg.sender === 'me' 
                        ? 'bg-[#3b82f6] text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-[#262626] text-[#eee] rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[#666] text-[10px] shrink-0 mb-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
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
                    handleSendMessage(e);
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