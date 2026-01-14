/** UI에서 고정으로 쓰는 질문 ID */
export type SurveyQuestionId =
  | "organize"
  | "reason"
  | "context"
  | "reuse_reason"
  | "one_line"
  | "email";

/** UI에서 사용하는 질문 타입 */
export type SurveyQuestion =
  | {
      id: SurveyQuestionId;
      type: "single";
      question: string;
      options: string[];
      optional?: boolean;
    }
  | {
      id: SurveyQuestionId;
      type: "text";
      question: string;
      optional?: boolean;
      maxLength?: number;
      placeholder?: string;
    }
  | {
      id: SurveyQuestionId;
      type: "email";
      question: string;
      optional?: boolean;
      placeholder?: string;
      helperText?: string;
    }
  | {
      type: "done";
      title: string;
      desc?: string;
      autoCloseMs?: number;
    };

export type SurveyContent = {
  title: string;
  subtitle?: string;
  footer?: string;
  questions: SurveyQuestion[];
};

/** 서버 응답 타입 (백엔드 UseCase 스펙 그대로) */
export type SurveyResponse =
  | {
      show: false;
      reason:
        | "no_active_template"
        | "invalid_payload"
        | "already_responded";
    }
  | {
      show: true;
      title?: string;
      subtitle?: string;
      footer?: string;
      version: number;
      questions: unknown; // 서버에서 잘못 내려와도 방어하려고 unknown
    };

export const DEFAULT_DONE: SurveyQuestion = {
  type: "done",
  title: "감사합니다! 의견이 큰 도움이 돼요 💗",
  desc: "당신의 피드백은 더 좋은 서비스를 만드는 데 사용될 거예요.",
  autoCloseMs: 1500,
};

// ---------- Runtime validators ----------
const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(isNonEmptyString);

// SurveyQuestionId 런타임 체크(서버가 이상한 id 내려줄 수 있음)
const VALID_IDS: SurveyQuestionId[] = [
  "organize",
  "reason",
  "context",
  "reuse_reason",
  "one_line",
  "email",
];
const isValidId = (v: unknown): v is SurveyQuestionId =>
  typeof v === "string" && (VALID_IDS as string[]).includes(v);

const isSurveyQuestion = (q: any): q is SurveyQuestion => {
  if (!q || typeof q !== "object") return false;

  if (q.type === "single") {
    return isValidId(q.id) && isNonEmptyString(q.question) && isStringArray(q.options);
  }
  if (q.type === "text") {
    return isValidId(q.id) && isNonEmptyString(q.question);
  }
  if (q.type === "email") {
    return isValidId(q.id) && isNonEmptyString(q.question);
  }
  if (q.type === "done") {
    return isNonEmptyString(q.title);
  }
  return false;
};

const normalizeQuestions = (raw: unknown): SurveyQuestion[] => {
  if (!Array.isArray(raw)) return [];

  const valid = raw.filter(isSurveyQuestion);

  // done 자동 추가
  const hasDone = valid.some((q) => q.type === "done");
  return hasDone ? valid : [...valid, DEFAULT_DONE];
};

/**
 * 서버 응답을 UI에서 바로 쓸 SurveyContent로 변환.
 * - show=false면 null 반환 (정상 케이스)
 * - show=true인데 데이터 이상하면 null + debug 로그용 info 반환 가능
 */
export const parseSurveyResponse = (
  data: SurveyResponse
): { content: SurveyContent | null; reason?: string } => {
  if (!data || typeof data !== "object") return { content: null, reason: "invalid_response" };

  if (data.show === false) {
    return { content: null, reason: data.reason };
  }

  const questions = normalizeQuestions(data.questions);
  if (questions.length === 0) {
    return { content: null, reason: "no_valid_questions" };
  }

  return {
    content: {
      title: data.title || "간단한 피드백을 들려주세요",
      subtitle: data.subtitle,
      footer: data.footer,
      questions,
    },
  };
};
