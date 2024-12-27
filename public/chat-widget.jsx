import { ChatWidget } from '../src/components/ChatWidget';
import { createRoot } from 'react-dom/client';

// Initialize the chat widget
const initializeWidget = () => {
  // Get script attributes
  const scriptTag = document.currentScript || document.querySelector('script[src*="chat-widget.js"]');
  if (!scriptTag) {
    console.error('Could not find widget script tag');
    return;
  }

  const websiteId = scriptTag.getAttribute('data-website-id');
  const token = scriptTag.getAttribute('data-token');

  if (!websiteId || !token) {
    console.error('Website ID and token are required');
    return;
  }

  // Create container for widget
  const container = document.createElement('div');
  container.id = 'lovable-chat-widget';
  document.body.appendChild(container);

  // Initialize React component
  const root = createRoot(container);
  root.render(
    <ChatWidget 
      websiteId={websiteId}
      token={token}
    />
  );
};

// Initialize when the script loads
initializeWidget();
