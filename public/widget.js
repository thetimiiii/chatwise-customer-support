(() => {
  console.log('Lovable Chat Widget initializing...');
  
  // Config management
  let currentConfig = {
    primaryColor: '#2563eb',
    preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
  };

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

        // Send message to API
        const response = await fetch('https://api.cohere.ai/v1/chat', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer u1uJ7ifVjzGHnzYVzsu0HQJiaYGBstRUkXnnGwzs',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            model: 'command',
            preamble: currentConfig.preamble,
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

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
  async function initializeWidget() {
    try {
      const scriptElement = document.currentScript;
      const websiteId = scriptElement.getAttribute('data-website-id');
      const token = scriptElement.getAttribute('data-token');
      
      if (!websiteId || !token) {
        console.error('Lovable Chat Widget: Missing required attributes');
        return;
      }

      // Fetch initial config
      const config = await fetchConfig(websiteId, token);
      updateConfig(config);

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
            <button>Send</button>
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
      updateStyles(config);
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
    } catch (error) {
      console.error('Error initializing widget:', error);
    }
  }

  const fetchConfig = async (websiteId, token) => {
    try {
      console.log('Fetching widget config from Supabase...');
      const response = await fetch('https://ccvfjhprrjirdvkecdbp.supabase.co/rest/v1/websites', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdmZqaHBycmppcmR2a2VjZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MjgsImV4cCI6MjA1MDM2NTYyOH0.M4ZXMi4z_2-RZxaYyUBmrekkOsfzcPSPhvLyZomD1XY',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdmZqaHBycmppcmR2a2VjZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MjgsImV4cCI6MjA1MDM2NTYyOH0.M4ZXMi4z_2-RZxaYyUBmrekkOsfzcPSPhvLyZomD1XY`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch config');
      
      const websites = await response.json();
      const website = websites.find(w => w.id === websiteId && w.embed_token === token);
      
      if (!website) throw new Error('Website not found');
      
      console.log('Retrieved config:', website.config);
      return website.config;
    } catch (error) {
      console.error('Error fetching config:', error);
      return {
        primaryColor: '#2563eb',
        preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
      };
    }
  };

  // Initialize the widget
  initializeWidget();
})();