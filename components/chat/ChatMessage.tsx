import {HandThumbDownIcon, HandThumbUpIcon} from "@heroicons/react/24/outline";
import {HandThumbDownIcon as HandThumbDownSolid, HandThumbUpIcon as HandThumbUpSolid} from "@heroicons/react/24/solid";
import Image from "next/image";

interface Props {
  message_id?: number;
  role: "USER" | "ASSISTANT";
  content: string;
  user_feedback?: "LIKE" | "DISLIKE" | null;
  file_urls?: string[]; // ★ 서버 이미지 URL만
  onFeedback?: (msgId: number, score: "LIKE" | "DISLIKE") => void;
}

export function ChatMessage({
  message_id,
  role,
  content,
  user_feedback,
  file_urls,
  onFeedback,
}: Props) {  
const isUser = role === "USER";
  return (
    <div className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Profile Icon */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
          {isUser ? "나" : "AI"}
        </div>
        
<div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
          {file_urls && file_urls.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
              {file_urls.map((url, idx) => {
                // 1. http로 시작하는 '정상적인 완성된 URL'인지 확인
                const isRealUrl = url && url.startsWith('http');
                // 2. 이미지 확장자 확인
                const isImage = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url);

                return (
                  <div key={idx} className="relative w-48 h-48 rounded-xl overflow-hidden border border-black/5 bg-gray-50 flex items-center justify-center">
                    {/* ★ 핵심: 이미지이면서 동시에 'http'로 시작하는 주소일 때만 Image 태그 렌더링 */}
                    {isImage && isRealUrl ? (
                      <Image
                        src={url}
                        alt="첨부 이미지"
                        fill
                        unoptimized={true}
                        className="object-contain"
                      />
                    ) : isRealUrl ? (
                      // http 주소는 맞는데 이미지가 아닌 경우 (문서 등)
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-500 underline"
                      >
                        파일 다운로드
                      </a>
                    ) : (
                      // http 주소가 아닌 경우 (chat/2025/... 등) - 요청을 보내지 않고 대기 메시지 노출
                      <div className="flex flex-col items-center p-4">
                        <span className="text-[10px] text-gray-400 text-center">이미지 불러오는 중...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        {content && (
            <div
            className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap
                ${isUser
                ? "bg-blue-600 text-white rounded-tr-none"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                }`}
            >
            {content}
            </div>
        )}
          {!isUser && content && message_id && onFeedback && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
              <button onClick={() => onFeedback(message_id, "LIKE")} className="p-1 hover:bg-gray-100 rounded transition-colors group">
                {user_feedback === "LIKE" ? (
                  <HandThumbUpSolid className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <HandThumbUpIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                )}              
                </button>
                <button onClick={() => onFeedback(message_id, "DISLIKE")} className="p-1 hover:bg-gray-100 rounded transition-colors group">
                {user_feedback === "DISLIKE" ? (
                  <HandThumbDownSolid className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <HandThumbDownIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}