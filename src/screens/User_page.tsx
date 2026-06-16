import { useState, useEffect } from 'react';
import api from '../lib/api';

// ==========================================
// API 타입 정의 (백엔드 DTO 기준)
// ==========================================

// 백엔드 PostResponse (GET /api/posts/my, /api/posts 의 content 항목)
export interface Post {
  id: number;
  text?: string | null;
  thumbnailImageUrl: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  userId: number;
}

// 백엔드 UserDto
export interface UserProfile {
  id: number;
  nickname: string;
  profileImageUrl?: string | null;
  kakaoId?: number | null;
}

export default function User_page() {
  // 💡 상태 관리: 프로필 정보와 게시물 목록
  // ⚠️ setProfile 은 GET /api/users/my(백엔드 누락) 추가 시 사용 예정
  const [profile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🚀 API 호출 (컴포넌트 마운트 시 1회 실행)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // 1. 내 프로필 정보 가져오기
        // ⚠️ TODO(백엔드 누락): 백엔드에 GET /api/users/my 가 없음 (PUT만 존재).
        //    프로필 조회 엔드포인트가 추가되면 아래 주석을 해제할 것.
        // const profileResponse = await api.get<UserProfile>('/api/users/my');
        // setProfile(profileResponse.data);

        // 2. 내 게시물 목록 가져오기 (백엔드: GET /api/posts/my -> SliceResponse<PostResponse>)
        const postsResponse = await api.get('/api/posts/my');

        // SliceResponse 는 { content: [...] } 형태
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

  // 백엔드 PostResponse 는 thumbnailImageUrl 을 직접 제공
  const getThumbnailUrl = (post: Post) =>
    post.thumbnailImageUrl || 'https://via.placeholder.com/150?text=No+Image';

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
            src={profile?.profileImageUrl || "https://picsum.photos/id/64/80/80"}
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
          <div key={post.id} className="aspect-square bg-[#262626] cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src={getThumbnailUrl(post)}
              alt={`post_${post.id}`}
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

    </div>
  );
}