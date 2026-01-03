// AI Proxy Endpoint - Stub (מוכן לחיבור אמיתי)
// זהו קובץ stub - בשרת אמיתי זה יהיה endpoint Node.js/Express

// System Rules קשוחים
const SYSTEM_RULES = `
אתה עוזר אתר ממשלתי. חוקים:
1. ענה רק על האתר: ניווט, שירותים, משחקים, טופס צור קשר
2. אל תבקש/תקבל מידע רגיש (ת"ז, כרטיס אשראי, סיסמאות)
3. תמיד הצע פעולה בסוף (כפתור אחד לפחות)
4. אם לא בטוח → הפנה ל"צור קשר"
5. תשובות קצרות: 2-5 שורות
6. טון: ענייני, קצר, לא מתחנף, עברית תקנית
`;

// זהו stub - לא חיבור אמיתי
// בשרת אמיתי: חיבור ל-OpenAI/Claude דרך API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, context, history } = req.body;

  // Rate limit stub (בשרת אמיתי: Redis/Memory store)
  // Timeout: 15 שניות (כבר ב-client)

  // System Rules validation
  // בשרת אמיתי: שליחה ל-AI עם SYSTEM_RULES + context

  // Stub response
  return res.status(200).json({
    message: 'תכונה זו תהיה זמינה בקרוב. נסה לשאול על ניווט או שירותים.',
    actions: [
      {
        id: 'fallback-contact',
        label: 'פתח טופס צור קשר',
        type: 'contact',
        path: '/contact',
      },
    ],
  });
}

