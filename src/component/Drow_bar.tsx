import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ==========================================
// API 타입 정의 (주신 명세 기반)
// ==========================================
export interface PhotoPayload {
  url: string; 
  order: number;
}

export interface PlacePayload {
  name: string;
  latitude: number;
  longitude: number;
  isMain: boolean;
  photos: PhotoPayload[];
}

export interface Post {
  postId: number;
  createdAt: string;
  text?: string | null;
  places: PlacePayload[];
}

export default function Draw_bar() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. 컴포넌트 마운트 시 API 호출하여 게시물 목록 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 💡 API 엔드포인트는 실제 백엔드 주소에 맞게 수정해주세요. (예: /api/posts)
        const response = await axios.get('/api/posts'); 
        
        // 페이징 처리된 객체({ content: [...] }) 형태인지, 배열 형태인지 대응
        const postData = Array.isArray(response.data) ? response.data : response.data.content || [];
        setPosts(postData);
      } catch (error) {
        console.error('게시물을 불러오는데 실패했습니다.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 날짜 포맷팅 헬퍼 함수
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div style={styles.drawerContainer}>
      {/* 💡 드로우바 핸들 */}
      <div style={styles.handleBar}>
        <div style={styles.handle}></div>
      </div>

      {/* 💡 게시물 리스트 영역 */}
      <div style={styles.scrollArea}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
            로딩 중...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
            게시물이 없습니다.
          </div>
        ) : (
          posts.map((post) => {
            // 1. 메인 장소 찾기 (없으면 첫 번째 장소 사용)
            const mainPlace = post.places.find(p => p.isMain) || post.places[0];
            
            // 2. 사진을 order 기준으로 정렬하여 가져오기
            const sortedPhotos = mainPlace?.photos?.sort((a, b) => a.order - b.order) || [];
            
            // 3. UI가 3장의 사진을 요구하므로, 부족할 경우 기본 이미지로 채움
            const imageUrls = [
              sortedPhotos[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image',
              sortedPhotos[1]?.url || 'https://via.placeholder.com/200x150?text=No+Image',
              sortedPhotos[2]?.url || 'https://via.placeholder.com/200x150?text=No+Image',
            ];

            return (
              <article key={post.postId} style={styles.postCard}>
                {/* 상단 유저 정보 */}
                <div style={styles.userInfo}>
                  {/* API에 유저 정보가 없으므로 임시 아바타/닉네임 적용 */}
                  <img src="https://via.placeholder.com/50" alt="avatar" style={styles.avatar} />
                  <div>
                    <div style={styles.userId}>익명 사용자</div>
                    <div style={styles.location}>
                      📍 {mainPlace?.name || "위치 알 수 없음"}
                    </div>
                  </div>
                </div>

                {/* 사진 3장 그리드 */}
                <div style={styles.imageGrid}>
                  <div style={styles.mainImageWrapper}>
                    <img src={imageUrls[0]} alt="main" style={styles.mainImage} />
                  </div>
                  <div style={styles.subImageWrapper}>
                    <img src={imageUrls[1]} alt="sub1" style={styles.subImage} />
                    <img src={imageUrls[2]} alt="sub2" style={styles.subImage} />
                  </div>
                </div>

                {/* 하단 본문 내용 */}
                <div style={styles.postBody}>
                  <p style={styles.content}>{post.text || ""}</p>
                  <span style={styles.time}>{formatTime(post.createdAt)}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// 🎨 인라인 스타일 (기존 코드와 동일)
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  drawerContainer: {
    position: 'absolute', 
    bottom: 0, 
    left: 0,
    right: 0,
    height: '50vh',
    backgroundColor: '#1a1a1a', 
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: '0 -4px 15px rgba(0,0,0,0.5)', 
    zIndex: 10,
    overflow: 'hidden',
  },
  handleBar: {
    padding: '12px 0',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#1a1a1a',
    zIndex: 11,
  },
  handle: {
    width: '40px',
    height: '4px',
    backgroundColor: '#444',
    borderRadius: '2px',
  },
  scrollArea: {
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