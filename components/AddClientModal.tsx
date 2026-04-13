'use client';

import { useState, useEffect } from 'react';
import { RoofingClient } from '@/lib/clients';
import { slugify } from '@/lib/client-store';

interface AddClientModalProps {
  existingClient?: RoofingClient;
  onSave: (client: RoofingClient) => void;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: '',
  market: '',
  services: '',
  avgTicket: '',
  differentiators: '',
  proofPoints: '',
  ad_account_id: '',
  meta_access_token: '',
  facebook_page_id: '',
  landing_page_url: '',
};

type FormFields = typeof EMPTY_FORM;

export default function AddClientModal({ existingClient, onSave, onClose }: AddClientModalProps) {
  const [form, setForm] = useState<FormFields>(EMPTY_FORM);

  useEffect(() => {
    if (existingClient) {
      setForm({
        name: existingClient.name,
        market: existingClient.market,
        services: existingClient.services,
        avgTicket: existingClient.avgTicket ?? '',
        differentiators: existingClient.differentiators.join('\n'),
        proofPoints: existingClient.proofPoints.join('\n'),
        ad_account_id: existingClient.ad_account_id ?? '',
        meta_access_token: existingClient.meta_access_token ?? '',
        facebook_page_id: existingClient.facebook_page_id ?? '',
        landing_page_url: existingClient.landing_page_url ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [existingClient]);

  function update(field: keyof FormFields, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const client: RoofingClient = {
      id: existingClient?.id ?? slugify(form.name),
      name: form.name.trim(),
      market: form.market.trim(),
      services: form.services.trim(),
      avgTicket: form.avgTicket.trim() || undefined,
      differentiators: form.differentiators.split('\n').map((l) => l.trim()).filter(Boolean),
      proofPoints: form.proofPoints.split('\n').map((l) => l.trim()).filter(Boolean),
      type: 'roofing',
      ad_account_id: form.ad_account_id.trim() || undefined,
      meta_access_token: form.meta_access_token.trim() || undefined,
      facebook_page_id: form.facebook_page_id.trim() || undefined,
      landing_page_url: form.landing_page_url.trim() || undefined,
    };
    onSave(client);
  }

  const isEditing = !!existingClient;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? `Edit ${existingClient!.name}` : 'New Roofing Client'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <Field label="Business Name" required>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="ABC Roofing" className={inputCls} />
          </Field>

          <Field label="Market / City" required>
            <input required value={form.market} onChange={(e) => update('market', e.target.value)} placeholder="Phoenix, AZ" className={inputCls} />
          </Field>

          <Field label="Services" required>
            <input required value={form.services} onChange={(e) => update('services', e.target.value)} placeholder="roof replacement, repairs, gutters, free inspections" className={inputCls} />
          </Field>

          <Field label="Average Job Ticket" hint="optional">
            <input value={form.avgTicket} onChange={(e) => update('avgTicket', e.target.value)} placeholder="$14,000" className={inputCls} />
          </Field>

          <Field label="Differentiators" hint="one per line">
            <textarea value={form.differentiators} onChange={(e) => update('differentiators', e.target.value)} placeholder={"Family-owned 20+ years\nLicensed & insured\nLifetime warranty on labor"} rows={4} className={textareaCls} />
          </Field>

          <Field label="Proof Points" hint="one per line">
            <textarea value={form.proofPoints} onChange={(e) => update('proofPoints', e.target.value)} placeholder={"500+ roofs replaced\n4.9 stars on Google (200+ reviews)\n$0 out of pocket for most claims"} rows={4} className={textareaCls} />
          </Field>

          {/* Meta Integration */}
          <div className="border-t border-zinc-700 pt-5 space-y-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Meta Integration</p>

            <Field label="Ad Account ID" hint="act_XXXXXXXXXX">
              <input value={form.ad_account_id} onChange={(e) => update('ad_account_id', e.target.value)} placeholder="act_XXXXXXXXXX" className={`${inputCls} font-mono text-sm`} />
            </Field>

            <Field label="Access Token">
              <textarea value={form.meta_access_token} onChange={(e) => update('meta_access_token', e.target.value)} placeholder="EAA..." rows={2} className={`${textareaCls} font-mono text-xs`} />
            </Field>

            <Field label="Facebook Page ID" hint="numeric page ID">
              <input value={form.facebook_page_id} onChange={(e) => update('facebook_page_id', e.target.value)} placeholder="123456789012345" className={`${inputCls} font-mono text-sm`} />
            </Field>

            <Field label="Landing Page URL" hint="click-through for ads">
              <input value={form.landing_page_url} onChange={(e) => update('landing_page_url', e.target.value)} placeholder="https://yoursite.com/free-inspection" className={inputCls} />
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              {isEditing ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent';
const textareaCls = `${inputCls} resize-none`;

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {hint && <span className="text-zinc-500 font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
