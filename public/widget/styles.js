import { generateChatStyles } from './styleGenerator.js';

export const updateStyles = (config) => {
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

  // Update button colors with transition
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

  // Update input styling
  if (elements.input) {
    elements.input.style.borderColor = `${config.primaryColor}33`;
    elements.input.style.transition = 'all 0.2s ease';
    
    elements.input.addEventListener('focus', () => {
      elements.input.style.borderColor = config.primaryColor;
      elements.input.style.boxShadow = `0 0 0 2px ${config.primaryColor}20`;
    });
    
    elements.input.addEventListener('blur', () => {
      elements.input.style.borderColor = '#e2e8f0';
      elements.input.style.boxShadow = 'none';
    });
  }

  console.log('Styles updated successfully');
};