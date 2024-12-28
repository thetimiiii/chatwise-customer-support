(() => {
  console.log('Chatwise Widget initializing...');
  
  // Get configuration from window object
  const { websiteId, token, config, host } = window.ChatwiseWidget || {};
  
  if (!websiteId || !token) {
    console.error('Chatwise: Missing required configuration');
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
    .chatwise-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }

    .chatwise-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .chatwise-button:hover {
      transform: scale(1.05);
    }

    .chatwise-icon {
      width: 30px;
      height: 30px;
    }

    .chatwise-chat-container {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 380px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .chatwise-chat-container.open {
      display: flex;
    }

    .chatwise-chat-header {
      padding: 16px;
      background-color: ${primaryColor};
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chatwise-close-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
    }

    .chatwise-chat-messages {
      flex-grow: 1;
      padding: 16px;
      overflow-y: auto;
    }

    .chatwise-message {
      margin-bottom: 16px;
      max-width: 80%;
    }

    .chatwise-message.user {
      margin-left: auto;
    }

    .chatwise-message-content {
      padding: 12px;
      border-radius: 12px;
      background-color: #f3f4f6;
      display: inline-block;
    }

    .chatwise-message.user .chatwise-message-content {
      background-color: ${primaryColor};
      color: white;
    }

    .chatwise-input-container {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }

    .chatwise-input {
      flex-grow: 1;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      outline: none;
    }

    .chatwise-send-button {
      padding: 8px 16px;
      background-color: ${primaryColor};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .chatwise-send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  const updateStyles = (config) => {
    const styleId = 'chatwise-styles';
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = generateChatStyles(config.primaryColor);
  };

  const initializeWidget = () => {
    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'chatwise-widget';
    
    // Create chat button
    const chatButton = document.createElement('div');
    chatButton.className = 'chatwise-button';
    chatButton.innerHTML = `
      <svg class="chatwise-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 9V2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chatwise-chat-container';
    chatContainer.innerHTML = `
      <div class="chatwise-chat-header">
        <span>Chat Support</span>
        <button class="chatwise-close-button">×</button>
      </div>
      <div class="chatwise-chat-messages"></div>
      <div class="chatwise-input-container">
        <input type="text" class="chatwise-input" placeholder="Type your message...">
        <button class="chatwise-send-button">Send</button>
      </div>
    `;
    
    // Add elements to DOM
    widgetContainer.appendChild(chatButton);
    widgetContainer.appendChild(chatContainer);
    document.body.appendChild(widgetContainer);
    
    // Add event listeners
    chatButton.addEventListener('click', () => {
      chatContainer.classList.add('open');
    });
    
    const closeButton = chatContainer.querySelector('.chatwise-close-button');
    closeButton.addEventListener('click', () => {
      chatContainer.classList.remove('open');
    });
    
    const input = chatContainer.querySelector('.chatwise-input');
    const sendButton = chatContainer.querySelector('.chatwise-send-button');
    const messagesContainer = chatContainer.querySelector('.chatwise-chat-messages');
    
    const addMessage = (content, isUser = false) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatwise-message${isUser ? ' user' : ''}`;
      messageDiv.innerHTML = `<div class="chatwise-message-content">${content}</div>`;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    
    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;
      
      input.value = '';
      sendButton.disabled = true;
      
      addMessage(message, true);
      
      try {
        const response = await fetch(`${host}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteId,
            message,
            token,
            config: currentConfig
          })
        });
        
        const data = await response.json();
        if (data.message) {
          addMessage(data.message);
        } else if (data.error) {
          addMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage('Sorry, there was an error processing your message.');
      }
      
      sendButton.disabled = false;
    };
    
    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  };

  // Initialize the widget
  initializeWidget();
})();