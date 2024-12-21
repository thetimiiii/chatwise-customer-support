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
      console.log('Loading script:', src);
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('Successfully loaded script:', src);
        resolve();
      };
      script.onerror = (error) => {
        console.error('Error loading script:', src, error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  };

  // Load required styles
  const loadStyles = () => {
    return new Promise((resolve, reject) => {
      console.log('Loading styles...');
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      // Use the current script's origin to load assets
      const scriptOrigin = new URL(scriptElement.src).origin;
      link.href = `${scriptOrigin}/assets/widget.css`;
      link.crossOrigin = 'anonymous';
      link.onload = () => {
        console.log('Styles loaded successfully');
        resolve();
      };
      link.onerror = (error) => {
        console.error('Error loading styles:', error);
        reject(error);
      };
      document.head.appendChild(link);
    });
  };

  const init = async () => {
    try {
      console.log('Loading dependencies...');
      // Load dependencies
      await Promise.all([
        loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
        loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
      ]);
      
      console.log('Loading widget bundle...');
      // Use the current script's origin to load the widget bundle
      const scriptOrigin = new URL(scriptElement.src).origin;
      await loadScript(`${scriptOrigin}/assets/widget.js`);

      console.log('Loading styles...');
      await loadStyles();

      console.log('Creating widget...');
      // Create and render the ChatWidget
      const root = document.createElement('div');
      container.appendChild(root);
      
      // Access the ChatWidget component from the loaded bundle
      const ChatWidget = window.ChatWidget;
      if (!ChatWidget) {
        throw new Error('ChatWidget component not found in the loaded bundle');
      }

      console.log('Rendering widget with props:', { websiteId, token });
      // Use ReactDOM.render for React 17 compatibility
      window.ReactDOM.render(
        window.React.createElement(ChatWidget, { 
          websiteId: websiteId,
          token: token
        }),
        root
      );

      console.log('Widget initialized successfully');
    } catch (error) {
      console.error('Error initializing Lovable Chat Widget:', error);
      // Display a user-friendly error message in the container
      container.innerHTML = ''; // Clear any previous content
      const errorContainer = document.createElement('div');
      errorContainer.textContent = 'Failed to load chat widget. Please try again later.';
      errorContainer.style.color = 'red';
      errorContainer.style.padding = '1rem';
      errorContainer.style.textAlign = 'center';
      container.appendChild(errorContainer);
    }
  }

  // Initialize the widget
  init();
})();