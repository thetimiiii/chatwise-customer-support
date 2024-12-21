import { currentConfig, updateConfig } from './widget/config.js';
import { updateStyles } from './widget/styles.js';
import { initializeChat } from './widget/chat.js';

(function() {
  console.log('Lovable Chat Widget initializing...');
  
  const scriptElement = document.currentScript;
  const websiteId = scriptElement.getAttribute('data-website-id');
  const token = scriptElement.getAttribute('data-token');
  
  if (!websiteId || !token) {
    console.error('Lovable Chat Widget: Missing required attributes');
    return;
  }

  // Initialize widget
  async function initializeWidget() {
    try {
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
      initializeChat(container);

      // Apply initial styles
      updateStyles(currentConfig);

      // Listen for configuration updates from the demo widget
      window.addEventListener('message', (event) => {
        if (event.data.type === 'lovable-chat-config-update') {
          console.log('Received config update:', event.data.config);
          const newConfig = updateConfig(event.data.config);
          updateStyles(newConfig);
        }
      }, false);

      console.log('Widget initialized successfully');
    } catch (error) {
      console.error('Error initializing widget:', error);
    }
  }

  // Initialize the widget
  initializeWidget();
})();