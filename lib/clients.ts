export interface RoofingClient {
  id: string;
  name: string;
  market: string;
  services: string;
  avgTicket?: string;
  differentiators: string[];
  proofPoints: string[];
  type: 'quotespark' | 'roofing';
  // Meta integration
  ad_account_id?: string;   // format: act_XXXXXXXXXX or just the number
  meta_access_token?: string;
}

export const CLIENTS: RoofingClient[] = [
  {
    id: 'quotespark',
    name: 'QuoteSpark',
    market: 'National',
    services: 'Exclusive roofing lead generation for companies scaling to $1.1M/month',
    differentiators: [],
    proofPoints: [],
    type: 'quotespark',
  },

  // ─── Add roofing clients below ───────────────────────────────────────────
  // Copy this block and fill in real data for each client:
  //
  // {
  //   id: 'abc-roofing',              // url-safe, no spaces
  //   name: 'ABC Roofing',            // display name on tab
  //   market: 'Phoenix, AZ',          // city/region — used in ad copy
  //   services: 'roof replacement, roof repair, gutters, free inspections',
  //   avgTicket: '$14,000',           // optional — used in prompt context
  //   differentiators: [
  //     'Family-owned 20+ years',
  //     'Licensed & insured',
  //     'Lifetime warranty on labor',
  //     'Insurance claim specialists',
  //   ],
  //   proofPoints: [
  //     '500+ roofs replaced',
  //     '4.9 stars on Google (200+ reviews)',
  //     '$0 out of pocket for most insurance claims',
  //   ],
  //   type: 'roofing',
  // },
];
