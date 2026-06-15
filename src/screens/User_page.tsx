import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ==========================================
// API 타입 정의 (제공해주신 명세 기반)
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

export interface UpdateProfileResponse {
  userId: string;
  nickname: string;
  imageURL?: string | null;
}

export default function User_page() {
  // 💡 상태 관리: 프로필 정보와 게시물 목록
  const [profile, setProfile] = useState<UpdateProfileResponse | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🚀 API 호출 (컴포넌트 마운트 시 1회 실행)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // 1. 내 프로필 정보 가져오기 (엔드포인트는 실제 서버에 맞게 조정 필요)
        const profileResponse = await axios.get<UpdateProfileResponse>('/api/users/my');
        setProfile(profileResponse.data);

        // 2. 내 게시물 목록 가져오기
        const postsResponse = await axios.get('/api/posts', {
          // 필요하다면 Query Params 추가 (예: userId: profileResponse.data.userId)
        });
        
        // 페이징 객체({ content: [...] }) 또는 배열 형태 대응
        const postsData = Array.isArray(postsResponse.data) 
          ? postsResponse.data 
          : postsResponse.data.content || [];
          
        setPosts(postsData);
      } catch (error) {
        console.error('유저 데이터를 불러오는데 실패했습니다.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 💡 게시물에서 썸네일(메인 장소의 첫 번째 사진)을 추출하는 헬퍼 함수
  const getThumbnailUrl = (post: Post) => {
    const mainPlace = post.places.find(p => p.isMain) || post.places[0];
    if (!mainPlace || !mainPlace.photos || mainPlace.photos.length === 0) {
      return 'https://via.placeholder.com/150?text=No+Image'; // 기본 이미지
    }
    // order 기준으로 정렬 후 첫 번째 이미지 반환
    const sortedPhotos = [...mainPlace.photos].sort((a, b) => a.order - b.order);
    return sortedPhotos[0].url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#121212] text-white">
        로딩 중...
      </div>
    );
  }

  return (
    // 부모 컨테이너: 전체 다크 배경 설정 및 세로 스크롤 허용
    <div className="flex flex-col h-full bg-[#121212] text-white overflow-y-auto">
      
      {/* 1. 상단 헤더 */}
      <header className="flex justify-between items-center h-[50px] px-4 border-b border-[#262626] shrink-0">
        <span className="text-lg font-bold">{profile?.nickname || '사용자'}</span>
        <button className="text-2xl focus:outline-none">≡</button>
      </header>

      {/* 2. 프로필 정보 */}
      <div className="p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <img 
            src={profile?.imageURL || "https://picsum.photos/id/64/80/80"} 
            alt="profile avatar" 
            className="w-20 h-20 rounded-full object-cover border border-[#333]" 
          />
          
          <div className="flex flex-1 justify-around text-center ml-4">
            <div>
              <div className="font-bold text-lg">{posts.length}</div>
              <div className="text-[11px] text-[#eee]">게시물</div>
            </div>
            <div>
              <div className="font-bold text-lg">256</div>
              <div className="text-[11px] text-[#eee]">팔로워</div>
            </div>
            <div>
              <div className="font-bold text-lg">214</div>
              <div className="text-[11px] text-[#eee]">팔로잉</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="font-bold text-[14px]">{profile?.nickname || '이름 없음'}</h2>
          <p className="text-[13px] text-[#eee] mt-1 leading-relaxed">
            알고리즘 전공자 💻 | 인하대 🦅<br />
            로컬 맵 프로젝트 개발 중 🔥
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-[#262626] rounded-lg py-1.5 text-[13px] font-bold border border-[#333] hover:bg-[#333] transition-colors">
            프로필 편집
          </button>
          <button className="flex-1 bg-[#262626] rounded-lg py-1.5 text-[13px] font-bold border border-[#333] hover:bg-[#333] transition-colors">
            프로필 공유
          </button>
        </div>
      </div>

      {/* 3. 탭 메뉴 */}
      <div className="flex justify-around border-t border-[#262626] shrink-0">
        <div className="flex-1 text-center py-2.5 border-b-[1.5px] border-white cursor-pointer">
          <span className="text-xl">▦</span>
        </div>
        <div className="flex-1 text-center py-2.5 text-[#555] cursor-pointer">
          <span className="text-xl">▶</span>
        </div>
        <div className="flex-1 text-center py-2.5 text-[#555] cursor-pointer">
          <span className="text-xl">👤</span>
        </div>
      </div>

      {/* 4. 게시물 그리드 (API에서 받아온 posts 매핑) */}
      <div className="grid grid-cols-3 gap-[2px] pb-6">
        {posts.map(post => (
          <div key={post.postId} className="aspect-square bg-[#262626] cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src={getThumbnailUrl(post)} 
              alt={`post_${post.postId}`} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

    </div>
  );
}