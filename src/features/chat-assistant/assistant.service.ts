// שירות עוזר - לוגיקה מרכזית
import { assistantAdapter } from './assistant.adapter';
import type { AssistantAction, AssistantResponse } from './assistant.types';

class AssistantService {
  private isEnabled(): boolean {
    const flag = import.meta.env.VITE_ENABLE_CHAT_ASSISTANT;
    return flag === 'true' || flag === undefined;
  }

  async handleAction(actionId: string): Promise<AssistantResponse> {
    if (!this.isEnabled()) {
      return {
        message: 'העוזר אינו זמין כרגע.',
        actions: [],
      };
    }

    return await assistantAdapter.processAction(actionId);
  }

  getInitialActions(): AssistantAction[] {
    if (!this.isEnabled()) {
      return [];
    }

    return assistantAdapter.getInitialActions();
  }

  getInitialMessage(): string {
    return '';
  }

  async searchQuery(query: string): Promise<AssistantResponse> {
    if (!this.isEnabled()) {
      return {
        message: 'העוזר אינו זמין כרגע.',
        actions: [],
      };
    }

    return assistantAdapter.searchQuery(query);
  }

  // Intent Router - מזהה כוונה ומחליט NAV או AI
  async processQuery(query: string, history?: Array<{ role: string; content: string }>): Promise<AssistantResponse> {
    if (!this.isEnabled()) {
      return {
        message: 'העוזר אינו זמין כרגע.',
        actions: [],
      };
    }

    const response = await assistantAdapter.processQuery(query);
    
    // אם זה AI mode - העבר history
    if (response.mode === 'ai' && history) {
      return assistantAdapter.processAIQuery(query, history);
    }
    
    return response;
  }
}

export const assistantService = new AssistantService();

