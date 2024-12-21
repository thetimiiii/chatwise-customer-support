(function() {
  console.log('Lovable Chat Widget initializing...');
  
  const scriptElement = document.currentScript;
  const websiteId = scriptElement.getAttribute('data-website-id');
  const token = scriptElement.getAttribute('data-token');
  
  if (!websiteId || !token) {
    console.error('Lovable Chat Widget: Missing required attributes');
    return;
  }

  async function initializeWidget() {
    try {
      // Default configuration
      const config = {
        primaryColor: '#2563eb',
        preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
      };

      // Create and append styles
      const styles = document.createElement('style');
      styles.textContent = generateChatStyles(config.primaryColor);
      document.head.appendChild(styles);

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

      // Initialize chat functionality
      initializeChat(container, config);

      // Watch for configuration changes from the demo widget
      window.addEventListener('message', (event) => {
        if (event.data.type === 'lovable-chat-config-update') {
          const newConfig = event.data.config;
          if (newConfig.primaryColor !== config.primaryColor) {
            styles.textContent = generateChatStyles(newConfig.primaryColor);
          }
          Object.assign(config, newConfig);
        }
      });
    } catch (error) {
      console.error('Error initializing widget:', error);
    }
  }

  function initializeChat(container, config) {
    const chatButton = container.querySelector('.lovable-chat-button');
    const chatWindow = container.querySelector('.lovable-chat-window');
    const closeButton = container.querySelector('.lovable-close-button');
    const messagesContainer = container.querySelector('.lovable-chat-messages');
    const input = container.querySelector('input');
    const sendButton = container.querySelector('.lovable-chat-input button');

    chatButton.addEventListener('click', () => chatWindow.classList.add('open'));
    closeButton.addEventListener('click', () => chatWindow.classList.remove('open'));

    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      input.disabled = true;
      sendButton.disabled = true;

      const userMessageElement = document.createElement('div');
      userMessageElement.className = 'lovable-message user';
      userMessageElement.textContent = message;
      messagesContainer.appendChild(userMessageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      input.value = '';

      try {
        const response = await fetch('https://api.cohere.ai/v1/chat', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer u1uJ7ifVjzGHnzYVzsu0HQJiaYGBstRUkXnnGwzs',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            model: 'command',
            preamble: config.preamble,
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'lovable-message bot';
        botMessageElement.textContent = data.text;
        messagesContainer.appendChild(botMessageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessageElement = document.createElement('div');
        errorMessageElement.className = 'lovable-message bot';
        errorMessageElement.textContent = 'Sorry, there was an error sending your message. Please try again.';
        messagesContainer.appendChild(errorMessageElement);
      } finally {
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
      }
    }

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function generateChatStyles(primaryColor) {
    return `
      .lovable-chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
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
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }

      .lovable-chat-button:hover {
        transform: scale(1.05);
      }

      .lovable-chat-window {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }

      .lovable-chat-window.open {
        display: flex;
      }

      .lovable-chat-header {
        padding: 16px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .lovable-chat-header h3 {
        margin: 0;
        font-size: 16px;
        color: #0f172a;
      }

      .lovable-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .lovable-message {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.4;
      }

      .lovable-message.user {
        margin-left: auto;
        background: ${primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .lovable-message.bot {
        margin-right: auto;
        background: #f1f5f9;
        color: #0f172a;
        border-bottom-left-radius: 4px;
      }

      .lovable-chat-input {
        padding: 16px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
      }

      .lovable-chat-input input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        outline: none;
        font-size: 14px;
      }

      .lovable-chat-input input:focus {
        border-color: ${primaryColor};
        box-shadow: 0 0 0 1px ${primaryColor};
      }

      .lovable-chat-input button {
        padding: 8px 16px;
        background: ${primaryColor};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s;
      }

      .lovable-chat-input button:hover {
        opacity: 0.9;
      }

      .lovable-chat-input button:disabled {
        background: #94a3b8;
        cursor: not-allowed;
      }
    `;
  }

  // Initialize the widget
  initializeWidget();
})();
