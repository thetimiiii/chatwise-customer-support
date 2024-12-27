(() => {
  console.log('Lovable Chat Widget initializing...');
  
  // Config management
  let currentConfig = {
    primaryColor: '#2563eb',
    preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
  };

  let websiteId = null;

  const updateConfig = (newConfig) => {
    console.log('Updating widget config:', newConfig);
    Object.assign(currentConfig, newConfig);
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
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      transition: all 0.3s ease;
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
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      transition: all 0.2s ease;
    }

    .lovable-close-button:hover {
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
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      transition: all 0.2s ease;
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
      padding: 10px 16px;
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

    @media (max-width: 640px) {
      .lovable-chat-window {
        width: calc(100% - 40px);
        height: calc(100% - 100px);
        bottom: 70px;
      }
    }
  `;

  const updateStyles = (config) => {
    console.log('Updating widget styles with config:', config);
    
    const container = document.querySelector('.lovable-chat-widget');
    if (!container) {
      console.warn('Widget container not found');
      return;
    }

    // Update stylesheet
    let styleElement = document.querySelector('style[data-lovable-chat]');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.setAttribute('data-lovable-chat', '');
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = generateChatStyles(config.primaryColor);

    // Update dynamic elements
    const elements = {
      chatButton: container.querySelector('.lovable-chat-button'),
      sendButton: container.querySelector('.lovable-chat-input button'),
      userMessages: container.querySelectorAll('.lovable-message.user'),
      input: container.querySelector('.lovable-chat-input input')
    };

    // Update colors with transition
    [elements.chatButton, elements.sendButton].forEach(button => {
      if (button) {
        button.style.backgroundColor = config.primaryColor;
        button.style.transition = 'all 0.2s ease';
      }
    });

    // Update user messages
    elements.userMessages.forEach(msg => {
      msg.style.backgroundColor = config.primaryColor;
      msg.style.transition = 'background-color 0.2s ease';
    });

    console.log('Styles updated successfully');
  };

  // Chat functionality
  const initializeChat = (container) => {
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

        // Send message to our backend service instead of Cohere directly
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            websiteId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send message');
        }

        // Handle response
        const data = await response.json();
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'lovable-message bot';
        botMessageElement.textContent = data.text;
        elements.messagesContainer.appendChild(botMessageElement);
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
        
        console.log('Message sent and response received');
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Show error message in chat
        const errorElement = document.createElement('div');
        errorElement.className = 'lovable-message bot';
        errorElement.textContent = error.message === 'No credits remaining' 
          ? 'This website has run out of chat credits. Please contact the website owner.'
          : 'Failed to send message. Please try again.';
        elements.messagesContainer.appendChild(errorElement);
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
      } finally {
        elements.input.disabled = false;
        elements.sendButton.disabled = false;
      }
    };

    elements.sendButton.addEventListener('click', sendMessage);
    elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    console.log('Chat functionality initialized');
  };

  // Initialize widget
  const initializeWidget = async () => {
    console.log('Initializing widget...');
    
    // Extract website ID from script tag
    const scriptTag = document.currentScript || 
      document.querySelector('script[src*="widget.js"]');
    
    if (!scriptTag) {
      console.error('Could not find widget script tag');
      return;
    }

    websiteId = scriptTag.getAttribute('data-website-id');
    if (!websiteId) {
      console.error('No website ID provided');
      return;
    }

    try {
      // Fetch website configuration
      const response = await fetch(`/api/websites/${websiteId}/config`);
      if (!response.ok) {
        throw new Error('Failed to fetch website configuration');
      }
      const config = await response.json();
      updateConfig(config);
    } catch (error) {
      console.error('Error fetching website config:', error);
      // Use default config if fetch fails
    }

    // Create widget HTML
    const container = document.createElement('div');
    container.className = 'lovable-chat-widget';
    container.innerHTML = `
      <button class="lovable-chat-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div class="lovable-chat-window">
        <div class="lovable-chat-header">
          <h3>Chat Support</h3>
          <button class="lovable-close-button">×</button>
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

    document.body.appendChild(container);

    // Load Inter font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Initialize chat and apply styles
    updateStyles(currentConfig);
    initializeChat(container);

    // Listen for configuration updates
    window.addEventListener('message', (event) => {
      if (event.data.type === 'lovable-chat-config-update') {
        console.log('Received config update:', event.data.config);
        updateConfig(event.data.config);
        updateStyles(event.data.config);
      }
    }, false);

    console.log('Widget initialized successfully');
  };

  // Initialize the widget
  initializeWidget();
})();