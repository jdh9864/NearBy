import './App.css'
import { useEffect, useState } from 'react'
import BottomNavLayout from './screens/Bottom_navigation'
import Login_page from './screens/Login_page'
import api from './lib/api'
import { useUserStore } from './store/use_user'

function App() {
  const accessToken = useUserStore((s) => s.accessToken)
  const setAuth = useUserStore((s) => s.setAuth)
  const [exchanging, setExchanging] = useState(false)

  // 카카오 콜백 처리: redirect_uri 로 돌아오면 ?code=... 가 붙어있음
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    // 이미 로그인된 상태면 남은 code 쿼리만 정리
    if (accessToken) {
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    setExchanging(true)
    api
      .post('/api/auth/kakao', { code })
      .then((res) => {
        // 백엔드 TempTokenResponse { accessToken, refreshToken }
        setAuth(res.data.accessToken, res.data.refreshToken)
      })
      .catch((err) => {
        console.error('카카오 로그인 실패:', err)
        alert('로그인에 실패했습니다. 다시 시도해주세요.')
      })
      .finally(() => {
        // 주소창에서 code 제거 (새로고침 시 중복 교환 방지)
        window.history.replaceState({}, '', window.location.pathname)
        setExchanging(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (exchanging) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#121212',
          color: '#fff',
        }}
      >
        로그인 중...
      </div>
    )
  }

  return accessToken ? <BottomNavLayout /> : <Login_page />
}

export default App
