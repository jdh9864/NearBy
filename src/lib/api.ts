// 공용 Axios 인스턴스
// - baseURL: 백엔드 서버 주소 (기본값 http://localhost:8080, .env의 VITE_API_BASE_URL로 override)
// - 요청 인터셉터에서 zustand 스토어의 accessToken을 Authorization 헤더로 자동 부착
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

export default api;
