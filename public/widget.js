(function() {
    if (!window.ChatwiseWidget) {
        console.error('ChatwiseWidget configuration not found');
        return;
    }

    // Load Inter font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

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

            this.loadStyles().then(() => {
                this.render();
                this.attachEventListeners();
            });
        }

        async loadStyles() {
            try {
                const response = await fetch(`${this.host}/api/chat/widget-styles`, {
                    headers: {
                        'Accept': 'text/javascript',
                        'Authorization': `Bearer ${this.token}`
                    },
                    mode: 'cors',
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    throw new Error(`Failed to load styles: ${response.status}`);
                }

                const styles = await response.text();
                const styleEl = document.createElement('style');
                styleEl.textContent = styles;
                document.head.appendChild(styleEl);
            } catch (error) {
                console.warn('Using fallback styles:', error);
                const styleEl = document.createElement('style');
                styleEl.textContent = this.getBasicStyles();
                document.head.appendChild(styleEl);
            }
        }

        getBasicStyles() {
            return `
                #chatwise-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .chat-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: none;
                    background-color: ${this.config.primaryColor || '#2563eb'};
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .chat-button svg {
                    color: white;
                }
                .chat-window {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .chat-header {
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }
                .chat-input {
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 8px;
                }
                .input-field {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    outline: none;
                }
                .send-button {
                    padding: 8px 16px;
                    background-color: ${this.config.primaryColor || '#2563eb'};
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .message {
                    margin: 8px 0;
                    padding: 8px 12px;
                    border-radius: 8px;
                    max-width: 80%;
                }
                .bot-message {
                    background: #f3f4f6;
                    margin-right: auto;
                }
                .user-message {
                    background: ${this.config.primaryColor || '#2563eb'};
                    color: white;
                    margin-left: auto;
                }
                .hidden {
                    display: none;
                }
            `;
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

    // Initialize widget
    new ChatWidget(window.ChatwiseWidget);
})();