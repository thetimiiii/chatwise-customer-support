// Add global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.log('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

class ChatWidget {
    constructor(props) {
        if (CONFIG.DEBUG) {
            console.log('Initializing ChatWidget with props:', props);
        }

        this.props = props;
        this.isOpen = false;
        this.messages = [];
        this.isLoading = false;
        this.config = {
            primaryColor: props.primaryColor || '#2563eb',
            preamble: props.preamble || 'How can I help you today?'
        };

        this.supabaseClient = new SupabaseClient();
        this.initialize();
    }

    async initialize() {
        if (CONFIG.DEBUG) {
            console.log('Widget initialization started');
        }
        await this.fetchConfig();
        this.render();
        this.attachEventListeners();
        if (CONFIG.DEBUG) {
            console.log('Widget initialization completed');
        }
    }

    async fetchConfig() {
        if (this.props.token) {
            try {
                if (CONFIG.DEBUG) {
                    console.log('Fetching config for website:', this.props.websiteId);
                }
                const config = await this.supabaseClient.getWebsiteConfig(this.props.websiteId);
                this.config = { ...this.config, ...config };
            } catch (error) {
                console.error('Error fetching website config:', error);
            }
        }
    }

    render() {
        const container = document.createElement('div');
        container.id = 'chat-widget-container';
        document.body.appendChild(container);
        
        if (CONFIG.DEBUG) {
            console.log('Rendering widget with config:', this.config);
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

        // Add initial message
        this.messages = [{ content: this.config.preamble, isUser: false }];
        this.renderMessages();

        if (CONFIG.DEBUG) {
            console.log('Widget rendered successfully');
        }
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

        chatButton.addEventListener('click', () => {
            if (CONFIG.DEBUG) console.log('Chat button clicked');
            this.toggleChat();
        });

        closeButton.addEventListener('click', () => {
            if (CONFIG.DEBUG) console.log('Close button clicked');
            this.toggleChat();
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        
        sendButton.addEventListener('click', () => this.handleSendMessage());

        if (CONFIG.DEBUG) {
            console.log('Event listeners attached');
        }
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
        
        if (CONFIG.DEBUG) {
            console.log('Sending message:', message);
        }

        this.messages.push({ content: message, isUser: true });
        this.renderMessages();

        try {
            const response = await fetch(`${CONFIG.DASHBOARD_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.props.token ? `Bearer ${this.props.token}` : undefined
                },
                body: JSON.stringify({
                    message,
                    websiteId: this.props.websiteId,
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

// Initialize widget when script is loaded
const script = document.currentScript;
if (script) {
    const websiteId = script.getAttribute('data-website-id');
    const token = script.getAttribute('data-token');
    const primaryColor = script.getAttribute('data-primary-color');

    if (websiteId) {
        if (CONFIG.DEBUG) {
            console.log('Initializing widget with:', { websiteId, token, primaryColor });
        }
        new ChatWidget({
            websiteId,
            token,
            primaryColor
        });
    } else {
        console.error('Missing required websiteId attribute');
    }
}