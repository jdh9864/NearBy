// import CommonButton from "../component/common_button"
import KakaoMap from "../component/kakao_map/KakaoMap"
import Draw_bar from "../component/Drow_bar"

export default function Home_page() {
  return (
    // 💡 화면 전체를 덮고, 자식들을 겹치게(absolute) 만들 수 있는 relative 컨테이너
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 1층: 배경에 깔리는 카카오맵 */}
      <KakaoMap />
      
      {/* 2층: 위로 드래그해서 올리는 드로우바 */}
      <Draw_bar />
    </div>
  );
}