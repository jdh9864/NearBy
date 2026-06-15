import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // bootstrap 대신 직접 App을 import
import './index.css';    // Tailwind CSS 전역 스타일


// ReactDOM이 Root를 생성하고 렌더링하도록 직접 연결
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

} else {
  console.error('❌ #root 엘리먼트를 찾을 수 없습니다.');
}