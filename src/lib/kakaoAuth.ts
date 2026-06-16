// 카카오 OAuth (인가 코드 방식) 프론트 헬퍼
// 흐름: 이 함수로 카카오 로그인 페이지 이동 -> 카카오가 redirect_uri 로 ?code=... 붙여 되돌려보냄
//      -> App 의 콜백 처리에서 code 를 백엔드(/api/auth/kakao)로 보내 우리 JWT 발급
//
// ⚠️ VITE_KAKAO_REDIRECT_URI 는 반드시 (1) 카카오 콘솔 등록값 (2) 서버 .env 의 KAKAO_REDIRECT_URI
//    셋이 글자까지 완전히 동일해야 함. 미설정 시 현재 배포 주소(origin)를 사용.
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;

export const KAKAO_REDIRECT_URI =
  import.meta.env.VITE_KAKAO_REDIRECT_URI ?? window.location.origin;

export function redirectToKakaoLogin() {
  const url =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_REST_KEY}` +
    `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
    `&response_type=code`;
  window.location.href = url;
}
