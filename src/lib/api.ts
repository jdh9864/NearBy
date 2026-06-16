// 공용 Axios 인스턴스
// - baseURL: 백엔드 서버 주소 (기본값 http://localhost:8080, .env의 VITE_API_BASE_URL로 override)
// - 요청 인터셉터에서 zustand 스토어의 accessToken을 Authorization 헤더로 자동 부착
// - 응답 인터셉터에서 401(액세스 토큰 만료) 시 refreshToken으로 자동 재발급 후 원요청 재시도
import axios from 'axios';
import { useUserStore } from '../store/use_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
});

// 모든 요청에 JWT 토큰 자동 부착
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 (single-flight)
let refreshPromise: Promise<string> | null = null;

// refreshToken으로 새 액세스 토큰 발급. 인터셉터를 안 타는 순수 axios 사용(무한루프 방지).
function reissueToken(): Promise<string> {
  const { refreshToken, accessToken } = useUserStore.getState();
  if (!refreshToken) return Promise.reject(new Error('no refresh token'));

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/api/auth/reissue`, { accessToken, refreshToken })
      .then((res) => {
        // 백엔드 TempTokenResponse { accessToken, refreshToken } (refresh 토큰도 회전됨)
        useUserStore.getState().setAuth(res.data.accessToken, res.data.refreshToken);
        return res.data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// 401 응답 시 자동 재발급 후 원요청 1회 재시도
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isReissue = original?.url?.includes('/api/auth/reissue');

    if (error.response?.status === 401 && original && !original._retry && !isReissue) {
      original._retry = true;
      try {
        const newToken = await reissueToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // 재발급도 실패(refresh 토큰 만료/불일치) -> 로그아웃해 로그인 화면으로 복귀
        useUserStore.getState().clearUser();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
