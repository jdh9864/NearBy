import { useEffect, useRef, useState } from "react";
import { loadKakaoMap } from "./loadKakaoMap";

export interface MapResponse {
  postId: number;
  latitude: number;
  longitude: number;
  thumbnailImageUrl: string;
}

export type MapResponseList = MapResponse[];

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  // 데이터 상태 관리
  const [data, setData] = useState<MapResponseList>([]);

  useEffect(() => {
    // 1. 데이터 가져오기 (시간 단축을 위해 여기에 바로 작성)
    const fetchData = async () => {
      try {
        const response = await fetch("YOUR_API_ENDPOINT_URL"); // 여기에 API 주소 입력
        const result: MapResponseList = await response.json();
        setData(result);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // 데이터가 있고 지도가 초기화된 후 마커 생성
    if (data.length === 0) return;

    const initMap = async () => {
      await loadKakaoMap();
      if (!mapRef.current) return;

      const center = new window.kakao.maps.LatLng(37.450585, 126.656942);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 4,
      });

      // 내 위치 마커
      new window.kakao.maps.Marker({
        map: map,
        position: center,
        title: "내 현재 위치",
      });

      // 2. API 데이터로 마커 반복 생성
      data.forEach((item) => {
        const markerPosition = new window.kakao.maps.LatLng(
          item.latitude,
          item.longitude
        );
        
        new window.kakao.maps.Marker({
          map: map,
          position: markerPosition,
          title: `Post ID: ${item.postId}`,
        });
      });
    };

    initMap();
  }, [data]); // data가 채워지면 실행

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "500px" }}
    />
  );
}