(function() {
    console.log('[Debug] widget.js starting execution');
    console.log('[Debug] Current ChatwiseConfig:', window.ChatwiseConfig);
    
    // Simple check for ChatwiseConfig
    if (!window.ChatwiseConfig) {
        console.error('[Debug] ChatwiseConfig not found. Make sure to include the config script before widget.js');
        return;
    }

    console.log('[Debug] Found ChatwiseConfig, initializing widget...');
    class ChatWidget {
        constructor(config) {
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

            this.initialize();
        }

        async initialize() {
            this.render();
            this.attachEventListeners();
            await this.loadInitialMessage();
        }

        async loadInitialMessage() {
            if (this.messages.length === 0) {
                this.messages = [{ content: this.config.preamble, isUser: false }];
                await this.renderMessages();
            }
        }

        render() {
            const container = document.getElementById('chatwise-container');
            if (!container) {
                console.error('Chat widget container not found!');
                return;
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
        }

        async renderMessages() {
            const messagesContainer = document.querySelector('.chat-messages');
            if (!messagesContainer) return;

            messagesContainer.innerHTML = this.messages
                .map(msg => `
                    <div class="message ${msg.isUser ? 'user-message' : 'bot-message'}"
                         style="${msg.isUser ? `background-color: ${this.config.primaryColor}` : ''}">
                        ${msg.content}
                    </div>
                `)
                .join('');
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        attachEventListeners() {
            const chatButton = document.querySelector('.chat-button');
            const closeButton = document.querySelector('.close-button');
            const input = document.querySelector('.input-field');
            const sendButton = document.querySelector('.send-button');

            if (!chatButton || !closeButton || !input || !sendButton) return;

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
            if (!input || this.isLoading) return;

            const message = input.value.trim();
            if (!message) return;
            
            input.value = '';
            this.isLoading = true;

            this.messages.push({ content: message, isUser: true });
            this.renderMessages();

            try {
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

    // Initialize immediately since we know config exists
    new ChatWidget(window.ChatwiseConfig);
})();