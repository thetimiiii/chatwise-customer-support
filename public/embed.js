(function() {
    // Prevent multiple initializations
    if (window.chatWiseInitialized) {
        console.warn('ChatWise widget already initialized');
        return;
    }
    window.chatWiseInitialized = true;

    function loadScript(src, config) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            Object.entries(config).forEach(([key, value]) => {
                script.setAttribute(`data-${key}`, value);
            });

            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function loadStyle(href) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${href}"]`)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    async function initializeWidget() {
        try {
            if (!window.ChatwiseConfig) {
                throw new Error('ChatwiseConfig not found');
            }

            const config = window.ChatwiseConfig;
            const { host, websiteId, token, primaryColor } = config;

            if (!host || !websiteId) {
                throw new Error('Missing required configuration: host, websiteId');
            }

            // Load styles first
            await loadStyle(`${host}/widget.css`);
            
            // Then load the widget script
            await loadScript(`${host}/widget.js`, {
                'website-id': websiteId,
                'token': token || '',
                'primary-color': primaryColor || '#2563eb'
            });

            // Create container if it doesn't exist
            if (!document.getElementById('chatwise-container')) {
                const container = document.createElement('div');
                container.id = 'chatwise-container';
                document.body.appendChild(container);
            }
        } catch (error) {
            console.error('Failed to initialize ChatWise widget:', error);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }
})();