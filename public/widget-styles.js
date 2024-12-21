export const injectStyles = () => {
  const styles = document.createElement('style');
  styles.textContent = `
    .lovable-chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .lovable-chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #2563eb;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s;
    }

    .lovable-chat-button:hover {
      transform: scale(1.05);
    }

    .lovable-chat-window {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
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
      word-wrap: break-word;
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

    .lovable-close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      color: #666;
    }

    .lovable-close-button:hover {
      color: #333;
    }
  `;
  document.head.appendChild(styles);
  console.log('Chat widget styles injected');
};