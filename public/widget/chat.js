import { currentConfig } from './config.js';

export const initializeChat = (container) => {
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