// Adapter לעוזר - מוכן לחיבור AI עתידי
import type { AssistantAction, AssistantResponse, AssistantMode, IntentType, RichResult } from './assistant.types';

// טיפוס למשחק (sync עם games.json)
interface GameData {
  id: string;
  title: string;
  description: string;
  folder: string;
  badges?: string[];
}

// רשימת משחקים - נטען דינמית מ-JSON
let gamesCache: GameData[] = [];
let gamesLoadError: string | null = null;

// רשימת עמודים (מקור אמת מה-router)
const PAGES = [
  { 
    id: 'home', 
    path: '/', 
    title: 'בית', 
    description: 'דף הבית',
    keywords: ['בית', 'ראשי', 'home', 'דף הבית'],
    synonyms: ['אודות', 'ראשי']
  },
  { 
    id: 'overview', 
    path: '/overview', 
    title: 'סקירה', 
    description: 'מידע על המערכת והחזון',
    keywords: ['סקירה', 'overview', 'מידע', 'הסבר', 'אודות', 'חזון'],
    synonyms: ['אודות', 'מידע', 'הסבר']
  },
  { 
    id: 'capabilities', 
    path: '/capabilities', 
    title: 'יכולות', 
    description: 'רשימת השירותים והכישורים',
    keywords: ['יכולות', 'capabilities', 'שירותים', 'מה אנחנו עושים', 'services'],
    synonyms: ['שירותים', 'services', 'מה אתם עושים']
  },
  { 
    id: 'trust', 
    path: '/trust', 
    title: 'אמון', 
    description: 'למה לבחור בנו',
    keywords: ['אמון', 'trust', 'אמינות', 'למה לבחור', 'למה אנחנו'],
    synonyms: ['למה לבחור', 'אמינות']
  },
  { 
    id: 'games', 
    path: '/games', 
    title: 'משחקים', 
    description: 'אוסף משחקים להעברת הזמן',
    keywords: ['משחקים', 'games', 'לשחק', 'בידור', 'להעביר את הזמן'],
    synonyms: ['להעביר את הזמן', 'בידור']
  },
  { 
    id: 'contact', 
    path: '/contact', 
    title: 'צור קשר', 
    description: 'טופס יצירת קשר',
    keywords: ['צור קשר', 'contact', 'יצירת קשר', 'טופס', 'הודעה'],
    synonyms: ['הודעה', 'טופס', 'יצירת קשר']
    // הערה: אין טלפון/כתובת באתר - לא להציע אותם
  },
];

class AssistantAdapter {
  private navigate: ((path: string) => void) | null = null;
  private mode: AssistantMode = 'nav';
  private currentPage: string = "";

  setNavigate(navigate: (path: string) => void): void {
    this.navigate = navigate;
  }

  setCurrentPage(path: string): void {
    this.currentPage = path;
  }

  getCurrentPage(): string | null {
    return this.currentPage || null;
  }

  getMode(): AssistantMode {
    const envMode = import.meta.env.VITE_ASSISTANT_MODE;
    if (envMode === 'ai') {
      return 'ai';
    }
    return this.mode;
  }

  setMode(mode: AssistantMode): void {
    this.mode = mode;
  }

