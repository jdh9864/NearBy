import { redirectToKakaoLogin } from '../lib/kakaoAuth';

// 로그인 화면: 카카오 로그인 버튼 하나
export default function Login_page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white px-8">
      <div className="text-3xl font-black text-[#0070f3] mb-2">로컬맵</div>
      <p className="text-[#888] text-sm mb-12">내 주변의 장소와 이야기</p>

      <button
        onClick={redirectToKakaoLogin}
        className="w-full max-w-[320px] flex items-center justify-center gap-2 bg-[#FEE500] text-[#191600] font-bold rounded-xl py-3 text-[15px] focus:outline-none"
      >
        <span className="text-lg">💬</span> 카카오로 로그인
      </button>
    </div>
  );
}
