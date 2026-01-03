# Brand-System - מערכת מותג מתקדמת

מערכת מותג מתקדמת המספקת בסיס חזק ומקצועי לאתר שיווקי ציבורי, עם יכולת הרחבה עתידית לאפליקציית Web מלאה (Dashboard + Auth + API).

## 🚀 התחלה מהירה

```bash
# התקנת תלויות
npm install

# הרצת שרת פיתוח
npm run dev

# בניית גרסת production
npm run build

# תצוגה מקדימה של build
npm run preview
```

האפליקציה תרוץ על `http://localhost:4000`

## 📁 מבנה הפרויקט

```
/
├── src/
│   ├── app/              # לוגיקת אפליקציה מרכזית
│   │   ├── App.tsx       # קומפוננטת אפליקציה ראשית
│   │   ├── router.tsx    # הגדרות routing
│   │   └── providers.tsx # Context providers
│   │
│   ├── pages/            # דפי האפליקציה
│   │   ├── Home.tsx
│   │   ├── Overview.tsx
│   │   ├── Capabilities.tsx
│   │   ├── Trust.tsx
│   │   ├── Contact.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/       # קומפוננטות UI
│   │   ├── Layout/       # קומפוננטות layout
│   │   └── UI/           # קומפוננטות UI בסיסיות
│   │
│   ├── features/         # תכונות מודולריות
│   │   ├── theme/        # מערכת ערכות נושא
│   │   └── chat-assistant/ # עוזר צ'אט (stub)
│   │
│   ├── lib/              # כלי עזר
│   │   ├── storage.ts
│   │   ├── classnames.ts
│   │   ├── rtl.ts
│   │   └── accessibility.ts
│   │
│   ├── services/         # שירותים חיצוניים
│   │   ├── apiClient.ts  # לקוח API (stub)
│   │   └── analytics.ts   # Analytics (stub)
│   │
│   └── styles/           # עיצוב גלובלי
│       ├── globals.css
│       ├── tokens.css    # CSS variables
│       └── themes.css    # ערכות נושא
│
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 תכונות עיקריות

### ערכת נושא (Theme System)
- תמיכה במצב כהה ובהיר
- זיהוי אוטומטי של העדפת המערכת
- שמירה ב-localStorage
- מעבר חלק בין מצבים

### RTL & i18n
- תמיכה מלאה ב-RTL לעברית
- מבנה מוכן להרחבה ל-i18n (תמיכה בעתיד באנגלית)

### נגישות (Accessibility)
- ניווט מקלדת מלא
- מצבי focus נראים
- ARIA labels היכן שנדרש
- ניגודיות צבעים בטוחה (WCAG)

### ביצועים
- Lazy loading של routes
- CSS Modules למניעת conflicts
- CSS Variables לעיצוב יעיל
- ללא תלויות כבדות

## 🔄 הרחבה עתידית ל-Web App

המבנה מוכן להרחבה קלה לאפליקציית Web מלאה:

### 1. הוספת Authentication
```typescript
// src/features/auth/
├── auth.store.ts        # ניהול מצב auth
├── AuthProvider.tsx     # Context provider
└── Login.tsx           # דף התחברות
```

### 2. הוספת Dashboard
```typescript
// src/pages/dashboard/
├── Dashboard.tsx
├── Profile.tsx
└── Settings.tsx
```

### 3. חיבור ל-API
```typescript
// src/services/apiClient.ts
// כבר קיים כ-stub - פשוט להרחיב עם:
- Token management
- Request interceptors
- Error handling
- Retry logic
```

### 4. הוספת Middleware
```typescript
// src/middleware/
├── auth.middleware.ts   # בדיקת auth
└── geo.middleware.ts    # geo-blocking (placeholder)
```

### 5. Protected Routes
```typescript
// src/app/router.tsx
// הוסף:
- <ProtectedRoute> wrapper
- Role-based access control
```

## 🛠️ טכנולוגיות

- **Vite** - Build tool מהיר
- **React 18** - ספריית UI
- **TypeScript** - Type safety
- **React Router v6** - ניהול routing
- **CSS Modules** - Styling מבודד

## 📝 הערות פיתוח

- כל הקוד כולל הערות בעברית במקומות הנדרשים
- מבנה מודולרי וניתן להרחבה
- הפרדה ברורה בין UI, לוגיקה ושכבת נתונים
- ללא hardcoded credentials או סודות

## 🧪 Testing

מבנה מוכן להוספת tests:
- Unit tests (Jest/Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright/Cypress)

## 📦 Deployment

```bash
npm run build
```

הקבצים ייבנו לתיקייה `dist/` ומוכנים לפריסה לכל static hosting (Vercel, Netlify, AWS S3, וכו').

## 🔐 אבטחה

- אין hardcoded passwords או credentials
- Geo-blocking מוכן להטמעה (placeholder)
- API client מוכן להוספת authentication headers

## 📄 רישיון

כל הזכויות שמורות © 2024 M.P.papis

