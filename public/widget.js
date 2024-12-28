(() => {
  console.log('Chatwise Widget initializing...');
  
  // Get configuration from window object
  const config = window.ChatwiseWidget || {};
  const host = config.host || 'https://simplesupportbot.com';
  const websiteId = config.websiteId;
  const token = config.token;
  
  if (!websiteId || !token) {
    console.error('Chatwise: Missing required configuration');
    return;
  }

  // Initialize configuration
  let currentConfig = {
    primaryColor: '#2563eb',
    preamble: "You are a helpful customer support agent. Be concise and friendly in your responses.",
    ...config.config
  };

  const updateConfig = (newConfig) => {
    console.log('Updating widget config:', newConfig);
    Object.assign(currentConfig, newConfig);
    updateStyles(currentConfig);
    return currentConfig;
  };

  // Create widget styles
  const style = document.createElement('style');
  style.textContent = `
    .chatwise-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 360px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      z-index: 999999;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .chatwise-widget.minimized {
      height: 60px;
      width: 60px;
      border-radius: 30px;
      cursor: pointer;
    }
    .chatwise-widget-header {
      padding: 16px;
      background: var(--primary-color, #2563eb);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chatwise-widget-title {
      font-weight: 600;
      font-size: 16px;
      margin: 0;
    }
    .chatwise-widget-minimize {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chatwise-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .chatwise-message {
      max-width: 80%;
      padding: 12px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
    }
    .chatwise-message.user {
      background: var(--primary-color, #2563eb);
      color: white;
      align-self: flex-end;
    }
    .chatwise-message.bot {
      background: #f3f4f6;
      color: #1f2937;
      align-self: flex-start;
    }
    .chatwise-widget-input {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    .chatwise-widget-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
    }
    .chatwise-widget-input input:focus {
      border-color: var(--primary-color, #2563eb);
    }
    .chatwise-widget-input button {
      background: var(--primary-color, #2563eb);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .chatwise-widget-input button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Create widget HTML
  const widget = document.createElement('div');
  widget.className = 'chatwise-widget';
  widget.innerHTML = `
    <div class="chatwise-widget-header">
      <h3 class="chatwise-widget-title">Chat Support</h3>
      <button class="chatwise-widget-minimize">−</button>
    </div>
    <div class="chatwise-widget-messages"></div>
    <div class="chatwise-widget-input">
      <input type="text" placeholder="Type your message..." />
      <button>Send</button>
    </div>
  `;
  document.body.appendChild(widget);

  // Get widget elements
  const minimizeButton = widget.querySelector('.chatwise-widget-minimize');
  const messagesContainer = widget.querySelector('.chatwise-widget-messages');
  const input = widget.querySelector('input');
  const sendButton = widget.querySelector('button');

  // Initialize widget state
  let isMinimized = false;

  // Add message to chat
  function addMessage(message, isUser = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `chatwise-message ${isUser ? 'user' : 'bot'}`;
    messageEl.textContent = message;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Send message to API
  async function sendMessage(message) {
    try {
      const response = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        credentials: 'omit',
        body: JSON.stringify({
          websiteId,
          token,
          message,
          config: currentConfig
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Sorry, I encountered an error. Please try again later.';
    }
  }

  // Handle minimize/maximize
  minimizeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    isMinimized = !isMinimized;
    widget.classList.toggle('minimized');
    minimizeButton.textContent = isMinimized ? '+' : '−';
  });

  // Handle send message
  async function handleSend() {
    const message = input.value.trim();
    if (!message) return;

    // Disable input while sending
    input.disabled = true;
    sendButton.disabled = true;

    // Add user message
    addMessage(message, true);
    input.value = '';

    // Get bot response
    const response = await sendMessage(message);
    addMessage(response);

    // Re-enable input
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }

  // Event listeners
  sendButton.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // Handle click when minimized
  widget.addEventListener('click', () => {
    if (isMinimized) {
      isMinimized = false;
      widget.classList.remove('minimized');
      minimizeButton.textContent = '−';
    }
  });

  // Set primary color from config
  if (currentConfig.primaryColor) {
    widget.style.setProperty('--primary-color', currentConfig.primaryColor);
  }

  // Add initial bot message
  addMessage('Hello! How can I help you today?');
})();