import React from 'react';

// ==========================================
// 💡 1. 사진 import (같은 폴더에 위치)
// 파일명 뒤에 자동으로 붙는 ' 2', ' 1' 등과 공백을 포함하여
// 확장자(.jpg로 가정)를 붙여 정확히 import 해야 합니다.
// ==========================================
import kakaoImg1 from './KakaoTalk_20260315_121108829 2.png';
import kakaoImg2 from './KakaoTalk_20260315_140320358 2.png';
import kakaoImg3 from './KakaoTalk_20260316_144917667_02 1.png';
import kakaoImg4 from './KakaoTalk_20260316_144917667_03 1.png';
import kakaoImg5 from './KakaoTalk_20260316_144917667_06 1.png';
import kakaoImg6 from './KakaoTalk_20260316_144917667_07 1.png';
import kakaoImg7 from './KakaoTalk_20260316_144917667_09 1.png';
import kakaoImg8 from './KakaoTalk_20260316_144917667_11 1.png';
import kakaoImg9 from './KakaoTalk_20260316_144917667_14 1.png';

// 💡 2. 게시물 데이터 (import한 이미지 변수로 대체)
const POST_DATA = [
  {
    id: 1,
    user: "jdonghy",
    avatar: "https://picsum.photos/id/64/50/50",
    location: "인하대학교 본관",
    // import한 변수를 배열에 넣습니다.
    images: [kakaoImg1, kakaoImg2, kakaoImg3], 
    content: "오늘 날씨 너무 좋네요. 고양이도 보고 힐링 중입니다! 🐱",
    time: "3분 전"
  },
  {
    id: 2,
    user: "user_1",
    avatar: "https://picsum.photos/id/65/50/50",
    location: "미추홀구 카페",
    images: [kakaoImg4, kakaoImg5, kakaoImg6],
    content: "맛있는 빵과 함께 열공 중... 도서관은 벌써 자리가 없네요. 🍞",
    time: "15분 전"
  },
  {
    id: 3,
    user: "local_explorer",
    avatar: "https://picsum.photos/id/66/50/50",
    location: "학익동 강의실",
    images: [kakaoImg7, kakaoImg8, kakaoImg9],
    content: "강의실 창밖으로 보이는 풍경. 시험 기간 파이팅입니다!",
    time: "1시간 전"
  }
];

export default function Draw_bar() {
  return (
    <div style={styles.drawerContainer}>
      {/* 💡 드로우바 핸들 (위아래로 드래그하는 느낌) */}
      <div style={styles.handleBar}>
        <div style={styles.handle}></div>
      </div>

      {/* 💡 게시물 리스트 영역 (여기서만 스크롤 발생) */}
      <div style={styles.scrollArea}>
        {POST_DATA.map((post) => (
          <article key={post.id} style={styles.postCard}>
            {/* 상단 유저 정보 */}
            <div style={styles.userInfo}>
              <img src={post.avatar} alt="avatar" style={styles.avatar} />
              <div>
                <div style={styles.userId}>{post.user}</div>
                <div style={styles.location}>📍 {post.location}</div>
              </div>
            </div>

            {/* 사진 3장 그리드 */}
            <div style={styles.imageGrid}>
              <div style={styles.mainImageWrapper}>
                <img src={post.images[0]} alt="main" style={styles.mainImage} />
              </div>
              <div style={styles.subImageWrapper}>
                <img src={post.images[1]} alt="sub1" style={styles.subImage} />
                <img src={post.images[2]} alt="sub2" style={styles.subImage} />
              </div>
            </div>

            {/* 하단 본문 내용 */}
            <div style={styles.postBody}>
              <p style={styles.content}>{post.content}</p>
              <span style={styles.time}>{post.time}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 🎨 인라인 스타일 (스크롤 제약 조건 추가)
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  drawerContainer: {
    // 지도 위에 붕 뜨는 바텀 시트 형태로 고정
    position: 'absolute', 
    bottom: 0, 
    left: 0,
    right: 0,
    height: '50vh', // 화면 전체 높이의 65%까지만 올라오도록 제한
    backgroundColor: '#1a1a1a', 
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: '0 -4px 15px rgba(0,0,0,0.5)', // 위로 올라오는 그림자 효과 추가
    zIndex: 10, // 지도보다 무조건 위에 오도록
    overflow: 'hidden',
  },
  handleBar: {
    padding: '12px 0',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#1a1a1a', // 스크롤 시 핸들바 배경 투명해지는 것 방지
    zIndex: 11,
  },
  handle: {
    width: '40px',
    height: '4px',
    backgroundColor: '#444',
    borderRadius: '2px',
  },
  scrollArea: {
    // 남은 공간을 꽉 채우고, 넘치면 스크롤
    flex: 1, 
    overflowY: 'scroll', 
    padding: '0 16px 80px 16px', 
    scrollSnapType: 'y proximity', 
  },
  postCard: {
    backgroundColor: '#262626',
    borderRadius: '16px',
    marginBottom: '20px',
    padding: '16px',
    border: '1px solid #333',
    scrollSnapAlign: 'start', 
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userId: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  location: {
    color: '#0070f3', 
    fontSize: '12px',
  },
  imageGrid: {
    display: 'flex',
    gap: '8px',
    height: '240px',
    marginBottom: '12px',
  },
  mainImageWrapper: {
    flex: 2,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  subImageWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  subImage: {
    width: '100%',
    height: '116px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  postBody: {
    marginTop: '8px',
  },
  content: {
    color: '#eee',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  time: {
    color: '#666',
    fontSize: '11px',
    marginTop: '8px',
    display: 'inline-block',
  },
};