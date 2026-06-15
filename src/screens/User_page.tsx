import React, { useState, useEffect } from 'react';

// 💡 제공해주신 로컬 이미지 불러오기
import kakaoImg1 from './KakaoTalk_20260315_121108829 2.png';
import kakaoImg4 from './KakaoTalk_20260316_144917667_03 1.png';
import kakaoImg7 from './KakaoTalk_20260316_144917667_09 1.png';
import kakaoImg9 from './KakaoTalk_20260316_144917667_14 1.png'; // 4번째 추가할 사진

// 💡 기본 3개의 게시물 (상수)
const BASE_POSTS = [
  { id: 1, image: kakaoImg1 },
  { id: 2, image: kakaoImg4 },
  { id: 3, image: kakaoImg7 },
];

// 💡 추가될 4번째 게시물
const EXTRA_POST = { id: 4, image: kakaoImg9 };

export default function User_page() {
  // 💡 [핵심 최적화] 지연 초기화(Lazy Initialization)
  // 컴포넌트가 처음 마운트될 때 한 번만 실행되어 초기 상태를 즉시 확정짓습니다.
  const [posts] = useState(() => {
    // SSR 환경 에러 방지
    if (typeof window === 'undefined') return BASE_POSTS;
    
    // 렌더링 전에 방문 기록을 미리 읽어서 3개로 그릴지 4개로 그릴지 결정
    const hasVisited = sessionStorage.getItem('userPageVisited');
    return hasVisited ? [...BASE_POSTS, EXTRA_POST] : BASE_POSTS;
  });

  // 🚀 순수 부수 효과(Side Effect)만 담당
  useEffect(() => {
    // 렌더링에 영향을 주지 않고, 첫 방문일 때만 세션 스토리지에 도장을 찍습니다.
    const hasVisited = sessionStorage.getItem('userPageVisited');
    if (!hasVisited) {
      sessionStorage.setItem('userPageVisited', 'true');
    }
  }, []);

  return (
    // 부모 컨테이너: 전체 다크 배경 설정 및 세로 스크롤 허용
    <div className="flex flex-col h-full bg-[#121212] text-white overflow-y-auto">
      
      {/* 1. 상단 헤더 */}
      <header className="flex justify-between items-center h-[50px] px-4 border-b border-[#262626] shrink-0">
        <span className="text-lg font-bold">jdonghy</span>
        <button className="text-2xl focus:outline-none">≡</button>
      </header>

      {/* 2. 프로필 정보 */}
      <div className="p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <img 
            src="https://picsum.photos/id/64/80/80" 
            alt="profile avatar" 
            className="w-20 h-20 rounded-full object-cover border border-[#333]" 
          />
          
          <div className="flex flex-1 justify-around text-center ml-4">
            <div>
              {/* 💡 동적 렌더링: 게시물 개수가 상태에 맞춰 자동으로 바뀜 */}
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
          <h2 className="font-bold text-[14px]">정동혁</h2>
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

      {/* 4. 게시물 그리드 (상태 posts 매핑) */}
      <div className="grid grid-cols-3 gap-[2px] pb-6">
        {posts.map(post => (
          <div key={post.id} className="aspect-square bg-[#262626] cursor-pointer hover:opacity-80 transition-opacity">
            <img src={post.image} alt={`post_${post.id}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

    </div>
  );
}