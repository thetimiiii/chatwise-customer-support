export const generateChatStyles = (primaryColor: string = '#2563eb') => `
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