import React from 'react';

// ==========================================
// 1. Props Type Definition
// ==========================================
interface CommonButtonProps {
  /** 버튼 내부 텍스트 */
  label: string;
  /** 버튼 클릭 시 실행할 함수 */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** 배경 색상 (기본값: 블루) */
  color?: string;
  /** 글자 색상 (기본값: 화이트) */
  textColor?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 외부에서 크기 및 위치 조정을 위해 넘겨받을 스타일 객체 */
  style?: React.CSSProperties;
}

// ==========================================
// 2. Component Implementation
// ==========================================
export default function CommonButton({
  label,
  onClick,
  color = '#0070f3',
  textColor = '#ffffff',
  disabled = false,
  style, // 외부에서 주입하는 width, height, margin 등을 그대로 받음
}: CommonButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        // 1. 기본 직사각형 뼈대 셋팅 (최소한의 기본 패딩만 부여)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        borderRadius: '4px', // 날카로운 직사각형 느낌을 주는 최소 반경
        fontWeight: '600',
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s ease',
        
        // 2. 주입받은 색상 옵션 매핑
        backgroundColor: disabled ? '#eaeaea' : color,
        color: disabled ? '#999999' : textColor,
        
        // 3. 외부에서 결정한 크기 및 위치 스타일로 오버라이드
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = '1')}
    >
      {label}
    </button>
  );
}