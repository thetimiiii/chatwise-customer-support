import { Json } from './json';

export interface WebsiteConfig {
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

export const isWebsiteConfig = (value: unknown): value is WebsiteConfig => {
  if (typeof value !== 'object' || value === null) return false;
  
  const config = value as Record<string, unknown>;
  return (
    typeof config.primaryColor === 'string' &&
    typeof config.preamble === 'string'
  );
};