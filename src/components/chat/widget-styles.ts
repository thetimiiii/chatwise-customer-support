export const generateWidgetStyles = (primaryColor: string = '#2563eb') => `
  #chatwise-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    font-family: 'Inter', sans-serif;
  }
  .chat-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background-color: ${primaryColor};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s;
  }
  .chat-button:hover {
    transform: scale(1.05);
  }
  .chat-button svg {
    color: white;
    width: 24px;
    height: 24px;
  }
  .chat-window {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    transition: opacity 0.2s, transform 0.2s;
  }
  .chat-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-radius: 12px 12px 0 0;
  }
  .chat-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  .close-button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 24px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }
  .close-button:hover {
    color: #111827;
  }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    scroll-behavior: smooth;
  }
  .chat-input {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
    background: white;
    border-radius: 0 0 12px 12px;
  }
  .input-field {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    outline: none;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .input-field:focus {
    border-color: ${primaryColor};
  }
  .send-button {
    padding: 8px 16px;
    background-color: ${primaryColor};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  .send-button:hover {
    opacity: 0.9;
  }
  .message {
    margin: 8px 0;
    padding: 12px 16px;
    border-radius: 12px;
    max-width: 85%;
    font-size: 14px;
    line-height: 1.5;
  }
  .bot-message {
    background: #f3f4f6;
    margin-right: auto;
    color: #111827;
  }
  .user-message {
    background: ${primaryColor};
    color: white;
    margin-left: auto;
  }
  .hidden {
    display: none;
    opacity: 0;
    transform: translateY(10px);
  }
  .chat-window:not(.hidden) {
    opacity: 1;
    transform: translateY(0);
  }
`;
