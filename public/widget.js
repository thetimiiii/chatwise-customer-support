(function() {
    // Check if configuration exists
    if (!window.ChatwiseConfig) {
        console.error('Chatwise configuration not found');
        return;
    }

    // Validate required fields
    if (!window.ChatwiseConfig.websiteId) {
        console.error('Missing required websiteId attribute');
        return;
    }

    // Debug logging
    console.log('Widget.js loaded, configuration:', {
        websiteId: window.ChatwiseConfig.websiteId,
        token: window.ChatwiseConfig.token,
        host: window.ChatwiseConfig.host
    });

    // Handle ResizeObserver errors
    window.addEventListener('error', function(e) {
        if (e.message.includes('ResizeObserver')) {
            e.stopImmediatePropagation();
            return false;
        }
    });

    class ChatWidget {
        constructor(config) {
            if (!config || !config.websiteId) {
                console.error('ChatWidget initialization failed: Missing required websiteId');
                return;
            }

            // Prevent multiple instances
            if (window.chatWidgetInstance) {
                console.warn('ChatWidget instance already exists');
                return window.chatWidgetInstance;
            }

            this.config = {
                primaryColor: config.primaryColor || '#2563eb',
                preamble: config.preamble || 'How can I help you today?',
                websiteId: config.websiteId,
                token: config.token,
                host: config.host || window.location.origin
            };

            this.isOpen = false;
            this.messages = [];
            this.isLoading = false;

            window.chatWidgetInstance = this;
            this.initialize();
        }

        async initialize() {
            console.log('Initializing ChatWidget...');
            this.render();
            this.attachEventListeners();
            console.log('ChatWidget initialization completed');
        }

        render() {
            // Remove any existing container
            const existingContainer = document.getElementById('chatwise-container');
            if (existingContainer) {
                existingContainer.remove();
            }

            const container = document.createElement('div');
            container.id = 'chatwise-container';
            document.body.appendChild(container);

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

            // Add initial message
            if (!this.messages.length) {
                this.messages = [{ content: this.config.preamble, isUser: false }];
            }
            this.renderMessages();
        }

        renderMessages() {
            const messagesContainer = document.querySelector('.chat-messages');
            if (!messagesContainer) {
                console.error('Messages container not found!');
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
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        attachEventListeners() {
            const chatButton = document.querySelector('.chat-button');
            const closeButton = document.querySelector('.close-button');
            const input = document.querySelector('.input-field');
            const sendButton = document.querySelector('.send-button');

            if (!chatButton || !closeButton || !input || !sendButton) {
                console.error('Required elements not found!');
                return;
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
        }

        toggleChat() {
            this.isOpen = !this.isOpen;
            this.render();
            if (this.isOpen) {
                document.querySelector('.input-field')?.focus();
            }
        }

        async handleSendMessage() {
            const input = document.querySelector('.input-field');
            if (!input) {
                console.error('Input field not found!');
                return;
            }

            const message = input.value.trim();
            if (!message || this.isLoading) return;
            
            input.value = '';
            this.isLoading = true;

            this.messages.push({ content: message, isUser: true });
            this.renderMessages();

            try {
                const response = await fetch(`${this.config.host}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.config.token ? `Bearer ${this.config.token}` : undefined
                    },
                    body: JSON.stringify({
                        message,
                        websiteId: this.config.websiteId,
                        preamble: this.config.preamble
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to get chat response');
                }

                const data = await response.json();
                this.messages.push({ content: data.response, isUser: false });
            } catch (error) {
                console.error('Chat error:', error);
                this.messages.push({ 
                    content: 'I apologize, but I am having trouble responding right now. Please try again in a moment.',
                    isUser: false 
                });
            } finally {
                this.isLoading = false;
                this.renderMessages();
            }
        }
    }

    // Initialize widget with global config
    new ChatWidget(window.ChatwiseConfig);
})();