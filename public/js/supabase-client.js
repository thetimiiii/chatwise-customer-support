class SupabaseClient {
    constructor() {
        this.supabase = supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY
        );
    }

    async updateConfig(websiteId, config) {
        try {
            const { error } = await this.supabase
                .from('websites')
                .update({
                    config: config
                })
                .eq('id', websiteId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating chat config:', error);
            throw error;
        }
    }

    async getWebsiteConfig(websiteId) {
        try {
            const { data, error } = await this.supabase
                .from('websites')
                .select('config')
                .eq('id', websiteId)
                .single();

            if (error) throw error;
            return data.config;
        } catch (error) {
            console.error('Error fetching website config:', error);
            throw error;
        }
    }
}
