(() => {
  // Get configuration from window object
  const config = window.ChatwiseWidget || {};
  const host = config.host || 'https://simplesupportbot.com';
  const websiteId = config.websiteId;
  const token = config.token;

  // Create widget styles
  const style = document.createElement('style');
  style.textContent = `
    .chatwise-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .chatwise-widget-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary-color, #2563eb);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s;
      position: relative;
      z-index: 1000000;
    }
    .chatwise-widget-button:hover {
      transform: scale(1.05);
    }
    .chatwise-widget-button svg {
      width: 24px;
      height: 24px;
      color: white;
    }
    .chatwise-widget-container {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: calc(100vh - 120px);
      max-height: 600px;
      min-height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      z-index: 999999;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .chatwise-widget-container.visible {
      opacity: 1;
      transform: translateY(0);
    }
    @media (max-height: 700px) {
      .chatwise-widget-container {
        height: calc(100vh - 100px);
        bottom: 70px;
      }
    }
    @media (max-width: 480px) {
      .chatwise-widget-container {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 70px;
      }
    }
    .chatwise-widget-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
    }
    .chatwise-widget-title {
      font-weight: 600;
      font-size: 16px;
      color: #1f2937;
      margin: 0;
    }
    .chatwise-widget-close {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      transition: color 0.2s;
    }
    .chatwise-widget-close:hover {
      color: #1f2937;
    }
    .chatwise-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: white;
    }
    .chatwise-message {
      max-width: 85%;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      animation: message-fade-in 0.3s ease;
    }
    @keyframes message-fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .chatwise-message.user {
      margin-left: auto;
      background: var(--primary-color, #2563eb);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .chatwise-message.bot {
      margin-right: auto;
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    .chatwise-widget-input {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      background: white;
    }
    .chatwise-widget-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .chatwise-widget-input input:focus {
      border-color: var(--primary-color, #2563eb);
      box-shadow: 0 0 0 1px var(--primary-color, #2563eb);
    }
    .chatwise-widget-input button {
      background: var(--primary-color, #2563eb);
      color: white;
      border: none;
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
    }
    .chatwise-widget-input button:not(:disabled):hover {
      transform: scale(1.05);
    }
    .chatwise-widget-input button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .chatwise-widget-input button svg {
      width: 16px;
      height: 16px;
    }
  `;
  document.head.appendChild(style);

  // Create widget HTML
  const widget = document.createElement('div');
  widget.className = 'chatwise-widget';
  widget.innerHTML = `
    <button class="chatwise-widget-button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    </button>
  `;
  document.body.appendChild(widget);

  // Create chat container
  const container = document.createElement('div');
  container.className = 'chatwise-widget-container';
  container.style.display = 'none';
  container.innerHTML = `
    <div class="chatwise-widget-header">
      <h3 class="chatwise-widget-title">Chat Support</h3>
      <button class="chatwise-widget-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="chatwise-widget-messages"></div>
    <div class="chatwise-widget-input">
      <input type="text" placeholder="Type your message..." />
      <button disabled>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(container);

  // Get widget elements
  const toggleButton = widget.querySelector('.chatwise-widget-button');
  const closeButton = container.querySelector('.chatwise-widget-close');
  const messagesContainer = container.querySelector('.chatwise-widget-messages');
  const input = container.querySelector('input');
  const sendButton = container.querySelector('button:last-child');

  // Debug logging function
  function logDebug(message, data) {
    console.log(`[ChatWidget Debug] ${message}`, data || '');
  }

  // Add message to chat
  function addMessage(message, isUser = false, isError = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `chatwise-message ${isUser ? 'user' : 'bot'}`;
    if (isError) {
      messageEl.style.background = '#fee2e2';
      messageEl.style.color = '#991b1b';
    }
    messageEl.textContent = message;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Send message to API
  async function sendMessage(message) {
    logDebug('Preparing to send message', { message });
    
    // Validate configuration
    if (!websiteId || !token) {
      logDebug('Missing configuration', { websiteId, token });
      throw new Error('Widget configuration is incomplete. Please check your setup.');
    }

    // Ensure we're using HTTPS
    const apiUrl = new URL('/api/chat', host);
    if (apiUrl.protocol === 'http:') {
      apiUrl.protocol = 'https:';
    }
    logDebug('Sending request to', apiUrl.toString());

    try {
      // Send the request
      const response = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          websiteId,
          token,
          message,
          config: config.config || {}
        }),
      });

      logDebug('Received response', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        logDebug('Response error', errorData);
        throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logDebug('Received data', data);
      return data.message;
    } catch (error) {
      logDebug('Error in sendMessage', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the chat service. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  // Handle send message
  async function handleSend() {
    const message = input.value.trim();
    if (!message) return;

    input.disabled = true;
    sendButton.disabled = true;
    input.value = '';

    try {
      addMessage(message, true);
      const response = await sendMessage(message);
      addMessage(response);
    } catch (error) {
      logDebug('Error in handleSend', error);
      addMessage(error.message, false, true);
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  // Event listeners
  toggleButton.addEventListener('click', () => {
    container.style.display = 'flex';
    setTimeout(() => container.classList.add('visible'), 10);
    toggleButton.parentElement.style.display = 'none';
    input.focus();
  });

  closeButton.addEventListener('click', () => {
    container.classList.remove('visible');
    setTimeout(() => {
      container.style.display = 'none';
      toggleButton.parentElement.style.display = 'block';
    }, 300);
  });

  input.addEventListener('input', () => {
    sendButton.disabled = !input.value.trim();
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && input.value.trim()) {
      e.preventDefault();
      handleSend();
    }
  });

  sendButton.addEventListener('click', handleSend);

  // Set primary color from config
  if (config.config?.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', config.config.primaryColor);
  }

  // Add initial bot message
  addMessage('Hello! How can I help you today?');
})();