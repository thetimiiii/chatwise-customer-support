export interface WebsiteConfig {
  [key: string]: Json; // Added index signature for Json compatibility
  primaryColor: string;
  preamble: string;
}

export interface Website {
  id: string;
  user_id: string;
  url: string;
  name: string;
  created_at: string;
  updated_at: string;
  embed_token: string;
  config: WebsiteConfig;
}
