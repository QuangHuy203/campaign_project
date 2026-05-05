import { useMemo, useState } from 'react';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';

import type { CreateCampaignPayload } from '@/features/campaigns/types/campaign.types';

type CampaignFormProps = {
  isLoading: boolean;
  onSubmit: (payload: CreateCampaignPayload) => Promise<void>;
};

function toRecipientItems(raw: string): Array<{ email: string; name: string }> {
  return raw
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((email) => ({ email, name: email.split('@')[0] || 'Recipient' }));
}

export function CampaignForm({ isLoading, onSubmit }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientsInput, setRecipientsInput] = useState('');
  const recipientsPreview = useMemo(() => toRecipientItems(recipientsInput), [recipientsInput]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      name,
      subject,
      body,
      recipients: recipientsPreview,
    });
  };

  return (
    <form className="space-y-4 rounded-lg bg-white p-4 shadow" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Subject</label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Body</label>
        <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Recipients emails (comma/new line)</label>
        <Textarea rows={4} value={recipientsInput} onChange={(e) => setRecipientsInput(e.target.value)} required />
      </div>
      <p className="text-xs text-slate-500">Detected recipients: {recipientsPreview.length}</p>
      <Button type="submit" disabled={isLoading}>
        Create campaign
      </Button>
    </form>
  );
}
