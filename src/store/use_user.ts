// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useUserStore = create<UserState>()(
  // 카카오 로그인은 전체 페이지 리다이렉트라 토큰을 localStorage에 보존
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      latitude: null,
      longitude: null,

      setAuth: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setLocation: (lat, lng) => set({ latitude: lat, longitude: lng }),
      clearUser: () => set({ accessToken: null, refreshToken: null, latitude: null, longitude: null }),
    }),
    {
      name: 'nearby-auth',
      // 토큰만 저장 (위치는 매 세션 새로 잡음)
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
