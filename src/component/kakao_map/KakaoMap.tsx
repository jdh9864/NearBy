import { useEffect, useRef } from "react";
import { loadKakaoMap } from "./loadKakaoMap";

// 💡 안전한 더미 데이터 생성 (위경도 오차 범위를 아주 미세하게 조정)
const dummyPositions = [
  { lat: 37.451585, lng: 126.657942 },
  { lat: 37.449585, lng: 126.655942 },
  { lat: 37.452585, lng: 126.654942 },
  { lat: 37.448585, lng: 126.658942 },
  { lat: 37.450585, lng: 126.659942 },
  { lat: 37.453585, lng: 126.656942 },
  { lat: 37.447585, lng: 126.656942 },
  { lat: 37.451000, lng: 126.655000 },
  { lat: 37.449000, lng: 126.658000 },
  { lat: 37.452000, lng: 126.657000 },
];

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      await loadKakaoMap();

      if (!mapRef.current) return;

      // 1. 님이 성공한 원본 기준 중심점 생성
      const center = new window.kakao.maps.LatLng(37.450585, 126.656942);

      // 2. 님이 성공한 원본 기준 맵 객체 생성 (변수 map에 할당)
      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 4, // 1km 반경이 다 보이도록 레벨만 4로 조정
      });

      // 3. 중앙 '내 위치' 기본 마커 생성
      new window.kakao.maps.Marker({
        map: map,
        position: center,
        title: "내 현재 위치"
      });

      // 4. 안전하게 파싱된 더미 배열로 마커만 생성
      dummyPositions.forEach((pos) => {
        const markerPosition = new window.kakao.maps.LatLng(pos.lat, pos.lng);
        
        new window.kakao.maps.Marker({
          map: map, // 위에서 생성한 map 객체 지정
          position: markerPosition,
        });
      });
    };

    initMap();
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "500px" }} // 님이 성공한 스타일 그대로 유지
    />
  );
}