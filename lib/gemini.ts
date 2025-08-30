import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key Management System
class GeminiAPIKeyManager {
  private apiKeys: string[] = [];
  private currentKeyIndex: number = 0;
  private exhaustedKeys: Set<string> = new Set();
  private loading: boolean = false;
  private error: string | null = null;

  constructor() {
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey.trim()) {
      console.log('[GeminiKeyManager] Found API key in env');
      this.apiKeys.push(envKey.trim());
    }
    this.loadAdditionalKeys();
  }

  public getError() {
    return this.error;
  }

  public isLoading() {
    return this.loading;
  }

  private async loadAdditionalKeys() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch('/api/gemini/keys');
      if (response.ok) {
        const keys = await response.json();
        this.apiKeys.push(...keys.filter((key: string) => !this.exhaustedKeys.has(key)));
      } else {
        const data = await response.json().catch(() => ({}));
        this.error = data.error || 'Failed to load Gemini API keys.';
      }
    } catch (error: any) {
      this.error = 'Failed to load Gemini API keys.';
    } finally {
      this.loading = false;
    }
  }

  getCurrentKey(): string | null {
    if (this.apiKeys.length === 0) return null;
    return this.apiKeys[this.currentKeyIndex];
  }

  markKeyAsExhausted(key: string) {
    this.exhaustedKeys.add(key);
    this.apiKeys = this.apiKeys.filter(k => k !== key);
    if (this.currentKeyIndex >= this.apiKeys.length) {
      this.currentKeyIndex = 0;
    }
    if (this.apiKeys.length === 0) {
      this.triggerGoldMemberNotification();
    }
  }

  async addNewKey(key: string, addedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate the key with Gemini API
      const testGenAI = new GoogleGenerativeAI(key);
      const model = testGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('test');
      // Add to database
      const response = await fetch('/api/gemini/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, addedBy })
      });
      if (response.ok) {
        await this.loadAdditionalKeys();
        return { success: true, message: 'API key added successfully!' };
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.error || 'Failed to add API key.' };
      }
    } catch (error: any) {
      return { success: false, message: 'Invalid API key or network error.' };
    }
  }

  public triggerGoldMemberNotification() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('geminiKeyExhausted'));
    }
  }

  getKeyStatus() {
    return {
      totalKeys: this.apiKeys.length,
      exhaustedKeys: this.exhaustedKeys.size,
      currentKeyIndex: this.currentKeyIndex,
      hasAvailableKeys: this.apiKeys.length > 0,
      error: this.error,
      loading: this.loading
    };
  }
}

// Global API Key Manager
export const geminiKeyManager = new GeminiAPIKeyManager();

const getGeminiModel = () => {
  const key = geminiKeyManager.getCurrentKey();
  console.log('[getGeminiModel] Current key available:', !!key);
  if (!key) {
    // Trigger the popup for key exhaustion
    geminiKeyManager.triggerGoldMemberNotification();
    throw new Error('No available Gemini API keys');
  }
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
};

export const AI_PERSONAS = {
  assistant: {
    name: 'real.AI',
    personality: 'You are real.AI, a helpful and friendly AI assistant in the chat app "real.". Keep responses concise, friendly, and conversational.',
    capabilities: ['conversation', 'help', 'entertainment']
  },
  tutor: {
    name: 'Study Buddy',
    personality: 'You are Study Buddy, an educational AI tutor. Help users learn and explain complex topics in simple terms.',
    capabilities: ['education', 'explanation', 'study tips']
  },
  creative: {
    name: 'Creative Muse',
    personality: 'You are Creative Muse, an AI that inspires creativity. Help with writing, brainstorming, and creative projects.',
    capabilities: ['writing', 'brainstorming', 'creativity']
  }
};

export const SMART_FEATURES = {
  smartSuggestions: true,
  contentModeration: true,
  aiResponses: true,
  conversationSummary: true
};

export async function generateAIResponse(
  message: string, 
  context: {
    chatType: string;
    username: string;
    messageHistory?: Array<{ role: string; content: string }>;
  },
  persona: keyof typeof AI_PERSONAS = 'assistant'
) {
  console.log('[generateAIResponse] Starting AI response generation for:', message.substring(0, 50));
  try {
    const model = getGeminiModel();
    const selectedPersona = AI_PERSONAS[persona];
    const prompt = `
${selectedPersona.personality}

Context: ${context.chatType} chat, user: ${context.username}
Recent messages: ${context.messageHistory?.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'No recent messages'}

User message: ${message}

Respond as ${selectedPersona.name} in a helpful, engaging way. Keep it under 150 words.
`;
    console.log('[generateAIResponse] Sending prompt to Gemini');
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('[generateAIResponse] Got response:', responseText.substring(0, 100));
    return {
      content: responseText,
      persona: selectedPersona.name,
      confidence: 0.9
    };
  } catch (error: any) {
    console.log('[generateAIResponse] Error:', error.message);
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    // Always re-throw the error so the API route can handle it properly
    throw error;
  }
}

export async function moderateContent(message: string) {
  try {
    const model = getGeminiModel();
    const prompt = `
Analyze this message for inappropriate content (hate speech, harassment, explicit content, spam, personal information).

Message: "${message}"

Respond with only: APPROPRIATE or INAPPROPRIATE
`;
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();
    return {
      isAppropriate: response.includes('appropriate'),
      confidence: 0.9
    };
  } catch (error: any) {
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    return { isAppropriate: true, confidence: 0.5 };
  }
}

export async function generateSmartSuggestions(message: string, context: any) {
  try {
    const model = getGeminiModel();
    const prompt = `
Based on this message, suggest 3 quick reply options (under 30 characters each):

Message: "${message}"

Provide only the suggestions, one per line:
1. [suggestion 1]
2. [suggestion 2]
3. [suggestion 3]
`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const suggestions = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, ''))
      .slice(0, 3);
    return suggestions;
  } catch (error: any) {
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    return [];
  }
}

export async function generateConversationSummary(messages: Array<{ content: string; username: string }>) {
  try {
    const model = getGeminiModel();
    const conversationText = messages
      .map(msg => `${msg.username}: ${msg.content}`)
      .join('\n');
    const prompt = `
Summarize this conversation in 1-2 sentences:

${conversationText}

Provide a concise summary.
`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    return "Unable to generate summary";
  }
}

export async function addGeminiAPIKey(key: string, addedBy: string) {
  return await geminiKeyManager.addNewKey(key, addedBy);
}

export function getGeminiKeyStatus() {
  return geminiKeyManager.getKeyStatus();
}

export default {
  generateAIResponse,
  moderateContent,
  generateSmartSuggestions,
  generateConversationSummary,
  addGeminiAPIKey,
  getGeminiKeyStatus,
  AI_PERSONAS,
  SMART_FEATURES
};
