// טיפוסים לעוזר

// מצב העוזר
export type AssistantMode = 'nav' | 'ai';

// סוג כוונה (Intent)
export type IntentType = 
  | 'NAV_PAGE'           // ניווט לעמוד
  | 'OPEN_GAME'          // פתיחת משחק
  | 'HELP_CONTACT_FORM'  // עזרה בטופס צור קשר
  | 'FAQ_SITE'           // שאלות נפוצות על האתר
  | 'SMALL_TALK';        // שיחה קטנה

// סוג הודעה בצ'אט
export type MessageRole = 'user' | 'assistant';

// סוג תוצאה
export type ResultType = 'page' | 'game' | 'help' | 'faq';

// תוצאה עשירה
export interface RichResult {
  id: string;
  title: string;
  description: string;
  type: ResultType;
  action: AssistantAction;
  score?: number; // רלוונטיות (0-1)
}

// הודעה בצ'אט
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  actions?: AssistantAction[];
  results?: RichResult[]; // תוצאות חיפוש עשירות
}

// פעולת עוזר
export interface AssistantAction {
  id: string;
  label: string;
  type: 'navigation' | 'info' | 'contact' | 'game';
  path?: string;
  copyText?: string; // טקסט להעתקה (לעזרה בטופס)
}

// תגובת עוזר
export interface AssistantResponse {
  message: string;
  actions: AssistantAction[];
  suggestions?: string[];
  results?: RichResult[]; // תוצאות חיפוש עשירות
  mode?: AssistantMode; // מצב שבו התשובה נוצרה
  intent?: IntentType; // כוונה שזוהתה
}

// היסטוריית צ'אט (localStorage)
export interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: number;
}

