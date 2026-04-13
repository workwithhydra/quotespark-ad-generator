'use client';

import { useState, useEffect } from 'react';
import { AdConcept } from '@/lib/types';
import { RoofingClient } from '@/lib/clients';
import AdRenderer from './AdRenderer';
import { captureAdAsBase64 } from '@/lib/export-png';

interface ShipViewProps {
  concepts: AdConcept[];
  selectedIndices: Set<number>;
  client: RoofingClient;
  onClose: () => void;
  onToggleSelect: (i: number) => void;
  onEditClient: (client: RoofingClient) => void;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

interface AdSet {
  id: string;
  name: string;
  status: string;
}

interface PushResult {
  name: string;
  success: boolean;
  ad_id?: string;
  error?: string;
}

export default function ShipView({
  concepts,
  selectedIndices,
  client,
  onClose,
  onToggleSelect,
  onEditClient,
}: ShipViewProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [adSetMap, setAdSetMap] = useState<Record<string, AdSet[]>>({});
  const [adSetsLoading, setAdSetsLoading] = useState<string | null>(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);
  const [selectedAdSetName, setSelectedAdSetName] = useState<string>('');
  const [pushing, setPushing] = useState(false);
  const [results, setResults] = useState<PushResult[]>([]);

  const THUMB_SCALE = 0.26;
  const THUMB_SIZE = Math.round(1080 * THUMB_SCALE); // ~281px

  const hasCredentials = !!(client.ad_account_id && client.meta_access_token);
  const hasPageAndUrl = !!(client.facebook_page_id && client.landing_page_url);
  const selectedConcepts = Array.from(selectedIndices).map((i) => concepts[i]);
  const canPush = hasCredentials && hasPageAndUrl && selectedAdSetId && selectedConcepts.length > 0 && !pushing;

  // Load campaigns when view opens
  useEffect(() => {
    if (!hasCredentials) return;
    loadCampaigns();
  }, [client.id]);

  async function loadCampaigns() {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const res = await fetch('/api/meta/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: client.ad_account_id,
          access_token: client.meta_access_token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load campaigns');
      setCampaigns(data.campaigns);
    } catch (err) {
      setCampaignsError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setCampaignsLoading(false);
    }
  }

  async function toggleCampaign(campaignId: string) {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
      return;
    }
    setExpandedCampaignId(campaignId);
    if (adSetMap[campaignId]) return; // already loaded

    setAdSetsLoading(campaignId);
    try {
      const res = await fetch('/api/meta/adsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          access_token: client.meta_access_token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdSetMap((prev) => ({ ...prev, [campaignId]: data.adsets }));
    } catch (err) {
      setAdSetMap((prev) => ({ ...prev, [campaignId]: [] }));
    } finally {
      setAdSetsLoading(null);
    }
  }

  async function handlePush() {
    if (!canPush) return;
    setPushing(true);
    setResults([]);

    try {
      const ads = [];
      for (let i = 0; i < selectedConcepts.length; i++) {
        const concept = selectedConcepts[i];
        const elementId = `ship-full-${i}`;
        const base64 = await captureAdAsBase64(elementId);
        ads.push({
          name: concept.name,
          base64,
          headline: concept.text_overlay.headline,
          body: concept.text_overlay.subhead,
        });
      }

      const res = await fetch('/api/meta/create-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_account_id: client.ad_account_id,
          access_token: client.meta_access_token,
          facebook_page_id: client.facebook_page_id,
          landing_page_url: client.landing_page_url,
          adset_id: selectedAdSetId,
          ads,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Push failed');
      setResults(data.results);
    } catch (err) {
      setResults([{ name: 'Error', success: false, error: err instanceof Error ? err.message : 'Unknown error' }]);
    } finally {
      setPushing(false);
    }
  }

  const successCount = results.filter((r) => r.success).length;

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800 flex-shrink-0">
        <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          ← Generator
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold">Ship to Meta</h1>
          <p className="text-zinc-500 text-xs">{client.name}{client.ad_account_id ? ` · ${client.ad_account_id}` : ''}</p>
        </div>
        {results.length > 0 && successCount > 0 && client.ad_account_id && (
          <a
            href={`https://adsmanager.facebook.com/adsmanager/manage/ads?act=${client.ad_account_id.replace(/^act_/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            Open Ads Manager →
          </a>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — ad selection */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
            <span className="text-sm font-medium text-zinc-300">
              {selectedConcepts.length} ad{selectedConcepts.length !== 1 ? 's' : ''} selected
            </span>
            {concepts.length > 0 && (
              <div className="flex gap-3 text-xs text-zinc-500">
                <button onClick={() => concepts.forEach((_, i) => !selectedIndices.has(i) && onToggleSelect(i))} className="hover:text-zinc-200">Select all</button>
                <button onClick={() => Array.from(selectedIndices).forEach(onToggleSelect)} className="hover:text-zinc-200">Clear</button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {concepts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm text-center px-8">
                No ads generated yet. Go back to the generator and create some.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {concepts.map((concept, i) => {
                  const isSelected = selectedIndices.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => onToggleSelect(i)}
                      className={`text-left rounded-lg overflow-hidden border-2 transition-colors ${
                        isSelected ? 'border-orange-500' : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      <div style={{ width: THUMB_SIZE, height: THUMB_SIZE, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 1080, height: 1080, transform: `scale(${THUMB_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                          <AdRenderer concept={concept} />
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                        )}
                      </div>
                      <div className="p-2 bg-zinc-800">
                        <p className="text-white text-xs font-medium truncate">{concept.name}</p>
                        <p className="text-zinc-500 text-xs truncate">{concept.angle.split(' —')[0]}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — campaign browser */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex-shrink-0">
            <span className="text-sm font-medium text-zinc-300">Select Destination</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* No credentials */}
            {!hasCredentials && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-4">
                <p className="text-yellow-300 font-medium text-sm">Meta credentials not set up</p>
                <p className="text-yellow-500 text-xs mt-1">Add an Ad Account ID and Access Token to this client to connect.</p>
                <button onClick={() => onEditClient(client)} className="text-orange-400 hover:text-orange-300 text-xs underline mt-2 block">
                  Edit client settings →
                </button>
              </div>
            )}

            {/* Missing page/URL */}
            {hasCredentials && !hasPageAndUrl && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-4 mb-4">
                <p className="text-yellow-300 font-medium text-sm">Facebook Page ID and Landing URL required</p>
                <p className="text-yellow-500 text-xs mt-1">Meta needs a page and destination URL to create ad creatives.</p>
                <button onClick={() => onEditClient(client)} className="text-orange-400 hover:text-orange-300 text-xs underline mt-2 block">
                  Edit client settings →
                </button>
              </div>
            )}

            {/* Campaigns loading */}
            {hasCredentials && campaignsLoading && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm py-4">
                <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                Loading campaigns...
              </div>
            )}

            {/* Campaigns error */}
            {hasCredentials && campaignsError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
                <p className="text-red-300 text-sm">{campaignsError}</p>
                <button onClick={loadCampaigns} className="text-red-400 hover:text-red-200 text-xs underline mt-1">Retry</button>
              </div>
            )}

            {/* Campaign list */}
            {hasCredentials && !campaignsLoading && campaigns.length > 0 && (
              <div className="space-y-1">
                {campaigns.map((campaign) => {
                  const isExpanded = expandedCampaignId === campaign.id;
                  const adSets = adSetMap[campaign.id] ?? [];
                  const isLoadingAdSets = adSetsLoading === campaign.id;

                  return (
                    <div key={campaign.id}>
                      <button
                        onClick={() => toggleCampaign(campaign.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-zinc-500 text-xs w-3">{isExpanded ? '▾' : '▸'}</span>
                          <span className="text-white text-sm font-medium truncate">{campaign.name}</span>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${
                          campaign.status === 'ACTIVE' ? 'bg-green-900/40 text-green-400' : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ml-5 space-y-0.5 mb-1">
                          {isLoadingAdSets && (
                            <div className="flex items-center gap-2 text-zinc-500 text-xs px-3 py-2">
                              <span className="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin" />
                              Loading ad sets...
                            </div>
                          )}
                          {!isLoadingAdSets && adSets.length === 0 && (
                            <p className="text-zinc-600 text-xs px-3 py-2">No ad sets found</p>
                          )}
                          {adSets.map((adSet) => {
                            const isSelected = selectedAdSetId === adSet.id;
                            return (
                              <button
                                key={adSet.id}
                                onClick={() => {
                                  setSelectedAdSetId(adSet.id);
                                  setSelectedAdSetName(adSet.name);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                  isSelected
                                    ? 'bg-orange-500/20 border border-orange-500/50'
                                    : 'hover:bg-zinc-800'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                                    isSelected ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
                                  }`} />
                                  <span className={`text-sm truncate ${isSelected ? 'text-orange-300' : 'text-zinc-300'}`}>
                                    {adSet.name}
                                  </span>
                                </div>
                                <span className={`text-xs flex-shrink-0 ml-2 ${
                                  adSet.status === 'ACTIVE' ? 'text-green-500' : 'text-zinc-500'
                                }`}>
                                  {adSet.status}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {hasCredentials && !campaignsLoading && campaigns.length === 0 && !campaignsError && (
              <p className="text-zinc-500 text-sm">No campaigns found in this account.</p>
            )}
          </div>

          {/* Push results */}
          {results.length > 0 && (
            <div className="px-5 py-4 border-t border-zinc-800 flex-shrink-0 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-sm font-medium text-zinc-300">
                {successCount}/{results.length} pushed successfully
              </p>
              {results.map((r, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                  r.success ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'
                }`}>
                  <span className={r.success ? 'text-green-400' : 'text-red-400'}>{r.success ? '✓' : '✗'}</span>
                  <div className="min-w-0">
                    <span className={r.success ? 'text-green-300' : 'text-red-300'}>{r.name}</span>
                    {r.success && r.ad_id && <p className="text-zinc-500 font-mono mt-0.5">ad_id: {r.ad_id}</p>}
                    {!r.success && r.error && <p className="text-red-400 mt-0.5">{r.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Push button */}
          <div className="px-5 py-4 border-t border-zinc-800 flex-shrink-0">
            <button
              onClick={handlePush}
              disabled={!canPush}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {pushing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Pushing ads...
                </>
              ) : selectedAdSetId ? (
                `Push ${selectedConcepts.length} Ad${selectedConcepts.length !== 1 ? 's' : ''} to "${selectedAdSetName}"`
              ) : (
                'Select an ad set above'
              )}
            </button>
            {selectedAdSetId && (
              <p className="text-zinc-600 text-xs text-center mt-2">Ads are created as PAUSED — activate in Ads Manager</p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden full-res renders for capture */}
      <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }}>
        {selectedConcepts.map((concept, i) => (
          <AdRenderer key={i} concept={concept} id={`ship-full-${i}`} />
        ))}
      </div>
    </div>
  );
}
