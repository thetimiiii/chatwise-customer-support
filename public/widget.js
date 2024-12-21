(() => {
  console.log('Lovable Chat Widget initializing...');
  
  // Import modules
  const { currentConfig, updateConfig } = await import('./widget/config.js');
  const { initializeChat } = await import('./widget/chat.js');
  const { generateChatStyles, updateStyles } = await import('./widget/styles.js');

  // Initialize widget
  async function initializeWidget() {
    try {
      const scriptElement = document.currentScript;
      const websiteId = scriptElement.getAttribute('data-website-id');
      const token = scriptElement.getAttribute('data-token');
      
      if (!websiteId || !token) {
        console.error('Lovable Chat Widget: Missing required attributes');
        return;
      }

      // Fetch initial config
      const config = await fetchConfig(websiteId, token);
      updateConfig(config);

      // Create widget HTML
      const container = document.createElement('div');
      container.className = 'lovable-chat-widget';
      container.innerHTML = `
        <button class="lovable-chat-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <div class="lovable-chat-window">
          <div class="lovable-chat-header">
            <h3>Chat Support</h3>
            <button class="lovable-close-button">×</button>
          </div>
          <div class="lovable-chat-messages"></div>
          <div class="lovable-chat-input">
            <input type="text" placeholder="Type your message...">
            <button>Send</button>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      // Load Inter font
      const fontLink = document.createElement('link');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);

      // Initialize chat and apply styles
      updateStyles(config);
      initializeChat(container);

      // Listen for configuration updates
      window.addEventListener('message', (event) => {
        if (event.data.type === 'lovable-chat-config-update') {
          console.log('Received config update:', event.data.config);
          updateConfig(event.data.config);
          updateStyles(event.data.config);
        }
      }, false);

      console.log('Widget initialized successfully');
    } catch (error) {
      console.error('Error initializing widget:', error);
    }
  }

  const fetchConfig = async (websiteId, token) => {
    try {
      console.log('Fetching widget config from Supabase...');
      const response = await fetch('https://ccvfjhprrjirdvkecdbp.supabase.co/rest/v1/websites', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdmZqaHBycmppcmR2a2VjZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MjgsImV4cCI6MjA1MDM2NTYyOH0.M4ZXMi4z_2-RZxaYyUBmrekkOsfzcPSPhvLyZomD1XY',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdmZqaHBycmppcmR2a2VjZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MjgsImV4cCI6MjA1MDM2NTYyOH0.M4ZXMi4z_2-RZxaYyUBmrekkOsfzcPSPhvLyZomD1XY`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch config');
      
      const websites = await response.json();
      const website = websites.find(w => w.id === websiteId && w.embed_token === token);
      
      if (!website) throw new Error('Website not found');
      
      console.log('Retrieved config:', website.config);
      return website.config;
    } catch (error) {
      console.error('Error fetching config:', error);
      return {
        primaryColor: '#2563eb',
        preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
      };
    }
  };

  // Initialize the widget
  initializeWidget();
})();