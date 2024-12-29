export interface WebsiteConfig {
  primaryColor: string;
  preamble: string;
}

export interface Website {
  id: string;
  name: string;
  user_id: string;
  embed_token: string;
  config: WebsiteConfig;
  created_at: string;
  updated_at: string;
}
