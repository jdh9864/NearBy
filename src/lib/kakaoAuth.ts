// 카카오 OAuth (인가 코드 방식) 프론트 헬퍼
// 흐름: 이 함수로 카카오 로그인 페이지 이동 -> 카카오가 redirect_uri 로 ?code=... 붙여 되돌려보냄
//      -> App 의 콜백 처리에서 code 를 백엔드(/api/auth/kakao)로 보내 우리 JWT 발급
//
// ⚠️ VITE_KAKAO_REDIRECT_URI 는 반드시 (1) 카카오 콘솔 등록값 (2) 서버 .env 의 KAKAO_REDIRECT_URI
//    셋이 글자까지 완전히 동일해야 함. 미설정 시 현재 배포 주소(origin)를 사용.
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;

// 미설정 / 빈값 / 예시 placeholder('your-app') 면 현재 접속 주소(origin)를 사용.
// -> redirect_uri 가 실제 보고 있는 배포 주소와 자동으로 일치하므로 잘못된 값으로 인한 로그인 실패 방지.
const RAW_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
export const KAKAO_REDIRECT_URI =
  RAW_REDIRECT_URI && RAW_REDIRECT_URI.trim() && !RAW_REDIRECT_URI.includes('your-app')
    ? RAW_REDIRECT_URI.trim()
    : window.location.origin;

export function redirectToKakaoLogin() {
  const url =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_REST_KEY}` +
    `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
    `&response_type=code`;
  window.location.href = url;
}
