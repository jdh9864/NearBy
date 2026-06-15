// src/store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  accessToken: string | null;
  refreshToken: string | null;
  latitude: number | null;
  longitude: number | null;
  
  // 인증 정보 저장
  setAuth: (access: string, refresh: string) => void;
  // 유저 위치 업데이트
  setLocation: (lat: number, lng: number) => void;
  // 로그아웃 시 초기화
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  accessToken: null,
  refreshToken: null,
  latitude: null,
  longitude: null,
  
  setAuth: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng }),
  clearUser: () => set({ accessToken: null, refreshToken: null, latitude: null, longitude: null }),
}));