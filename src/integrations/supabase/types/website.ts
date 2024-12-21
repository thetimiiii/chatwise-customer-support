import { Json } from './json';

export interface WebsiteConfig {
  primaryColor: string;
  preamble: string;
}

// Add type guard for runtime type checking
export const isWebsiteConfig = (value: Json): value is WebsiteConfig => {
  if (typeof value !== 'object' || value === null) return false;
  
  const config = value as Record<string, unknown>;
  return (
    typeof config.primaryColor === 'string' &&
    typeof config.preamble === 'string'
  );
};