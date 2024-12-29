(function() {
    if (!window.ChatwiseWidget) {
        console.error('ChatwiseWidget configuration not found');
        return;
    }

    // First load the styles
    fetch('https://simplesupportbot.com/chat/widget-styles.js')
        .then(response => response.text())
        .then(styles => {
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
            
            // Then initialize the widget
            new ChatWidget(window.ChatwiseWidget);
        })
        .catch(error => {
            console.error('Failed to load widget styles:', error);
        });

    class ChatWidget {
        constructor(config) {
            if (!config.websiteId || !config.token) {
                console.error('Missing required configuration');
                return;
            }

            this.websiteId = config.websiteId;
            this.token = config.token;
            this.config = config.config;
            this.host = config.host;
            
            this.messages = [];
            if (this.config.preamble) {
                this.messages.push({ content: this.config.preamble, isUser: false });
            }

            this.render();
            this.attachEventListeners();
        }

        render() {
            let container = document.getElementById('chatwise-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'chatwise-container';
                document.body.appendChild(container);
            }

            container.innerHTML = `
                <button class="chat-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                </button>
                
                <div class="chat-window hidden">
                    <div class="chat-header">
                        <h3>Chat Support</h3>
                        <button class="close-button">×</button>
                    </div>
                    
                    <div class="chat-messages">
                        ${this.messages.map(msg => `
                            <div class="message ${msg.isUser ? 'user-message' : 'bot-message'}">
                                ${msg.content}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="chat-input">
                        <input type="text" class="input-field" placeholder="Type your message...">
                        <button class="send-button">Send</button>
                    </div>
                </div>
            `;
        }

        attachEventListeners() {
            const chatButton = document.querySelector('.chat-button');
            const closeButton = document.querySelector('.close-button');
            const chatWindow = document.querySelector('.chat-window');
            const input = document.querySelector('.input-field');
            const sendButton = document.querySelector('.send-button');
            const messagesContainer = document.querySelector('.chat-messages');

            chatButton.addEventListener('click', () => {
                chatWindow.classList.toggle('hidden');
                chatButton.classList.toggle('hidden');
                if (!chatWindow.classList.contains('hidden')) {
                    input.focus();
                }
            });

            closeButton.addEventListener('click', () => {
                chatWindow.classList.add('hidden');
                chatButton.classList.remove('hidden');
            });

            const sendMessage = async () => {
                const message = input.value.trim();
                if (!message) return;

                input.value = '';
                
                // Add user message
                this.messages.push({ content: message, isUser: true });
                messagesContainer.innerHTML = this.messages.map(msg => `
                    <div class="message ${msg.isUser ? 'user-message' : 'bot-message'}">
                        ${msg.content}
                    </div>
                `).join('');

                try {
                    const response = await fetch(`${this.host}/api/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.token}`
                        },
                        body: JSON.stringify({
                            message,
                            websiteId: this.websiteId
                        })
                    });

                    if (!response.ok) throw new Error('Failed to get response');

                    const data = await response.json();
                    
                    // Add bot response
                    this.messages.push({ content: data.response, isUser: false });
                    messagesContainer.innerHTML = this.messages.map(msg => `
                        <div class="message ${msg.isUser ? 'user-message' : 'bot-message'}">
                            ${msg.content}
                        </div>
                    `).join('');
                } catch (error) {
                    console.error('Chat error:', error);
                    this.messages.push({
                        content: 'Sorry, I encountered an error. Please try again.',
                        isUser: false
                    });
                    messagesContainer.innerHTML = this.messages.map(msg => `
                        <div class="message ${msg.isUser ? 'user-message' : 'bot-message'}">
                            ${msg.content}
                        </div>
                    `).join('');
                }

                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            };

            sendButton.addEventListener('click', sendMessage);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }
})();