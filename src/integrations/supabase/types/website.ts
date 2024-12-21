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

// Type guard to check if a JSON value matches WebsiteConfig structure
export function isWebsiteConfig(value: Json): value is WebsiteConfig {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    'primaryColor' in value &&
    typeof value.primaryColor === 'string' &&
    'preamble' in value &&
    typeof value.preamble === 'string'
  );
}