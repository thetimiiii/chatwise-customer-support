export interface ChatConfig {
  primaryColor: string;
  preamble: string;
}

export const defaultConfig: ChatConfig = {
  primaryColor: '#2563eb',
  preamble: "You are a helpful customer support agent. Be concise and friendly in your responses.",
};

export const getChatConfig = async (websiteId: string, token: string): Promise<ChatConfig> => {
  try {
    const response = await fetch(`/api/chat-config?websiteId=${websiteId}&token=${token}`);
    if (!response.ok) {
      console.warn('Failed to fetch chat config, using defaults');
      return defaultConfig;
    }
    return await response.json();
  } catch (error) {
    console.warn('Error fetching chat config:', error);
    return defaultConfig;
  }
};