(() => {
  console.log('Lovable Chat Widget initializing...');
  
  // Get configuration from window object
  const { websiteId, token, config, host } = window.LovableChat || {};
  
  if (!websiteId || !token) {
    console.error('Lovable Chat: Missing required configuration');
    return;
  }

  // Initialize configuration
  let currentConfig = {
    primaryColor: '#2563eb',
    preamble: "You are a helpful customer support agent. Be concise and friendly in your responses.",
    ...config
  };

  const updateConfig = (newConfig) => {
    console.log('Updating widget config:', newConfig);
    Object.assign(currentConfig, newConfig);
    updateStyles(currentConfig);
    return currentConfig;
  };

  // Style management
  const generateChatStyles = (primaryColor) => `
    .lovable-chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .lovable-chat-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: ${primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    }

    .lovable-chat-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .lovable-chat-window {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      transition: all 0.3s ease;
      border: 1px solid #e2e8f0;
    }

    .lovable-chat-window.open {
      display: flex;
    }

    .lovable-chat-header {
      padding: 16px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .lovable-chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1f2c;
    }

    .lovable-close-button {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }

    .lovable-close-button:hover {
      background-color: #f1f5f9;
      color: #475569;
    }

    .lovable-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background-color: #f8fafc;
    }

    .lovable-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      animation: fadeIn 0.3s ease;
    }

    .lovable-message.user {
      margin-left: auto;
      color: white;
      background-color: ${primaryColor};
      border-bottom-right-radius: 4px;
    }

    .lovable-message.bot {
      margin-right: auto;
      background: white;
      color: #1a1f2c;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .lovable-chat-input {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      background: white;
    }

    .lovable-chat-input input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      transition: all 0.2s ease;
    }

    .lovable-chat-input input:focus {
      border-color: ${primaryColor};
      box-shadow: 0 0 0 2px ${primaryColor}20;
    }

    .lovable-chat-input button {
      padding: 10px;
      width: 36px;
      height: 36px;
      background: ${primaryColor};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lovable-chat-input button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .lovable-chat-input button:disabled {
      background: #94a3b8;
      cursor: not-allowed;
      transform: none;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 640px) {
      .lovable-chat-window {
        width: calc(100% - 40px);
        height: calc(100% - 100px);
        bottom: 70px;
      }
    }
  `;

  const updateStyles = (config) => {
    const styleId = 'lovable-chat-styles';
    let styleEl = document.getElementById(styleId);

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = generateChatStyles(config.primaryColor);
  };

  // Chat functionality
  const initializeChat = async (container) => {
    console.log('Initializing chat functionality');
    
    const elements = {
      chatButton: container.querySelector('.lovable-chat-button'),
      chatWindow: container.querySelector('.lovable-chat-window'),
      closeButton: container.querySelector('.lovable-close-button'),
      messagesContainer: container.querySelector('.lovable-chat-messages'),
      input: container.querySelector('input'),
      sendButton: container.querySelector('.lovable-chat-input button')
    };

    // Event handlers
    elements.chatButton.addEventListener('click', () => {
      elements.chatWindow.classList.add('open');
      console.log('Chat window opened');
    });
    
    elements.closeButton.addEventListener('click', () => {
      elements.chatWindow.classList.remove('open');
      console.log('Chat window closed');
    });

    const sendMessage = async () => {
      const message = elements.input.value.trim();
      if (!message) return;

      elements.input.disabled = true;
      elements.sendButton.disabled = true;

      try {
        // Create and append user message
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'lovable-message user';
        userMessageElement.textContent = message;
        userMessageElement.style.backgroundColor = currentConfig.primaryColor;
        elements.messagesContainer.appendChild(userMessageElement);
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;

        elements.input.value = '';

        // Send message to API with authentication
        const response = await fetch(`${host}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            websiteId,
            token,
            config: currentConfig
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'lovable-message bot';
        botMessageElement.textContent = data.text;
        elements.messagesContainer.appendChild(botMessageElement);
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
        
        console.log('Message sent and response received');
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessageElement = document.createElement('div');
        errorMessageElement.className = 'lovable-message bot';
        errorMessageElement.textContent = 'Sorry, there was an error sending your message. Please try again.';
        elements.messagesContainer.appendChild(errorMessageElement);
      } finally {
        elements.input.disabled = false;
        elements.sendButton.disabled = false;
        elements.input.focus();
      }
    };

    // Attach message sending handlers
    elements.sendButton.addEventListener('click', sendMessage);
    elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    return elements;
  };

  // Initialize widget
  const initializeWidget = async () => {
    // Create widget container
    const container = document.createElement('div');
    container.className = 'lovable-chat-widget';
    
    // Add widget HTML
    container.innerHTML = `
      <button class="lovable-chat-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </button>
      
      <div class="lovable-chat-window">
        <div class="lovable-chat-header">
          <h3>Chat Support</h3>
          <button class="lovable-close-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="lovable-chat-messages"></div>
        
        <div class="lovable-chat-input">
          <input type="text" placeholder="Type your message...">
          <button>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(container);

    // Initialize chat functionality
    const elements = await initializeChat(container);
    
    // Apply initial styles
    updateStyles(currentConfig);

    return elements;
  };

  // Initialize the widget
  initializeWidget();
})();