export const createWidgetUI = () => {
  console.log('Creating widget UI elements...');
  
  // Create container if it doesn't exist
  let container = document.getElementById('lovable-chat-container');
  if (!container) {
    console.log('Container not found, creating new container');
    container = document.createElement('div');
    container.id = 'lovable-chat-container';
    document.body.appendChild(container);
  }

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

  const elements = {
    widget: container.querySelector('.lovable-chat-widget'),
    chatButton: container.querySelector('.lovable-chat-button'),
    chatWindow: container.querySelector('.lovable-chat-window'),
    closeButton: container.querySelector('.lovable-close-button'),
    messagesContainer: container.querySelector('.lovable-chat-messages'),
    input: container.querySelector('input'),
    sendButton: container.querySelector('.lovable-chat-input button'),
  };

  console.log('Widget UI elements created:', elements);
  return elements;
};