import { injectStyles } from './widget-styles.js';
import { createWidgetUI } from './widget-ui.js';
import { sendChatMessage } from './chat-api.js';

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

  // Create container if it doesn't exist
  let container = document.getElementById('lovable-chat-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lovable-chat-container';
    document.body.appendChild(container);
  }

  // Inject styles
  injectStyles();

  // Create UI elements
  const ui = createWidgetUI();
  if (!ui) return;

  const { widget, chatButton, chatWindow, closeButton, messagesContainer, input, sendButton } = ui;

  // Toggle chat window
  chatButton.addEventListener('click', () => {
    chatWindow.classList.add('open');
  });

  closeButton.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // Handle sending messages
  async function handleSendMessage() {
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
      // Send message and get response
      const response = await sendChatMessage(message, websiteId, token);

      // Add bot response to chat
      const botMessageElement = document.createElement('div');
      botMessageElement.className = 'lovable-message bot';
      botMessageElement.textContent = response;
      messagesContainer.appendChild(botMessageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Error in chat:', error);
      // Show error message in chat
      const errorMessageElement = document.createElement('div');
      errorMessageElement.className = 'lovable-message bot';
      errorMessageElement.textContent = 'Sorry, there was an error sending your message. Please try again.';
      messagesContainer.appendChild(errorMessageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Send message on button click
  sendButton.addEventListener('click', handleSendMessage);

  // Send message on Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });

  console.log('Lovable Chat Widget initialized successfully');
})();