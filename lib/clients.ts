export interface RoofingClient {
  id: string;
  name: string;
  market: string;
  services: string;
  avgTicket?: string;
  differentiators: string[];
  proofPoints: string[];
  type: 'quotespark' | 'roofing';
  protected?: boolean;       // cannot be deleted, only edited
  // Meta integration
  ad_account_id?: string;
  meta_access_token?: string;
  facebook_page_id?: string;
  landing_page_url?: string;
}

export const QUOTESPARK_DEFAULT: RoofingClient = {
  id: 'quotespark',
  name: 'QuoteSpark',
  market: 'National',
  services: 'Exclusive roofing lead generation for companies scaling to $1.1M/month',
  differentiators: [],
  proofPoints: [],
  type: 'quotespark',
  protected: true,
};

// Keep for backwards compatibility
export const CLIENTS: RoofingClient[] = [QUOTESPARK_DEFAULT];
