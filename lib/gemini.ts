import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key Management System
class GeminiAPIKeyManager {
  private apiKeys: string[] = [];
  private currentKeyIndex: number = 0;
  private exhaustedKeys: Set<string> = new Set();

  constructor() {
    // Initialize with environment variable
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey) {
      this.apiKeys.push(envKey);
    }
    
    // Load additional keys from database/storage
    this.loadAdditionalKeys();
  }

  private async loadAdditionalKeys() {
    try {
      // Load from database or secure storage
      const response = await fetch('/api/gemini/keys');
      if (response.ok) {
        const keys = await response.json();
        this.apiKeys.push(...keys.filter((key: string) => !this.exhaustedKeys.has(key)));
      }
    } catch (error) {
      console.error('Failed to load additional API keys:', error);
    }
  }

  getCurrentKey(): string | null {
    if (this.apiKeys.length === 0) return null;
    return this.apiKeys[this.currentKeyIndex];
  }

  markKeyAsExhausted(key: string) {
    this.exhaustedKeys.add(key);
    // Remove from active keys
    this.apiKeys = this.apiKeys.filter(k => k !== key);
    
    // Move to next key
    if (this.currentKeyIndex >= this.apiKeys.length) {
      this.currentKeyIndex = 0; // Reset to first available key
    }
    
    // If no keys left, trigger gold member notification
    if (this.apiKeys.length === 0) {
      this.triggerGoldMemberNotification();
    }
  }

  async addNewKey(key: string, addedBy: string) {
    try {
      // Validate the key
      const testGenAI = new GoogleGenerativeAI(key);
      const model = testGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Test the key with a simple request
      await model.generateContent('test');
      
      // Add to database
      const response = await fetch('/api/gemini/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, addedBy })
      });
      
      if (response.ok) {
        this.apiKeys.push(key);
        console.log(`New API key added by ${addedBy}`);
        return true;
      }
    } catch (error) {
      console.error('Invalid API key:', error);
      return false;
    }
  }

  private triggerGoldMemberNotification() {
    // This will be handled by the frontend
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('geminiKeyExhausted'));
    }
  }

  getKeyStatus() {
    return {
      totalKeys: this.apiKeys.length,
      exhaustedKeys: this.exhaustedKeys.size,
      currentKeyIndex: this.currentKeyIndex,
      hasAvailableKeys: this.apiKeys.length > 0
    };
  }
}

// Global API Key Manager
export const geminiKeyManager = new GeminiAPIKeyManager();

// Simplified AI Models - only essential features
const getGeminiModel = () => {
  const key = geminiKeyManager.getCurrentKey();
  if (!key) {
    throw new Error('No available Gemini API keys');
  }
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// Core AI Personas - simplified
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

// Simplified Smart Features
export const SMART_FEATURES = {
  smartSuggestions: true,
  contentModeration: true,
  aiResponses: true,
  conversationSummary: true
};

// Core AI Functions - streamlined
export async function generateAIResponse(
  message: string, 
  context: {
    chatType: string;
    username: string;
    messageHistory?: Array<{ role: string; content: string }>;
  },
  persona: keyof typeof AI_PERSONAS = 'assistant'
) {
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

    const result = await model.generateContent(prompt);
    return {
      content: result.response.text(),
      persona: selectedPersona.name,
      confidence: 0.9
    };
  } catch (error: any) {
    console.error('[Gemini] Error generating response:', error);
    
    // Check if it's an API key error
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    
    return {
      content: "I'm having trouble thinking right now. Please try again later.",
      persona: 'real.AI',
      confidence: 0.1
    };
  }
}

// Smart Content Moderation
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
    console.error('[Gemini] Content moderation error:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    
    return { isAppropriate: true, confidence: 0.5 };
  }
}

// Smart Suggestions
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
    console.error('[Gemini] Smart suggestions error:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    
    return [];
  }
}

// Conversation Summary
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
    console.error('[Gemini] Summary generation error:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      const currentKey = geminiKeyManager.getCurrentKey();
      if (currentKey) {
        geminiKeyManager.markKeyAsExhausted(currentKey);
      }
    }
    
    return "Unable to generate summary";
  }
}

// API Key Management Functions
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
