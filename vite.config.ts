import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 환경(mode)에 맞는 환경 변수를 로드
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    define: {
      // 1. 기존 global 매핑 유지
      global: 'globalThis',
//h
      // 2. 환경 변수를 process.env 객체로 매핑 (코드 수정 최소화)
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'process.env.VITE_KAKAO_REST_KEY': JSON.stringify(env.VITE_KAKAO_REST_KEY),
      'process.env.VITE_KAKAO_REDIRECT_URI': JSON.stringify(env.VITE_KAKAO_REDIRECT_URI),
      'process.env.VITE_KAKAO_JS_KEY': JSON.stringify(env.VITE_KAKAO_JS_KEY),
      'process.env.VITE_REGION_CODE': JSON.stringify(env.VITE_REGION_CODE),
    },
  }
})
