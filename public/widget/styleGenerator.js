export const generateChatStyles = (primaryColor) => `
  .lovable-chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
  }

  .lovable-chat-button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .lovable-chat-window {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: none;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    transition: all 0.3s ease;
  }

  .lovable-chat-window.open {
    display: flex;
  }

  .lovable-chat-header {
    padding: 16px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lovable-chat-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1f2c;
  }

  .lovable-close-button {
    background: none;
    border: none;
    color: #64748b;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    transition: all 0.2s ease;
  }

  .lovable-close-button:hover {
    color: #475569;
  }

  .lovable-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #f8fafc;
  }

  .lovable-message {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    transition: all 0.2s ease;
  }

  .lovable-message.user {
    margin-left: auto;
    color: white;
    background-color: ${primaryColor};
    border-bottom-right-radius: 4px;
  }

  .lovable-message.bot {
    margin-right: auto;
    background: white;
    color: #1a1f2c;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .lovable-chat-input {
    padding: 16px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 8px;
    background: white;
  }

  .lovable-chat-input input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    outline: none;
    font-size: 14px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    transition: all 0.2s ease;
  }

  .lovable-chat-input input:focus {
    border-color: ${primaryColor};
    box-shadow: 0 0 0 2px ${primaryColor}20;
  }

  .lovable-chat-input button {
    padding: 10px 16px;
    background: ${primaryColor};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lovable-chat-input button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .lovable-chat-input button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 640px) {
    .lovable-chat-window {
      width: calc(100% - 40px);
      height: calc(100% - 100px);
      bottom: 70px;
    }
  }
`;