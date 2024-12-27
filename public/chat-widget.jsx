import { createRoot } from 'react-dom/client';
import { ChatWidget } from '../src/components/ChatWidget';
import '@/styles/globals.css'; // Include all Tailwind and shadcn styles

(() => {
  // Extract website ID and token from script tag
  const scriptTag = document.currentScript || 
    document.querySelector('script[src*="widget.js"]');
  
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

  // Create container
  const container = document.createElement('div');
  container.className = 'lovable-chat-widget';
  document.body.appendChild(container);

  // Load Inter font
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  // Initialize React
  const root = createRoot(container);
  root.render(
    <ChatWidget 
      websiteId={websiteId}
      token={token}
    />
  );
})();
