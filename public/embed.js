(function() {
    // Prevent multiple initializations
    if (window.chatWiseInitialized) {
        console.warn('ChatWise widget already initialized');
        return;
    }
    window.chatWiseInitialized = true;

    function loadScript(src, attributes = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            // Add any custom attributes
            Object.entries(attributes).forEach(([key, value]) => {
                script.setAttribute(key, value);
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

    async function initializeWidget(config) {
        try {
            // Load styles first
            await loadStyle(config.baseUrl + '/css/styles.css');
            
            // Then load the widget script
            await loadScript(config.baseUrl + '/widget.js', {
                'data-website-id': config.websiteId,
                'data-token': config.token,
                'data-primary-color': config.primaryColor
            });
        } catch (error) {
            console.error('Failed to initialize ChatWise widget:', error);
        }
    }

    // Get the current script tag
    const currentScript = document.currentScript;
    if (!currentScript) {
        console.error('Could not find ChatWise embed script');
        return;
    }

    // Get configuration from script attributes
    const config = {
        baseUrl: currentScript.getAttribute('data-base-url') || '',
        websiteId: currentScript.getAttribute('data-website-id'),
        token: currentScript.getAttribute('data-token'),
        primaryColor: currentScript.getAttribute('data-primary-color')
    };

    if (!config.websiteId) {
        console.error('ChatWise: Missing required websiteId');
        return;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initializeWidget(config));
    } else {
        initializeWidget(config);
    }
})();