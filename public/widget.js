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

  // Create container div if it doesn't exist
  let container = document.getElementById('lovable-chat-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lovable-chat-container';
    document.body.appendChild(container);
  }

  // Load React and ReactDOM from CDN
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = '';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Load required styles
  const loadStyles = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${window.location.origin}/src/index.css`;
    document.head.appendChild(link);
  };

  const init = async () => {
    try {
      // Load dependencies
      await Promise.all([
        loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
        loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
      ]);

      // Load styles
      loadStyles();

      // Import the ChatWidget component
      const response = await fetch(`${window.location.origin}/src/components/ChatWidget.tsx`);
      const componentCode = await response.text();
      
      // Create a new script element with the component code
      const componentScript = document.createElement('script');
      componentScript.type = 'module';
      componentScript.textContent = `
        import { ChatWidget } from '${window.location.origin}/src/components/ChatWidget';
        
        const container = document.getElementById('lovable-chat-container');
        ReactDOM.render(
          React.createElement(ChatWidget, { 
            websiteId: '${websiteId}',
            token: '${token}'
          }),
          container
        );
      `;
      
      document.body.appendChild(componentScript);

    } catch (error) {
      console.error('Error initializing Lovable Chat Widget:', error);
    }
  }

  // Initialize the widget
  init();
})();