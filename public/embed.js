(() => {
  const WIDGET_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/embedded-chat'
    : `${process.env.NEXT_PUBLIC_APP_URL}/embedded-chat`;

  // Find our script tag
  const scriptTag = document.currentScript || 
    document.querySelector('script[src*="embed.js"]');
  
  if (!scriptTag) {
    console.error('Could not find widget script tag');
    return;
  }

  // Get required attributes
  const websiteId = scriptTag.getAttribute('data-website-id');
  const token = scriptTag.getAttribute('data-token');
  
  if (!websiteId || !token) {
    console.error('Website ID and token are required');
    return;
  }

  // Create and append the iframe
  const iframe = document.createElement('iframe');
  const url = new URL(WIDGET_URL);
  url.searchParams.set('websiteId', websiteId);
  url.searchParams.set('token', token);
  iframe.src = url.toString();
  
  console.log('Loading widget from:', iframe.src); // Debug log

  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '350px';
  iframe.style.height = '500px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  iframe.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.15)';
  iframe.style.zIndex = '9999';
  iframe.style.background = 'transparent';
  iframe.style.backgroundColor = 'transparent';
  iframe.allowTransparency = 'true';
  iframe.style.backdropFilter = 'none';
  iframe.allow = 'clipboard-write';
  
  iframe.onerror = (error) => {
    console.error('Failed to load chat widget:', error);
    iframe.style.display = 'none';
  };

  iframe.style.opacity = '0';
  iframe.style.transition = 'opacity 0.3s ease-in-out';
  
  iframe.onload = () => {
    console.log('Widget loaded successfully'); // Debug log
    iframe.style.opacity = '1';
  };

  document.body.appendChild(iframe);

  // Add message listener for iframe communication
  window.addEventListener('message', (event) => {
    // Verify origin
    const iframeOrigin = new URL(WIDGET_URL).origin;
    if (event.origin !== iframeOrigin) return;
    
    const { type, data } = event.data;
    switch (type) {
      case 'resize':
        iframe.style.height = `${data.height}px`;
        break;
      case 'close':
        iframe.style.display = 'none';
        break;
      case 'error':
        console.error('Chat widget error:', data);
        break;
    }
  });
})(); 