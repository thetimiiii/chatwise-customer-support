class SupabaseClient {
    constructor() {
        // Initialize with dummy values for testing
        this.initialized = true;
        if (CONFIG.DEBUG) {
            console.log('SupabaseClient initialized');
        }
    }

    async updateConfig(websiteId, config) {
        if (CONFIG.DEBUG) {
            console.log('Updating config:', { websiteId, config });
        }
        return { error: null };
    }

    async getWebsiteConfig(websiteId) {
        if (CONFIG.DEBUG) {
            console.log('Getting website config:', websiteId);
        }
        return {
            primaryColor: '#2563eb',
            preamble: 'How can I help you today?'
        };
    }
}
