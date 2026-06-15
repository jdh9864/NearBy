import { create } from 'zustand';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
  
  setLocation: (lat: number, lng: number) => void;
  setError: (error: string) => void;
  startLoading: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  isLoading: false,
  error: null,

  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng, isLoading: false, error: null }),
  setError: (err) => set({ error: err, isLoading: false }),
  startLoading: () => set({ isLoading: true }),
}));