(function() {
    if (!window.chatlyConfig) {
        console.error('chatlyConfig not found');
        return;
    }

    class ChatWidget {
        constructor(config) {
            if (!config.websiteId || !config.token) {
                console.error('Missing required configuration');
                return;
            }

            this.websiteId = config.websiteId;
            this.token = config.token;
            
            // Create Supabase client
            this.supabase = supabase.createClient(
                'https://simplesupportbot.com',
                'your-anon-key'
            );

            this.initWidget();
        }

        async initWidget() {
            try {
                // Load website config from Supabase
                const { data: website, error } = await this.supabase
                    .from('websites')
                    .select('config')
                    .eq('id', this.websiteId)
                    .single();

                if (error) throw error;

                this.config = website.config;
                this.render();
                this.attachEventListeners();
            } catch (error) {
                console.error('Failed to initialize widget:', error);
            }
        }

        render() {
            // Create container if it doesn't exist
            let container = document.getElementById('chatwise-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'chatwise-container';
                document.body.appendChild(container);
            }

            container.innerHTML = `
                <div class="chat-widget">
                    <button class="chat-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                    </button>
                    
                    <div class="chat-window hidden">
                        <div class="chat-header">
                            <h3>Chat Support</h3>
                            <button class="close-button">×</button>
                        </div>
                        
                        <div class="chat-messages">
                            <div class="message bot-message">
                                ${this.config.preamble || 'How can I help you today?'}
                            </div>
                        </div>
                        
                        <div class="chat-input">
                            <input type="text" class="input-field" placeholder="Type your message...">
                            <button class="send-button">Send</button>
                        </div>
                    </div>
                </div>
            `;

            this.applyStyles();
        }

        applyStyles() {
            const styles = document.createElement('style');
            styles.textContent = `
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
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
            document.head.appendChild(styles);
        }

        attachEventListeners() {
            const chatButton = document.querySelector('.chat-button');
            const closeButton = document.querySelector('.close-button');
            const chatWindow = document.querySelector('.chat-window');
            const input = document.querySelector('.input-field');
            const sendButton = document.querySelector('.send-button');

            chatButton.addEventListener('click', () => {
                chatWindow.classList.toggle('hidden');
                chatButton.classList.toggle('hidden');
            });

            closeButton.addEventListener('click', () => {
                chatWindow.classList.add('hidden');
                chatButton.classList.remove('hidden');
            });

            const sendMessage = async () => {
                const message = input.value.trim();
                if (!message) return;

                input.value = '';
                
                const messagesContainer = document.querySelector('.chat-messages');
                const userMessageDiv = document.createElement('div');
                userMessageDiv.className = 'message user-message';
                userMessageDiv.textContent = message;
                messagesContainer.appendChild(userMessageDiv);

                try {
                    const response = await fetch('https://simplesupportbot.com/api/chat', {
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
                    const botMessageDiv = document.createElement('div');
                    botMessageDiv.className = 'message bot-message';
                    botMessageDiv.textContent = data.response;
                    messagesContainer.appendChild(botMessageDiv);
                } catch (error) {
                    console.error('Chat error:', error);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'message bot-message';
                    errorDiv.textContent = 'Sorry, I encountered an error. Please try again.';
                    messagesContainer.appendChild(errorDiv);
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

    // Load Supabase client
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => new ChatWidget(window.chatlyConfig);
    document.head.appendChild(script);
})();