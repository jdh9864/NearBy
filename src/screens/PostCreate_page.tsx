import React, { useState, useRef } from 'react';
import api from '../lib/api';

// ==========================================
// API 타입 정의 (주신 명세 기반)
// ==========================================
export interface PhotoPayload {
  url: string; 
  order: number;
}

export interface PlacePayload {
  name: string;
  latitude: number;
  longitude: number;
  isKey: boolean; // 백엔드 PostDto.PlaceDto.isKey 와 일치 (메인 장소 여부)
  photos: PhotoPayload[];
}

export interface CreatePostRequest {
  text?: string | null; 
  places: PlacePayload[]; 
}

// 💡 컴포넌트 Props 타입 정의
interface PostCreatePageProps {
  onComplete: () => void;
}

export default function PostCreatePage({ onComplete }: PostCreatePageProps) {
  const [step, setStep] = useState<'select' | 'write'>('select');
  
  // 목데이터 대신 실제 사용자가 업로드한 이미지의 미리보기 URL을 관리
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [focusedImage, setFocusedImage] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 기기에서 실제 파일 선택 시 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      
      setSelectedImages(prev => [...prev, ...newImageUrls]);
      if (!focusedImage) {
        setFocusedImage(newImageUrls[0]);
      }
    }
  };

  // 2. 갤러리 그리드에서 이미지 클릭 시 선택/해제 토글
  const handleImageClick = (img: string) => {
    setFocusedImage(img);
    if (selectedImages.includes(img)) {
      if (selectedImages.length > 1) {
        const newSelected = selectedImages.filter((i) => i !== img);
        setSelectedImages(newSelected);
        if (focusedImage === img) setFocusedImage(newSelected[0]); // 포커스 갱신
      }
    } else {
      setSelectedImages([...selectedImages, img]);
    }
  };

  const handleNext = () => {
    if (selectedImages.length === 0) {
      alert('이미지를 최소 1장 이상 추가해주세요.');
      return;
    }
    setStep('write');
  };

  // 🚀 3. 게시물 생성 API 연동 로직
  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 💡 [참고] 원래는 이미지를 파일 서버에 먼저 올리고 받은 URL을 넣어야 함. 
      // 현재는 명세서 구조를 맞추기 위해 임시 URL 문자열 처리.
      const payload: CreatePostRequest = {
        text: content,
        places: [
          {
            name: "임시 위치", // 위치 선택 UI가 없으므로 임의값 적용
            latitude: 37.5665,
            longitude: 126.9780,
            isKey: true,
            photos: selectedImages.map((_, idx) => ({
              url: `https://uploaded-image-url.com/temp_${idx}.jpg`, // 실제 S3 URL 등으로 교체 필요
              order: idx + 1
            }))
          }
        ]
      };

      // 백엔드: POST /api/posts/create, 응답은 생성된 postId(Long) 단일 값
      await api.post<number>('/api/posts/create', payload);

      alert('✅ 성공적으로 생성되었습니다!');
      
      // 상태 초기화 및 홈 이동 콜백
      setStep('select');
      setContent('');
      setSelectedImages([]);
      setFocusedImage(null);
      onComplete();

    } catch (error) {
      console.error('게시물 생성 실패:', error);
      alert('게시물 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      {/* 숨겨진 파일 인풋 (멀티플 선택 가능) */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
      />

      {step === 'select' && (
        <>
          <header className="flex justify-between items-center h-[50px] px-4 border-b border-[#262626]">
            <button onClick={() => onComplete()} className="text-white text-xl p-0 focus:outline-none">✕</button>
            <span className="text-base font-bold">새 게시물</span>
            <button onClick={handleNext} className="text-[#3b82f6] text-sm font-bold p-0 focus:outline-none">다음</button>
          </header>

          <div className="w-full aspect-square bg-[#1a1a1a] flex items-center justify-center">
            {focusedImage ? (
              <img src={focusedImage} alt="Focused" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#888]">이미지를 추가해주세요</span>
            )}
          </div>

          <div className="flex justify-between items-center py-3 px-4">
            <span className="text-white text-sm">갤러리 ⌵</span>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-[#3b82f6] text-white rounded-2xl px-4 py-1.5 text-xs font-bold border-none focus:outline-none"
            >
              + 사진 추가
            </button>
          </div>

          <div className="grid grid-cols-4 gap-[2px] overflow-y-auto flex-1 content-start">
            {selectedImages.map((img, idx) => {
              const isSelected = selectedImages.includes(img);
              const selectionIndex = selectedImages.indexOf(img) + 1;

              return (
                <div 
                  key={idx} 
                  className={`relative aspect-square cursor-pointer transition-opacity duration-200 ${isSelected ? 'opacity-70' : 'opacity-100'}`}
                  onClick={() => handleImageClick(img)}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-[#3b82f6] text-white w-5 h-5 rounded-full flex justify-center items-center text-xs font-bold border border-white">
                      {selectionIndex}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {step === 'write' && (
        <>
          <header className="flex justify-between items-center h-[50px] px-4 border-b border-[#262626]">
            <button onClick={() => setStep('select')} className="text-white text-xl p-0 focus:outline-none">←</button>
            <span className="text-base font-bold">새 게시물</span>
            <button 
              onClick={handleCreate} 
              disabled={isSubmitting}
              className={`text-sm font-bold p-0 focus:outline-none ${isSubmitting ? 'text-[#888]' : 'text-[#3b82f6]'}`}
            >
              {isSubmitting ? '생성 중...' : '생성'}
            </button>
          </header>

          <div className="flex-1 p-4 flex flex-col">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {selectedImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Selected ${idx}`} className="w-[70px] h-[70px] rounded-lg object-cover shrink-0" />
              ))}
            </div>

            <hr className="w-full border-t border-[#262626] mb-4" />

            <textarea
              className="flex-1 bg-transparent border-none text-white text-[15px] resize-none outline-none leading-relaxed"
              placeholder="문구 입력..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
}