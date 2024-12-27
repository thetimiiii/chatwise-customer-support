import { createRoot } from 'react-dom/client';
import { ChatWidget } from '@/components/ChatWidget';
import '@/styles/globals.css';

// Add CSS reset and base styles
const styles = `
  .lovable-chat-widget {
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    -moz-tab-size: 4;
    tab-size: 4;
    -webkit-font-feature-settings: normal;
    font-feature-settings: normal;
    font-variation-settings: normal;
  }
  
  .lovable-chat-widget * {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: #e5e7eb;
  }

  .lovable-chat-widget :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
`;

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

  // Add styles
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);

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
