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
            this.config = config.config || {};
            this.host = config.host || 'https://api.simplesupportbot.com';
            this.messages = [];
            
            this.initializeWidget();
        }

        async initializeWidget() {
            try {
                // Initialize the chat core
                this.core = new ChatCore(
                    this.host,
                    this.token
                );

                // Get initial config
                const widgetConfig = await this.core.getConfig(this.websiteId);
                
                // Initialize widget design
                this.design = new WidgetDesign({
                    primaryColor: widgetConfig.primaryColor || '#007bff',
                    position: widgetConfig.position || 'right',
                    animations: widgetConfig.animations !== false,
                    fontFamily: widgetConfig.fontFamily,
                    borderRadius: widgetConfig.borderRadius
                });

                // Subscribe to config changes
                this.core.subscribeToConfig(this.websiteId, (newConfig) => {
                    this.design.updateConfig(newConfig);
                });

                // Load message history
                const history = await this.core.getHistory(this.websiteId);
                this.messages = history || [];

                // Render the widget
                this.render();
                this.attachEventListeners();
            } catch (error) {
                console.error('Failed to initialize widget:', error);
            }
        }

        render() {
            const container = document.createElement('div');
            container.className = 'chatwise-widget';
            
            // Create chat button
            const button = document.createElement('div');
            button.className = 'chatwise-widget-button';
            button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
            
            // Create chat window
            const window = document.createElement('div');
            window.className = 'chatwise-widget-window hidden';
            
            // Add header
            const header = document.createElement('div');
            header.className = 'chatwise-widget-header';
            header.textContent = 'Chat Support';
            
            // Add messages container
            const messages = document.createElement('div');
            messages.className = 'chatwise-widget-messages';
            
            // Add input area
            const input = document.createElement('div');
            input.className = 'chatwise-widget-input';
            input.innerHTML = '<input type="text" placeholder="Type your message...">';
            
            // Assemble the widget
            window.appendChild(header);
            window.appendChild(messages);
            window.appendChild(input);
            container.appendChild(button);
            container.appendChild(window);
            
            document.body.appendChild(container);
            
            this.elements = {
                container,
                button,
                window,
                messages,
                input: input.querySelector('input')
            };
            
            this.renderMessages();
        }

        renderMessages() {
            if (!this.elements.messages) return;
            
            this.elements.messages.innerHTML = '';
            this.messages.forEach(msg => {
                const messageEl = document.createElement('div');
                messageEl.className = `chatwise-message chatwise-message-${msg.role}`;
                messageEl.textContent = msg.content;
                this.elements.messages.appendChild(messageEl);
            });
            
            this.scrollToBottom();
        }

        scrollToBottom() {
            if (this.elements.messages) {
                this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
            }
        }

        attachEventListeners() {
            // Toggle chat window
            this.elements.button.addEventListener('click', () => {
                this.elements.window.classList.toggle('hidden');
                if (!this.elements.window.classList.contains('hidden')) {
                    this.elements.input.focus();
                }
            });

            // Handle message input
            this.elements.input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    const message = e.target.value.trim();
                    e.target.value = '';

                    try {
                        // Send user message
                        const userMessage = await this.core.sendMessage(this.websiteId, message, 'user');
                        this.messages.push(userMessage);
                        this.renderMessages();

                        // Get AI response
                        const response = await fetch(`${this.host}/api/chat`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${this.token}`
                            },
                            body: JSON.stringify({
                                message,
                                websiteId: this.websiteId,
                                config: this.config
                            })
                        });

                        if (!response.ok) throw new Error('Failed to get AI response');
                        
                        const aiMessage = await response.json();
                        this.messages.push(aiMessage);
                        this.renderMessages();
                    } catch (error) {
                        console.error('Error sending message:', error);
                        // Show error message to user
                        const errorMsg = {
                            role: 'assistant',
                            content: 'Sorry, I encountered an error. Please try again.'
                        };
                        this.messages.push(errorMsg);
                        this.renderMessages();
                    }
                }
            });
        }
    }

    // Initialize widget
    new ChatWidget(window.ChatwiseWidget);
})();