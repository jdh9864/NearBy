// JWT 페이로드의 sub(userId)를 디코드.
// 백엔드 WebSocket 메시지 핸들러가 senderId 를 페이로드로 받기 때문에 필요.
export function getUserIdFromToken(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json.sub != null ? Number(json.sub) : null;
  } catch {
    return null;
  }
}
