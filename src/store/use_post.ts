// src/store/usePostStore.ts
import { create } from 'zustand';

interface PostState {
  postId: string | null;
  latitude: number | null;
  longitude: number | null;
  setPostLocation: (id: string, lat: number, lng: number) => void;
  resetPost: () => void;
}

export const usePostStore = create<PostState>((set) => ({
  postId: null,
  latitude: null,
  longitude: null,
  setPostLocation: (id, lat, lng) => set({ postId: id, latitude: lat, longitude: lng }),
  resetPost: () => set({ postId: null, latitude: null, longitude: null }),
}));