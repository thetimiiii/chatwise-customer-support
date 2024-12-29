(function() {
    // Debug logging with timestamps
    function debug(message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[Chatwise ${timestamp}] ${message}`;
        if (data) {
            console.log(logMessage, data);
        } else {
            console.log(logMessage);
        }
    }

    // Wait for ChatwiseConfig to be available
    function waitForConfig(maxAttempts = 100) { 
        let attempts = 0;
        debug('Starting to wait for ChatwiseConfig');
        
        return new Promise((resolve, reject) => {
            function checkConfig() {
                attempts++;
                debug(`Checking for ChatwiseConfig (Attempt ${attempts}/${maxAttempts})`);
                
                if (window.ChatwiseConfig) {
                    debug('ChatwiseConfig found:', window.ChatwiseConfig);
                    resolve(window.ChatwiseConfig);
                } else {
                    debug('ChatwiseConfig not found yet');
                    if (attempts >= maxAttempts) {
                        debug('Max attempts reached, failing');
                        reject(new Error('ChatwiseConfig not found after maximum attempts'));
                    } else {
                        setTimeout(checkConfig, 100);
                    }
                }
            }
            
            // Start checking immediately
            debug('Initial config check');
            if (window.ChatwiseConfig) {
                debug('ChatwiseConfig found immediately:', window.ChatwiseConfig);
                resolve(window.ChatwiseConfig);
            } else {
                debug('ChatwiseConfig not found, starting retry loop');
                checkConfig();
            }
        });
    }

    // Validate configuration
    function validateConfig(config) {
        debug('Validating config:', config);
        const required = ['websiteId', 'token', 'host'];
        const missing = required.filter(key => !config[key]);
        
        if (missing.length > 0) {
            debug('Missing required fields:', missing);
            throw new Error(`Missing required configuration: ${missing.join(', ')}`);
        }

        debug('Config validation successful');
        return true;
    }

    class ChatWidget {
        constructor(config) {
            debug('Initializing ChatWidget with config:', config);
            this.config = {
                primaryColor: config.primaryColor || '#2563eb',
                preamble: config.preamble || 'How can I help you today?',
                websiteId: config.websiteId,
                token: config.token,
                host: config.host
            };

            this.isOpen = false;
            this.messages = [];
            this.isLoading = false;

            debug('ChatWidget instance created');
            this.initialize();
        }

        async initialize() {
            debug('Starting widget initialization');
            try {
                await this.render();
                await this.attachEventListeners();
                await this.loadInitialMessage();
                debug('Widget initialization completed successfully');
            } catch (error) {
                debug('Error during widget initialization:', error);
                throw error;
            }
        }

        async loadInitialMessage() {
            debug('Loading initial message');
            if (this.messages.length === 0) {
                this.messages = [{ content: this.config.preamble, isUser: false }];
                await this.renderMessages();
                debug('Initial message loaded');
            }
        }

        async render() {
            debug('Rendering widget');
            const container = document.getElementById('chatwise-container');
            if (!container) {
                const error = 'Chat widget container not found!';
                debug('Error:', error);
                throw new Error(error);
            }

            container.innerHTML = `
                <div class="chat-widget">
                    <button class="chat-button ${this.isOpen ? 'hidden' : ''}" 
                            style="background-color: ${this.config.primaryColor}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle" style="color: white;">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                    </button>
                    
                    <div class="chat-window ${!this.isOpen ? 'hidden' : ''}">
                        <div class="chat-header">
                            <h3>Chat Support</h3>
                            <button class="close-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="chat-messages"></div>
                        
                        <div class="chat-input">
                            <input type="text" class="input-field" placeholder="Type your message...">
                            <button class="send-button" style="background-color: ${this.config.primaryColor}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            debug('Widget rendered successfully');
            await this.renderMessages();
        }

        async renderMessages() {
            debug('Rendering messages:', this.messages);
            const messagesContainer = document.querySelector('.chat-messages');
            if (!messagesContainer) {
                debug('Error: Messages container not found');
                return;
            }

            messagesContainer.innerHTML = this.messages
                .map(msg => `
                    <div class="message ${msg.isUser ? 'user-message' : 'bot-message'}"
                         style="${msg.isUser ? `background-color: ${this.config.primaryColor}` : ''}">
                        ${msg.content}
                    </div>
                `)
                .join('');
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            debug('Messages rendered successfully');
        }

        async attachEventListeners() {
            debug('Attaching event listeners');
            const chatButton = document.querySelector('.chat-button');
            const closeButton = document.querySelector('.close-button');
            const input = document.querySelector('.input-field');
            const sendButton = document.querySelector('.send-button');

            if (!chatButton || !closeButton || !input || !sendButton) {
                const error = 'Required elements not found for event listeners';
                debug('Error:', error);
                throw new Error(error);
            }

            chatButton.addEventListener('click', () => this.toggleChat());
            closeButton.addEventListener('click', () => this.toggleChat());
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
            
            sendButton.addEventListener('click', () => this.handleSendMessage());
            debug('Event listeners attached successfully');
        }

        toggleChat() {
            debug('Toggling chat visibility');
            this.isOpen = !this.isOpen;
            this.render();
            if (this.isOpen) {
                document.querySelector('.input-field')?.focus();
            }
            debug('Chat visibility toggled:', { isOpen: this.isOpen });
        }

        async handleSendMessage() {
            const input = document.querySelector('.input-field');
            if (!input || this.isLoading) {
                debug('Send message canceled:', { 
                    inputFound: !!input, 
                    isLoading: this.isLoading 
                });
                return;
            }

            const message = input.value.trim();
            if (!message) {
                debug('Empty message, ignoring');
                return;
            }
            
            debug('Sending message:', message);
            input.value = '';
            this.isLoading = true;

            this.messages.push({ content: message, isUser: true });
            await this.renderMessages();

            try {
                debug('Making API request');
                const response = await fetch(`${this.config.host}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.token}`
                    },
                    body: JSON.stringify({
                        message,
                        websiteId: this.config.websiteId,
                        token: this.config.token,
                        config: {
                            primaryColor: this.config.primaryColor,
                            preamble: this.config.preamble
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const data = await response.json();
                debug('API response received:', data);
                this.messages.push({ content: data.response, isUser: false });
            } catch (error) {
                debug('Error during message send:', error);
                this.messages.push({ 
                    content: 'I apologize, but I am having trouble responding right now. Please try again in a moment.',
                    isUser: false 
                });
            } finally {
                this.isLoading = false;
                await this.renderMessages();
                debug('Message handling completed');
            }
        }
    }

    // Initialize widget with retry mechanism
    async function initializeWidget() {
        debug('Starting widget initialization process');
        try {
            debug('Waiting for config...');
            const config = await waitForConfig();
            
            debug('Validating config...');
            validateConfig(config);
            
            debug('Creating ChatWidget instance...');
            new ChatWidget(config);
            
            debug('Widget initialization completed successfully');
        } catch (error) {
            debug('Failed to initialize chat widget:', error);
            console.error('Failed to initialize chat widget:', error);
        }
    }

    // Start initialization when DOM is ready
    debug('Checking document ready state:', document.readyState);
    if (document.readyState === 'loading') {
        debug('Document still loading, adding DOMContentLoaded listener');
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        debug('Document already loaded, initializing widget immediately');
        initializeWidget();
    }
})();