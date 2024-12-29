export interface WebsiteConfig {
  primaryColor: string;
  preamble: string;
}

export interface Website {
  id: string;
  token: string;
  config: WebsiteConfig;
}
