class ChatWidget {
    constructor(props) {
        this.props = props;
        this.isOpen = false;
        this.messages = [];
        this.isLoading = false;
        this.config = {
            primaryColor: props.primaryColor || '#2563eb',
            preamble: props.preamble || 'You are a helpful customer support agent. Be concise and friendly in your responses.'
        };

        this.supabaseClient = new SupabaseClient();
        this.initialize();
    }

    async initialize() {
        await this.fetchConfig();
        this.render();
        this.attachEventListeners();
    }

    async fetchConfig() {
        if (this.props.token) {
            try {
                const response = await fetch(
                    `${CONFIG.DASHBOARD_URL}/api/websites/${this.props.websiteId}/config?token=${this.props.token}`,
                    {
                        headers: {
                            'Origin': window.location.origin,
                        },
                        credentials: 'include',
                        mode: 'cors',
                    }
                );
                if (!response.ok) throw new Error('Failed to fetch website configuration');
                this.config = await response.json();
            } catch (error) {
                console.error('Error fetching website config:', error);
            }
        }
    }

    render() {
        const container = document.createElement('div');
        container.id = 'chat-widget-container';
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

        // Add styles
        if (!document.querySelector('#chat-widget-styles')) {
            const link = document.createElement('link');
            link.id = 'chat-widget-styles';
            link.rel = 'stylesheet';
            link.href = `${CONFIG.DASHBOARD_URL}/css/styles.css`;
            document.head.appendChild(link);
        }

        this.renderMessages();
    }

    renderMessages() {
        const messagesContainer = document.querySelector('.chat-messages');
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
            document.querySelector('.input-field').focus();
        }
    }

    async handleSendMessage() {
        const input = document.querySelector('.input-field');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;
        
        input.value = '';
        this.isLoading = true;
        
        this.messages.push({ content: message, isUser: true });
        this.renderMessages();

        try {
            const response = await this.getChatResponse(message);
            this.messages.push({ content: response, isUser: false });
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

    async getChatResponse(message) {
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
        return data.response;
    }
}

// Initialize widget when script is loaded
const script = document.currentScript;
const websiteId = script.getAttribute('data-website-id');
const token = script.getAttribute('data-token');
const primaryColor = script.getAttribute('data-primary-color');

if (websiteId) {
    new ChatWidget({
        websiteId,
        token,
        primaryColor
    });
}