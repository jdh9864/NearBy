import React, { useState } from 'react';

// 기존 컴포넌트 임포트 (없는 컴포넌트는 에러 방지용으로 임시 처리)
import Home_page from './Home_page';
import PostCreate_page from './PostCreate_page';
import Post_update from './Post_update';
import ChatRooms_page from './ChatRooms_page';
import Chat_page from './Chat_page';
import User_page from './User_page';

// 💡 1. 런타임 페이지 키에 User, Notification 추가
type PageKey = 'Home_page' | 'PostCreate_page' | 'Post_update' | 'ChatRooms_page' | 'Chat_page' | 'User_page' | 'Notification_page';

interface NavItem {
  key: PageKey;
  label: string;
  icon: string;
}

// 💡 2. 바텀 네비게이션은 핵심 3개로 압축 (왼쪽: 채팅, 가운데: 홈, 오른쪽: 유저)
const BOTTOM_NAV_ITEMS: NavItem[] = [
  { key: 'ChatRooms_page', label: '채팅', icon: '💬' },
  { key: 'Home_page', label: '홈', icon: '🏠' },
  { key: 'User_page', label: '유저', icon: '👤' }, // 유저 페이지 키 추가
];

export default function BottomNavLayout() {
  const [activeTab, setActiveTab] = useState<PageKey>('Home_page');

  const renderPage = () => {
    switch (activeTab) {
      case 'Home_page': return <Home_page />;
      case 'PostCreate_page': 
      return <PostCreate_page onComplete={() => setActiveTab('Home_page')} />;
      case 'Post_update': return <Post_update />;
      case 'ChatRooms_page': return <ChatRooms_page />;
      case 'Chat_page': return <Chat_page />;
      case 'User_page': return <User_page />;
      case 'Notification_page': return <div style={styles.placeholder}>알림 화면</div>;
      default: return <Home_page />;
    }
  };

  return (
    <div style={styles.container}>
      {/* 💡 3. 상단 네비게이션 바 (Top Nav) 추가 */}
      <header style={styles.topNav}>
        <button onClick={() => setActiveTab('PostCreate_page')} style={styles.topBtn}>
          <span style={styles.topIcon}>✍️</span> 작성
        </button>
        
        {/* 가운데 로고 타이틀 (선택사항) */}
        <span style={styles.logoTitle}>로컬맵</span>

        <button onClick={() => setActiveTab('Notification_page')} style={styles.topBtn}>
          <span style={styles.topIcon}>🔔</span> 알림
        </button>
      </header>

      {/* 메인 뷰포트 영역 */}
      <main style={styles.mainContent}>
        {renderPage()}
      </main>

      {/* 하단 고정 바텀바 */}
      <nav style={styles.bottomNav}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeTab;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                ...styles.navButton,
                color: isActive ? '#0070f3' : '#666666',
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span style={{ ...styles.label, fontWeight: isActive ? 'bold' : 'normal' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ==========================================
// 인라인 스타일 (모바일 레이아웃 최적화)
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    maxWidth: '430px',
    height: '100vh',
    margin: '0 auto',
    borderLeft: '1px solid #eaeaea',
    borderRight: '1px solid #eaeaea',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#121212',
  },
  // 💡 상단 바 스타일 추가
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50px',
    backgroundColor: '#121212',
    borderBottom: '1px solid #eaeaea',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 999,
  },
  topBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#333',
  },
  topIcon: {
    fontSize: '16px',
  },
  logoTitle: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#0070f3',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: '50px', // 💡 상단 바 높이만큼 여백 확보
    paddingBottom: '60px', // 바텀 바 높이만큼 여백 확보
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#121212',
    borderTop: '1px solid #eaeaea',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 999,
  },
  navButton: {
    flex: 1,
    height: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '4px',
  },
  icon: {
    fontSize: '20px', // 바텀 아이콘 살짝 키움 (3개로 줄었기 때문)
  },
  label: {
    fontSize: '11px',
  },
  placeholder: {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#999',
  }
};