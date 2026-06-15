import React, { useState } from 'react';

// 💡 이미지 불러오기 (기존과 동일)
import kakaoImg1 from './KakaoTalk_20260315_121108829 2.png';
import kakaoImg2 from './KakaoTalk_20260315_140320358 2.png';
import kakaoImg3 from './KakaoTalk_20260316_144917667_02 1.png';
import kakaoImg4 from './KakaoTalk_20260316_144917667_03 1.png';
import kakaoImg5 from './KakaoTalk_20260316_144917667_06 1.png';
import kakaoImg6 from './KakaoTalk_20260316_144917667_07 1.png';
import kakaoImg7 from './KakaoTalk_20260316_144917667_09 1.png';
import kakaoImg8 from './KakaoTalk_20260316_144917667_11 1.png';
import kakaoImg9 from './KakaoTalk_20260316_144917667_14 1.png';

const GALLERY_IMAGES = [
  kakaoImg1, kakaoImg2, kakaoImg3, kakaoImg4, kakaoImg5, 
  kakaoImg6, kakaoImg7, kakaoImg8, kakaoImg9
];

// 💡 1. 컴포넌트 Props 타입 정의
interface PostCreatePageProps {
  onComplete: () => void;
}

export default function PostCreate_page({ onComplete }: PostCreatePageProps) {
  const [step, setStep] = useState<'select' | 'write'>('select');
  const [selectedImages, setSelectedImages] = useState<string[]>([GALLERY_IMAGES[0]]);
  const [focusedImage, setFocusedImage] = useState<string>(GALLERY_IMAGES[0]);
  const [content, setContent] = useState('');

  const handleImageClick = (img: string) => {
    setFocusedImage(img);
    if (selectedImages.includes(img)) {
      if (selectedImages.length > 1) {
        setSelectedImages(selectedImages.filter((i) => i !== img));
      }
    } else {
      setSelectedImages([...selectedImages, img]);
    }
  };

  const handleNext = () => {
    if (selectedImages.length === 0) {
      alert('이미지를 최소 1장 이상 선택해주세요.');
      return;
    }
    setStep('write');
  };

  // 🚀 2. 게시물 생성 완료 후 홈으로 이동하는 로직 반영
  const handleCreate = () => {
    alert('✅ 성공적으로 생성되었습니다!');
    
    // 상태 초기화
    setStep('select');
    setContent('');
    setSelectedImages([GALLERY_IMAGES[0]]);
    
    // 💡 부모 컴포넌트(BottomNavLayout)의 탭을 'Home_page'로 변경하도록 콜백 실행
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      {step === 'select' && (
        <>
          <header className="flex justify-between items-center h-[50px] px-4 border-b border-[#262626]">
            <button className="text-white text-xl p-0 focus:outline-none">✕</button>
            <span className="text-base font-bold">새 게시물</span>
            <button onClick={handleNext} className="text-[#3b82f6] text-sm font-bold p-0 focus:outline-none">다음</button>
          </header>

          <div className="w-full aspect-square bg-black">
            <img src={focusedImage} alt="Focused" className="w-full h-full object-cover" />
          </div>

          <div className="flex justify-between items-center py-3 px-4">
            <span className="text-white text-sm">최근 ⌵</span>
            <button className="bg-[#3b82f6] text-white rounded-2xl px-3 py-1.5 text-xs font-bold border-none focus:outline-none">
              선택 ⚏
            </button>
          </div>

          <div className="grid grid-cols-4 gap-[2px] overflow-y-auto flex-1">
            {GALLERY_IMAGES.map((img, idx) => {
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
            <button onClick={handleCreate} className="text-[#3b82f6] text-sm font-bold p-0 focus:outline-none">생성</button>
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