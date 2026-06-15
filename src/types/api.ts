export interface PhotoPayload {
  url: string; 
  order: number;
}

export interface PlacePayload {
  name: string;
  latitude: number;
  longitude: number;
  isMain: boolean;
  photos: PhotoPayload[];
}

export interface CreatePostRequest {
  text?: string | null; // isNullable: Y
  places: PlacePayload[]; // isNullable: N
}

export interface CreatePostResponse {
  postId: number;
  createdAt: string; 
}

export interface Post extends CreatePostRequest {
  postId: number;
  createdAt: string;
}

export interface GetPostsQueryParams {
  size?: number;       
  sort?: number;       
  search?: string;
  userId?: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateProfileRequest {
  nickname?: string | null;
  imageURL?: string | null;
}

// PUT /api/users/my Response Body
export interface UpdateProfileResponse {
  userId: string;
  nickname: string;
  imageURL?: string | null;
}


// ==========================================
// 3. CHAT (채팅) 관련 타입
// ==========================================

// POST /api/chat/enter Request Body
export interface EnterChatRequest {
  latitude: number;
  longitude: number;
}

// GET /api/chat/{chatroomId}/messages Query Parameters
export interface GetChatMessagesQueryParams {
  lastMessageId?: number;
  size?: number;
}

// GET /api/chat/{chatroomId}/messages Response Array Item
export interface ChatMessage {
  messageId: number;     // 명세서: messageid (카멜케이스로 보정)
  user: {
    nickname: string;    // 명세서: user.nickname
  };
  type: string;          // 추가: 명세서의 메시지 종류 (텍스트 or url)
  content: string;       // 명세서: 메시지 본문
  time: string;          // 수정: 명세서의 time (보통 ISO DateTime 문자열)
}



// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface TargetUser {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
}

export interface PersonalChatResponse {
  chatroomId: number;
  type: string;
  targetUser: TargetUser;
}

export interface HideChatResponse {
  message: string;
}

export interface Comment {
  id: number;
  text: string;
  userId: number;
  nickname: string;
  createdAt: string;
}

export interface CommentPageResponse {
  content: Comment[];
  pageNumber: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
}

// ==========================================
// 2. Axios Client Setup
// ==========================================

// ==========================================
// API Request & Response Types
// ==========================================

// --- Shared Types ---
export interface TargetUser {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
}

// --- Post API Types ---
// POST /api/scraps/{postId} & /api/likes/{postId}
// Request: Path Variable postId (number)
// Response: 200 OK (Empty)

// --- Chat API Types ---
// GET /api/chats
export interface ChatroomResponse {
  // 채팅방 목록 반환 구조 (상세 정보 필요 시 추가)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; 
}

// DELETE /api/chats/{chatroomId}/members/my
// Response: 200 OK (Empty)

// PATCH /api/chats/{chatroomId}/members/my
export interface HideChatResponse {
  message: string ;//| null
}

// POST /api/chats/personal
export interface PersonalChatRequest {
  targetUserId: number;
}

export interface PersonalChatResponse {
  chatroomId: number;
  type: string;
  targetUser: TargetUser;
}

// --- Comment API Types ---
// POST /api/comments/{postId}
export interface CreateCommentRequest {
  text: string;
}

// PUT /api/comments/{postId}
export interface UpdateCommentRequest {
  commentId: number;
  text: string;
}

// DELETE /api/comments/{postId}
export interface DeleteCommentRequest {
  commentId: number;
}

// GET /api/comments/allComments/{postId}
export interface GetCommentsRequest {
  size?: number; // default = 20
}

export interface CommentContent {
  id: number;
  text: string;
  userId: number;
  nickname: string;
  createdAt: string; // LocalDateTime
}

export interface CommentPageResponse {
  content: CommentContent[];
  pageNumber: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
}

// map.interface.ts (또는 types.ts)

// 1. 단건 MapResponse 인터페이스
export interface MapResponse {
  postId: number;          // Long -> number
  latitude: number;        // double -> number
  longitude: number;       // double -> number
  thumbnailImageUrl: string;
}


export type MapResponseList = MapResponse[];