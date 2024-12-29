import { ChatCore } from '../lib/core/ChatCore';
import { WidgetDesign } from '../lib/widget/WidgetDesign';

declare global {
  interface Window {
    ChatwiseWidget?: {
      websiteId: string;
      token: string;
      config?: {
        primaryColor?: string;
        preamble?: string;
      };
      host?: string;
    };
  }
}

class ChatWidget {
  private core: ChatCore;
  private design: WidgetDesign;
  private messages: any[] = [];
  private websiteId: string;
  private token: string;
  private config: any;
  private host: string;

  constructor(config: any) {
    if (!config.websiteId || !config.token) {
      console.error('Missing required configuration');
      return;
    }

    this.websiteId = config.websiteId;
    this.token = config.token;
    this.config = config.config || {};
    this.host = config.host || 'https://api.simplesupportbot.com';
    
    this.initializeWidget();
  }

  private async initializeWidget() {
    try {
      // Load Inter font
      const fontLink = document.createElement('link');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);

      // Initialize the chat core
      this.core = new ChatCore(
        this.host,
        this.token
      );

      // Get initial config
      const widgetConfig = await this.core.getConfig(this.websiteId);
      
      // Initialize widget design
      this.design = new WidgetDesign({
        primaryColor: widgetConfig.primaryColor || '#2563eb',
        position: widgetConfig.position || 'right',
        animations: widgetConfig.animations !== false,
        fontFamily: widgetConfig.fontFamily,
        borderRadius: widgetConfig.borderRadius
      });

      // Subscribe to config changes
      this.core.subscribeToConfig(this.websiteId, (newConfig) => {
        this.design.updateConfig(newConfig);
      });

      // Create widget container
      const container = document.createElement('div');
      container.className = 'chatwise-widget';
      document.body.appendChild(container);

      // Create chat button
      const button = document.createElement('button');
      button.className = 'chatwise-widget-button';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      container.appendChild(button);

      // Create chat window
      const window = document.createElement('div');
      window.className = 'chatwise-widget-window hidden';
      container.appendChild(window);

      // Create chat header
      const header = document.createElement('div');
      header.className = 'chatwise-widget-header';
      header.textContent = 'Chat Support';
      window.appendChild(header);

      // Create messages container
      const messages = document.createElement('div');
      messages.className = 'chatwise-widget-messages';
      window.appendChild(messages);

      // Create input container
      const input = document.createElement('div');
      input.className = 'chatwise-widget-input';
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'Type your message...';
      input.appendChild(textInput);
      window.appendChild(input);

      // Add event listeners
      button.addEventListener('click', () => {
        window.classList.toggle('hidden');
      });

      textInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && textInput.value.trim()) {
          const message = textInput.value.trim();
          textInput.value = '';

          // Add user message
          const userMsg = document.createElement('div');
          userMsg.className = 'chatwise-message chatwise-message-user';
          userMsg.textContent = message;
          messages.appendChild(userMsg);
          messages.scrollTop = messages.scrollHeight;

          try {
            // Send message and get response
            const response = await this.core.sendMessage(this.websiteId, message);

            // Add assistant message
            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'chatwise-message chatwise-message-assistant';
            assistantMsg.textContent = response.message;
            messages.appendChild(assistantMsg);
            messages.scrollTop = messages.scrollHeight;
          } catch (error) {
            console.error('Failed to send message:', error);
          }
        }
      });

    } catch (error) {
      console.error('Failed to initialize widget:', error);
    }
  }
}

// Initialize widget when the script loads
if (window.ChatwiseWidget) {
  new ChatWidget(window.ChatwiseWidget);
} else {
  console.error('ChatwiseWidget configuration not found');
}