  // טעינת משחקים מ-JSON
  async loadGames(): Promise<GameData[]> {
    if (gamesCache.length > 0) {
      return gamesCache;
    }

    try {
      const response = await fetch('/games/games.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      gamesCache = data.games ?? [];
      gamesLoadError = null;
      return gamesCache;
    } catch (err) {
      gamesLoadError = err instanceof Error ? err.message : 'שגיאה בטעינת המשחקים';
      gamesCache = [];
      return [];
    }
  }

  getGamesLoadError(): string | null {
    return gamesLoadError;
  }

  resetGamesCache(): void {
    gamesCache = [];
    gamesLoadError = null;
  }

  // Fallback מינימלי אם games.json נכשל
  getFallbackActions(): AssistantAction[] {
    return [
      {
        id: 'fallback-overview',
        label: 'סקירה',
        type: 'navigation',
        path: '/overview',
      },
      {
        id: 'fallback-capabilities',
        label: 'יכולות',
        type: 'navigation',
        path: '/capabilities',
      },
      {
        id: 'fallback-contact',
        label: 'צור קשר',
        type: 'contact',
        path: '/contact',
      },
    ];
  }

  // בדיקה אם יש שגיאת טעינה
  hasGamesLoadError(): boolean {
    return gamesLoadError !== null;
  }

  getInitialActions(): AssistantAction[] {
    return [
      {
        id: 'quick-games',
        label: 'משחקים',
        type: 'game',
        path: '/games',
      },
      {
        id: 'quick-overview',
        label: 'סקירה כללית',
        type: 'navigation',
        path: '/overview',
      },
      {
        id: 'quick-capabilities',
        label: 'השירותים שלנו',
        type: 'navigation',
        path: '/capabilities',
      },
      {
        id: 'quick-contact',
        label: 'צור קשר',
        type: 'contact',
        path: '/contact',
      },
    ];
  }

  // זיהוי כוונה (Intent Detection)
  detectIntent(query: string): IntentType {
    const lowerQuery = query.toLowerCase().trim();

    // HELP_CONTACT_FORM
    if (
      lowerQuery.includes('מה לרשום') ||
      lowerQuery.includes('איך ממלאים') ||
      lowerQuery.includes('ניסוח') ||
      lowerQuery.includes('תבנית') ||
      lowerQuery.includes('השאיר פרטים') ||
      lowerQuery.includes('הצעת מחיר') ||
      lowerQuery.includes('שאלה')
    ) {
      return 'HELP_CONTACT_FORM';
    }

    // OPEN_GAME
    if (
      lowerQuery.includes('שחק') ||
      lowerQuery.includes('פתח משחק') ||
      lowerQuery.includes('משחק') && (lowerQuery.includes('פתח') || lowerQuery.includes('שחק'))
    ) {
      return 'OPEN_GAME';
    }

    // NAV_PAGE
    if (
      lowerQuery.includes('פתח') ||
      lowerQuery.includes('תעביר') ||
      lowerQuery.includes('קח אותי') ||
      lowerQuery.includes('מעבר') ||
      lowerQuery.includes('נווט') ||
      lowerQuery.includes('איפה')
    ) {
      return 'NAV_PAGE';
    }

    // FAQ_SITE
    if (
      lowerQuery.includes('מה אתם עושים') ||
      lowerQuery.includes('מה השירותים') ||
      lowerQuery.includes('למה לבחור') ||
      lowerQuery.includes('איך זה עובד')
    ) {
      return 'FAQ_SITE';
    }

    // SMALL_TALK
    if (
      lowerQuery.includes('בוקר') ||
      lowerQuery.includes('תודה') ||
      lowerQuery.includes('מי אתה') ||
      lowerQuery.includes('שלום') ||
      lowerQuery === 'היי' ||
      lowerQuery === 'הי'
    ) {
      return 'SMALL_TALK';
    }

    // Default - NAV_PAGE
    return 'NAV_PAGE';
  }

  // Help Contact Form - תרחישים מוכנים
  handleContactFormHelp(query: string): AssistantResponse {
    const lowerQuery = query.toLowerCase().trim();
    
    let message = '';
    let copyText = '';

    if (lowerQuery.includes('השאיר פרטים') || lowerQuery.includes('פרטים')) {
      message = 'ניתן להשאיר פרטים בסיסיים. מלא שם, דוא"ל והודעה קצרה.';
      copyText = 'שלום,\nאני מעוניין לקבל מידע נוסף.\nתודה.';
    } else if (lowerQuery.includes('הצעת מחיר') || lowerQuery.includes('מחיר')) {
      message = 'להצעת מחיר, ציין את סוג השירות המבוקש ופרטים רלוונטיים.';
      copyText = 'שלום,\nאני מעוניין בהצעת מחיר עבור [ציין שירות].\nאשמח לקבל פרטים נוספים.\nתודה.';
    } else if (lowerQuery.includes('שאלה') || lowerQuery.includes('לשאול')) {
      message = 'ניתן לשאול כל שאלה. נשתדל לענות בהקדם.';
      copyText = 'שלום,\nיש לי שאלה: [ציין את השאלה שלך].\nתודה.';
    } else {
      // ברירת מחדל
      message = 'בטופס צור קשר תוכל למלא שם, דוא"ל והודעה. מומלץ לכתוב הודעה קצרה וברורה.';
      copyText = 'שלום,\n[כתוב את ההודעה שלך כאן].\nתודה.';
    }

    return {
      message,
      actions: [
        {
          id: 'open-contact',
          label: 'פתח עמוד צור קשר',
          type: 'contact',
          path: '/contact',
        },
        {
          id: 'copy-text',
          label: 'העתק ניסוח',
          type: 'info',
          copyText,
        },
      ],
      intent: 'HELP_CONTACT_FORM',
    };
  }

  // FAQ Site - שאלות נפוצות
  handleFAQ(query: string): AssistantResponse {
    const lowerQuery = query.toLowerCase().trim();
    
    if (lowerQuery.includes('מה אתם עושים') || lowerQuery.includes('מה השירותים')) {
      return {
        message: 'אנו מספקים פתרונות מקיפים לבניית זהות מותג מקצועית: פיתוח זהות מותג, עיצוב גרפי, פיתוח דיגיטלי, ייעוץ אסטרטגי, ניהול תוכן וניתוח ביצועים.',
        actions: [
          {
            id: 'view-capabilities',
            label: 'פתח עמוד יכולות',
            type: 'navigation',
            path: '/capabilities',
          },
        ],
        intent: 'FAQ_SITE',
      };
    }

    if (lowerQuery.includes('למה לבחור') || lowerQuery.includes('למה אנחנו')) {
      return {
        message: 'אנו מתמחים בבניית זהות מותג מקצועית ומקיפה. צוות מנוסה, גישה מותאמת אישית ותוצאות מוכחות.',
        actions: [
          {
            id: 'view-trust',
            label: 'פתח עמוד אמון',
            type: 'navigation',
            path: '/trust',
          },
        ],
        intent: 'FAQ_SITE',
      };
    }

    if (lowerQuery.includes('איך זה עובד') || lowerQuery.includes('איך יוצרים קשר')) {
      return {
        message: 'ניתן ליצור קשר דרך טופס צור קשר. מלא פרטים ונחזור אליך בהקדם.',
        actions: [
          {
            id: 'open-contact',
            label: 'פתח טופס צור קשר',
            type: 'contact',
            path: '/contact',
          },
        ],
        intent: 'FAQ_SITE',
      };
    }

    // Fallback
    return {
      message: 'ניתן למצוא מידע נוסף בעמודי הסקירה והיכולות.',
      actions: [
        {
          id: 'view-overview',
          label: 'פתח עמוד סקירה',
          type: 'navigation',
          path: '/overview',
        },
        {
          id: 'view-capabilities',
          label: 'פתח עמוד יכולות',
          type: 'navigation',
          path: '/capabilities',
        },
      ],
      intent: 'FAQ_SITE',
    };
  }

  // Small Talk
  handleSmallTalk(query: string): AssistantResponse {
    const lowerQuery = query.toLowerCase().trim();
    
    let message = '';
    
    if (lowerQuery.includes('בוקר')) {
      message = 'בוקר טוב. איך אוכל לעזור?';
    } else if (lowerQuery.includes('תודה')) {
      message = 'בבקשה. יש עוד משהו שאוכל לעזור?';
    } else if (lowerQuery.includes('מי אתה') || lowerQuery.includes('מה אתה')) {
      message = 'אני עוזר האתר. אני מסייע בניווט, שירותים וטופס צור קשר.';
    } else {
      message = 'שלום. איך אוכל לעזור?';
    }

    return {
      message,
      actions: this.getInitialActions(),
      intent: 'SMALL_TALK',
    };
  }

  // חיפוש משחקים - מחזיר RichResults
  async searchGames(query: string): Promise<RichResult[]> {
    const games = await this.loadGames();
    const lowerQuery = query.toLowerCase().trim();
    const results: RichResult[] = [];

    games.forEach(game => {
      const searchableText = `${game.title} ${game.description} ${game.id}`.toLowerCase();
      const match = 
        searchableText.includes(lowerQuery) ||
        lowerQuery.includes(game.title.toLowerCase()) ||
        game.title.toLowerCase().includes(lowerQuery);

      if (match) {
        results.push({
          id: `game-${game.id}`,
          title: game.title,
          description: game.description,
          type: 'game',
          action: {
            id: `game-${game.id}`,
            label: `שחק ${game.title}`,
            type: 'game',
            path: `/games/${game.folder}/index.html`,
          },
          score: 0.8,
        });
      }
    });

    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // חיפוש עמודים - מחזיר RichResults
  searchPages(query: string): RichResult[] {
    const lowerQuery = query.toLowerCase().trim();
    const results: RichResult[] = [];

    PAGES.forEach(page => {
      const allKeywords = [...page.keywords, ...page.synonyms, page.title.toLowerCase()];
      const match = allKeywords.some(kw => 
        lowerQuery.includes(kw.toLowerCase()) || 
        kw.toLowerCase().includes(lowerQuery)
      );

      if (match && page.id !== 'home') {
        results.push({
          id: `page-${page.id}`,
          title: page.title,
          description: page.description,
          type: 'page',
          action: {
            id: `page-${page.id}`,
            label: page.title,
            type: 'navigation',
            path: page.path,
          },
          score: 0.9,
        });
      }
    });

    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // חיפוש חכם - מחזיר RichResults
  async searchQuery(query: string): Promise<AssistantResponse> {
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) {
      return {
        message: '',
        actions: this.getInitialActions(),
      };
    }

    const results: RichResult[] = [];
    let hasGamesError = false;
    
    // חיפוש משחקים (עם fallback)
    try {
      const games = await this.searchGames(query);
      results.push(...games);
    } catch (err) {
      hasGamesError = this.hasGamesLoadError();
    }

    // חיפוש עמודים
    const pages = this.searchPages(query);
    results.push(...pages);

    // הגבלת תוצאות ל-8
    const limitedResults = results.slice(0, 8);

    // אם אין תוצאות - fallback
    if (limitedResults.length === 0) {
      const fallbackActions = this.getFallbackActions();
      return {
        message: hasGamesError 
          ? 'חלק מהתוכן לא נטען כרגע. הנה אפשרויות זמינות:'
          : 'לא מצאתי תוצאות. נסה מילות מפתח אחרות.',
        actions: hasGamesError ? fallbackActions : this.getInitialActions(),
        suggestions: ['שירותים', 'צור קשר', 'סקירה'],
      };
    }

    // המרת RichResults ל-Actions
    const actions: AssistantAction[] = limitedResults.map(r => r.action);

    let message = '';
    if (limitedResults.length === 1) {
      message = 'נמצאה תוצאה אחת.';
    } else {
      message = `נמצאו ${limitedResults.length} תוצאות.`;
    }

    // הוספת הודעה קטנה אם יש שגיאת משחקים
    if (hasGamesError && limitedResults.length > 0) {
      message += ' (חלק מהתוכן לא נטען כרגע)';
    }

    return {
      message,
      actions,
      results: limitedResults,
      mode: 'nav',
    };
  }

  private handlePageAwareAction(): AssistantResponse {
    // TODO: implement if needed
    return {
      message: 'איך אוכל לעזור?',
      actions: this.getInitialActions(),
    };
  }

  async processAction(actionId: string): Promise<AssistantResponse> {
    // Page-aware actions (page-what-here, page-recommended, etc.)
    if (actionId.startsWith('page-') && (actionId.includes('what-here') || actionId.includes('recommended') || actionId.includes('help-form') || actionId.includes('play-game'))) {
      return this.handlePageAwareAction();
    }
    
    if (actionId.startsWith('game-')) {
      const gameId = actionId.replace('game-', '');
      const games = await this.loadGames();
      const game = games.find(g => g.id === gameId);
      if (game) {
        return {
          message: `פותח ${game.title}.`,
          actions: [{
            id: actionId,
            label: game.title,
            type: 'game',
            path: `/games/${game.folder}/index.html`,
          }],
        };
      }
    }

    // Regular page navigation (page-overview, page-capabilities, etc.)
    if (actionId.startsWith('page-')) {
      const pageId = actionId.replace('page-', '');
      const page = PAGES.find(p => p.id === pageId);
      if (page) {
        this.navigate?.(page.path);
        return {
          message: `מעביר ל${page.title}.`,
          actions: [],
        };
      }
    }

    // פעולות מהירות
    switch (actionId) {
      case 'quick-games':
        this.navigate?.('/games');
        return { message: 'מעביר לעמוד המשחקים.', actions: [] };
      case 'quick-overview':
        this.navigate?.('/overview');
        return { message: 'עמוד הסקירה מספק מידע על המערכת.', actions: [] };
      case 'quick-capabilities':
        this.navigate?.('/capabilities');
        return { message: 'רשימת השירותים והכישורים.', actions: [] };
      case 'quick-contact':
        this.navigate?.('/contact');
        return { message: 'מעביר לטופס יצירת קשר.', actions: [] };
      default:
        return { message: 'פעולה לא מזוהה.', actions: this.getInitialActions() };
    }
  }

  // Intent Router - מזהה כוונה ומחליט NAV או AI
  async processQuery(query: string): Promise<AssistantResponse> {
    const intent = this.detectIntent(query);

    // טיפול בכוונות ספציפיות
    if (intent === 'HELP_CONTACT_FORM') {
      return this.handleContactFormHelp(query);
    }

    if (intent === 'FAQ_SITE') {
      return this.handleFAQ(query);
    }

    if (intent === 'SMALL_TALK') {
      return this.handleSmallTalk(query);
    }

    if (intent === 'OPEN_GAME') {
      // חיפוש משחק ספציפי
      const games = await this.searchGames(query);
      if (games.length > 0) {
        return {
          message: `נמצא משחק: ${games[0].title}.`,
          actions: [games[0].action],
          results: [games[0]],
          intent: 'OPEN_GAME',
        };
      }
      return {
        message: 'לא מצאתי משחק. נסה "פתח משחק פונג" או "משחקים".',
        actions: [
          { id: 'all-games', label: 'כל המשחקים', type: 'game', path: '/games' },
        ],
        intent: 'OPEN_GAME',
      };
    }

    if (intent === 'NAV_PAGE') {
      // חיפוש/ניווט רגיל
      return this.searchQuery(query);
    }

    // Fallback - AI Mode (אם מופעל)
    return this.processAIQuery(query);
  }

  // AI Mode דרך Proxy
  async processAIQuery(query: string, history?: Array<{ role: string; content: string }>): Promise<AssistantResponse> {
    if (this.getMode() !== 'ai') {
      // Fallback ל-NAV
      const navResponse = await this.searchQuery(query);
      return { ...navResponse, mode: 'nav' };
    }

    try {
      // שלב B - AI Proxy
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 שניות timeout

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: {
            pages: PAGES.map(p => ({ id: p.id, title: p.title, path: p.path, description: p.description })),
            mode: 'gov-style',
            currentPage: this.currentPage || null,
          },
          history: history ? history.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })) : [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // System Rules - וידוא שיש פעולה + הגבלות
      let message = data.message || 'לא הצלחתי לענות על השאלה. נסה לשאול אחרת או פנה לטופס צור קשר.';
      
      // הגבלה: לא לבקש מידע רגיש
      if (message.includes('תעודת זהות') || message.includes('כרטיס אשראי') || message.includes('סיסמה')) {
        message = 'אני לא יכול לעזור עם מידע רגיש. נא פנה לטופס צור קשר.';
      }
      
      // הגבלה: רק הקשר האתר
      if (!message.includes('אתר') && !message.includes('שירות') && !message.includes('משחק') && !message.includes('צור קשר')) {
        // אם התשובה לא רלוונטית לאתר - הפנה ל-Contact
        message = 'אני מסייע רק בהתמצאות באתר. לשאלות אחרות, נא פנה לטופס צור קשר.';
      }
      
      const actions = data.actions || [];
      if (actions.length === 0) {
        actions.push({
          id: 'fallback-contact',
          label: 'פתח טופס צור קשר',
          type: 'contact',
          path: '/contact',
        });
      }
      
      return {
        message,
        actions,
        mode: 'ai',
      };
    } catch (err) {
      // Offline/Fail - fallback ל-NAV
      console.warn('AI request failed, falling back to NAV:', err);
      const navResponse = await this.searchQuery(query);
      return {
        ...navResponse,
        message: navResponse.message || 'לא הצלחתי כרגע. נסה שוב או עבור לניווט.',
        mode: 'nav',
      };
    }
  }
}

export const assistantAdapter = new AssistantAdapter();
