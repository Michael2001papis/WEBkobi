import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assistantService } from './assistant.service';
import { assistantAdapter } from './assistant.adapter';
import type { ChatMessage, AssistantAction, AssistantResponse } from './assistant.types';
import { storage } from '@/lib/storage';
import { Button } from '@/components/UI/Button';
import styles from './assistant.widget.module.css';

const CHAT_HISTORY_KEY = 'assistant_chat_history';
const MAX_HISTORY_MESSAGES = 10;

export function ChatAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    assistantAdapter.setNavigate(navigate);
    assistantAdapter.setCurrentPage(location.pathname);
  }, [navigate, location.pathname]);

  // טעינת היסטוריה מ-localStorage
  useEffect(() => {
    if (isOpen) {
      const history = storage.get<{ messages: ChatMessage[] }>(CHAT_HISTORY_KEY, { messages: [] });
      if (history.messages && history.messages.length > 0) {
        // שמור רק 10 הודעות אחרונות
        const recentMessages = history.messages.slice(-MAX_HISTORY_MESSAGES);
        setMessages(recentMessages);
      } else {
        // הודעה ראשונית
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'שלום. איך אוכל לעזור?',
          timestamp: Date.now(),
        }]);
      }
    }
  }, [isOpen]);

  // שמירת היסטוריה ב-localStorage
  useEffect(() => {
    if (messages.length > 0) {
      storage.set(CHAT_HISTORY_KEY, {
        messages: messages.slice(-MAX_HISTORY_MESSAGES),
        lastUpdated: Date.now(),
      });
    }
  }, [messages]);

  // Auto-scroll למטה כשמוסיפים הודעה
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // נקה שיחה וסגירה
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setInputValue('');
    setError(null);
  }, []);

  // Focus trap - Tab לא יוצא מהפאנל
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const focusableElements = panel.querySelectorAll<HTMLElement>(
      'input, button, a, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // שמירת focus לפני פתיחה
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // ESC לסגירה
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  // שליחת הודעה (עם Debounce)
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // ביטול debounce קודם
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setSelectedResultIndex(-1);

    try {
      // Debounce 300ms - רק אם זה חיפוש (לא פעולה ישירה)
      const isSearchQuery = text.trim().length > 2 && !text.trim().startsWith('פתח') && !text.trim().startsWith('קח');
      
      if (isSearchQuery) {
        // Debounce לחיפוש
        await new Promise(resolve => {
          debounceTimeoutRef.current = setTimeout(resolve, 300);
        });
      }

      // Intent Router - מזהה כוונה ומחליט NAV או AI
      const response: AssistantResponse = await assistantService.processQuery(text.trim(), messages.slice(-10));
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        actions: response.actions,
        results: response.results,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'לא הצלחתי כרגע. נסה שוב או עבור לניווט.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  // ביצוע פעולה
  const handleAction = useCallback(async (action: AssistantAction) => {
    // העתקת טקסט
    if (action.copyText) {
      try {
        await navigator.clipboard.writeText(action.copyText);
        // הודעה קצרה (אופציונלי)
        const copyMessage: ChatMessage = {
          id: `copy-${Date.now()}`,
          role: 'assistant',
          content: 'הטקסט הועתק ללוח.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, copyMessage]);
      } catch (err) {
        console.warn('Failed to copy text:', err);
      }
    }

    if (action.path) {
      if (action.type === 'game' && action.path.includes('/games/') && action.path.endsWith('.html')) {
        // משחק - פתח בחלון חדש (העוזר נשאר פתוח)
        window.open(action.path, '_blank', 'noopener,noreferrer');
      } else {
        // עמוד - נווט וסגור
        navigate(action.path);
        handleClose();
      }
    }
  }, [navigate, handleClose]);

  // Quick Actions
  const quickActions = [
    { id: 'quick-services', label: 'שירותים', path: '/capabilities' },
    { id: 'quick-contact', label: 'צור קשר', path: '/contact' },
    { id: 'quick-games', label: 'משחקים', path: '/games' },
    { id: 'quick-how', label: 'איך זה עובד?', query: 'איך זה עובד' },
  ];

  const handleQuickAction = useCallback(async (action: typeof quickActions[0]) => {
    if (action.path) {
      navigate(action.path);
      handleClose();
    } else if (action.query) {
      await handleSend(action.query);
    }
  }, [navigate, handleSend, handleClose]);

  // נקה שיחה
  const handleClearChat = useCallback(() => {
    storage.remove(CHAT_HISTORY_KEY);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'שלום. איך אוכל לעזור?',
      timestamp: Date.now(),
    }]);
  }, []);

  // ניווט מקלדת - חצים + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // אם יש תוצאה נבחרת - פעל עליה
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.results && selectedResultIndex >= 0 && selectedResultIndex < lastMessage.results.length) {
        handleAction(lastMessage.results[selectedResultIndex].action);
        return;
      }
      
      // אחרת - שלח הודעה
      handleSend(inputValue);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.results) {
        setSelectedResultIndex(prev => 
          prev < lastMessage.results!.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex(prev => (prev > 0 ? prev - 1 : -1));
    }
  };

  if (!assistantService.getInitialActions().length) {
    return null;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(true)}
        aria-label="פתח עוזר האתר"
        title="עוזר האתר"
      >
        <span className={styles.icon} aria-hidden="true">💬</span>
      </button>

      {isOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={handleClose}
            aria-hidden="true"
          />
          <div 
            ref={panelRef}
            className={styles.panel} 
            role="dialog" 
            aria-label="עוזר האתר" 
            aria-modal="true"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2>עוזר האתר</h2>
                <p className={styles.subtitle}>עזרה בניווט, שירותים וטופס צור קשר</p>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={handleClose}
                aria-label="סגור"
              >
                ×
              </button>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={styles.quickAction}
                  onClick={() => handleQuickAction(action)}
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
              <div className={styles.messages}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${styles[`message-${message.role}`]}`}
                  >
                    <div className={styles.messageBubble}>
                      <p>{message.content}</p>
                      
                      {/* תוצאות עשירות */}
                      {message.results && message.results.length > 0 && (
                        <div className={styles.results}>
                          {message.results.map((result, idx) => (
                            <div
                              key={result.id}
                              className={`${styles.result} ${selectedResultIndex === idx ? styles.resultSelected : ''}`}
                              onClick={() => handleAction(result.action)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleAction(result.action);
                                }
                              }}
                            >
                              <div className={styles.resultHeader}>
                                <span className={styles.resultTitle}>{result.title}</span>
                                <span className={styles.resultType}>{result.type === 'page' ? 'עמוד' : result.type === 'game' ? 'משחק' : 'עזרה'}</span>
                              </div>
                              <p className={styles.resultDescription}>{result.description}</p>
                              <span className={styles.resultAction}>
                                {result.type === 'game' ? 'שחק (חלון חדש)' : result.type === 'page' ? 'פתח עמוד' : 'עזור לי'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* פעולות רגילות */}
                      {message.actions && message.actions.length > 0 && (
                        <div className={styles.messageActions}>
                          {message.actions.map((action) => (
                            <Button
                              key={action.id}
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAction(action)}
                              className={styles.actionButton}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading */}
                {isLoading && (
                  <div className={`${styles.message} ${styles['message-assistant']}`}>
                    <div className={styles.messageBubble}>
                      <div className={styles.loading}>
                        <span className={styles.spinner} aria-hidden="true"></span>
                        <span>מחשב תשובה...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.input}
                  placeholder="הקלד שאלה או בקשה..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="הקלד הודעה"
                  disabled={isLoading}
                />
                <button
                  ref={sendButtonRef}
                  type="button"
                  className={styles.sendButton}
                  onClick={() => handleSend(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="שלח"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearChat}
                aria-label="נקה שיחה"
              >
                נקה שיחה
              </button>
            </div>

            {/* Disclaimer */}
            <div className={styles.disclaimer}>
              <p>אל תשתף מידע רגיש. העוזר מסייע בהתמצאות באתר.</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
