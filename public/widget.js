(function() {
  console.log('Lovable Chat Widget initializing...');
  
  // Get the script element that loaded this widget
  const scriptElement = document.currentScript;
  const websiteId = scriptElement.getAttribute('data-website-id');
  const token = scriptElement.getAttribute('data-token');
  
  if (!websiteId || !token) {
    console.error('Lovable Chat Widget: Missing required attributes (data-website-id or data-token)');
    return;
  }

  console.log('Initializing chat widget for website:', websiteId);

  // Create and append the widget styles
  const styles = document.createElement('style');
  styles.textContent = `
    .lovable-chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .lovable-chat-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #2563eb;
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
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .lovable-chat-window.open {
      display: flex;
    }

    .lovable-chat-header {
      padding: 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .lovable-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .lovable-chat-input {
      padding: 16px;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 8px;
    }

    .lovable-chat-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      outline: none;
    }

    .lovable-chat-input button {
      padding: 8px 16px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .lovable-message {
      margin-bottom: 12px;
      max-width: 80%;
    }

    .lovable-message.user {
      margin-left: auto;
      background: #2563eb;
      color: white;
      padding: 8px 12px;
      border-radius: 12px 12px 0 12px;
    }

    .lovable-message.bot {
      margin-right: auto;
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 12px 12px 12px 0;
    }
  `;
  document.head.appendChild(styles);

  // Create the widget container
  const container = document.getElementById('lovable-chat-container');
  if (!container) {
    console.error('Lovable Chat Widget: Container element not found');
    return;
  }

  // Create the widget HTML
  container.innerHTML = `
    <div class="lovable-chat-widget">
      <button class="lovable-chat-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div class="lovable-chat-window">
        <div class="lovable-chat-header">
          <span>Chat Support</span>
          <button class="lovable-close-button">×</button>
        </div>
        <div class="lovable-chat-messages"></div>
        <div class="lovable-chat-input">
          <input type="text" placeholder="Type your message...">
          <button>Send</button>
        </div>
      </div>
    </div>
  `;

  // Get DOM elements
  const widget = container.querySelector('.lovable-chat-widget');
  const chatButton = widget.querySelector('.lovable-chat-button');
  const chatWindow = widget.querySelector('.lovable-chat-window');
  const closeButton = widget.querySelector('.lovable-close-button');
  const messagesContainer = widget.querySelector('.lovable-chat-messages');
  const input = widget.querySelector('input');
  const sendButton = widget.querySelector('.lovable-chat-input button');

  // Toggle chat window
  chatButton.addEventListener('click', () => {
    chatWindow.classList.add('open');
  });

  closeButton.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // Handle sending messages
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    // Add user message to chat
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'lovable-message user';
    userMessageElement.textContent = message;
    messagesContainer.appendChild(userMessageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Clear input
    input.value = '';

    try {
      // Send message to backend
      const response = await fetch(`${window.location.origin}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          websiteId,
          token,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Add bot response to chat
      const botMessageElement = document.createElement('div');
      botMessageElement.className = 'lovable-message bot';
      botMessageElement.textContent = data.response;
      messagesContainer.appendChild(botMessageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message in chat
      const errorMessageElement = document.createElement('div');
      errorMessageElement.className = 'lovable-message bot';
      errorMessageElement.textContent = 'Sorry, there was an error sending your message. Please try again.';
      messagesContainer.appendChild(errorMessageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Send message on button click
  sendButton.addEventListener('click', sendMessage);

  // Send message on Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  console.log('Lovable Chat Widget initialized successfully');
})();