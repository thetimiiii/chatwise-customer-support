import { Json } from './json';

export interface WebsiteConfig extends Record<string, Json> {
  primaryColor: string;
  preamble: string;
}