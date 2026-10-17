import { useState } from 'react';
import { finishedSessions } from '../domain/schedule';
import type { AppData } from '../domain/types';
import { shortDate } from './format';
import type { SyncConfig } from '../storage/sync';
import type { SyncStatus } from './useStore';

interface Props {
  data: AppData;
  config: SyncConfig | null;
  status: SyncStatus;
  onSave: (c: SyncConfig | null) => void;
  onSyncNow: () => void;
  onClose: () => void;
}

function exportBackup(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `plus-one-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function SettingsSheet({ data, config, status, onSave, onSyncNow, onClose }: Props) {
  const [owner, setOwner] = useState(config?.owner ?? '');
  const [repo, setRepo] = useState(config?.repo ?? 'plus-one-data');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    const nextToken = token.replace(/\s/g, '') || config?.token;
    if (!owner.trim() || !repo.trim() || !nextToken) return setError('Fill in all three fields first.');
    setError('');
    setToken('');
    onSave({ owner: owner.trim(), repo: repo.trim(), path: 'log.json', token: nextToken });
  };

  const statusLine =
    status.kind === 'synced'
      ? `Synced at ${status.at.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}`
      : status.kind === 'error'
        ? status.message
        : status.kind === 'offline'
          ? "You're offline. Your sessions are safe on this phone and sync when you're back online."
          : status.kind === 'syncing'
            ? 'Syncing…'
            : status.kind === 'idle'
              ? ''
              : 'Backup is off. Sessions are only on this device.';
  const last = finishedSessions(data).at(-1);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Backup</h2>
          <button className="btn-text" onClick={onClose}>Done</button>
        </div>
        <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
          Your log is saved to <span className="num">log.json</span> in a private GitHub repo. Each copy of the app
          (Safari, Home Screen, PC) needs the token once.
        </p>
        <label className="field">
          GitHub username
          <input value={owner} onChange={(e) => setOwner(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="your-username" />
        </label>
        <label className="field">
          Private repo
          <input value={repo} onChange={(e) => setRepo(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        </label>
        <label className="field">
          Fine-grained token
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            placeholder={config ? `Saved, ends in ${config.token.slice(-4)}. Paste to replace.` : 'github_pat_…'}
          />
        </label>
        {error && <p style={{ margin: 0, fontSize: 13, color: 'var(--clay-text)' }}>{error}</p>}
        <p className="muted" style={{ margin: 0, color: status.kind === 'error' ? 'var(--clay-text)' : undefined }}>{statusLine}</p>
        <p className="muted" style={{ margin: 0 }}>
          {last ? `Last session: Plan ${last.plan}, ${shortDate(last.date)}` : 'No sessions yet'}
        </p>
        <button className="btn-primary" onClick={save}>Save and sync</button>
        {config && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={onSyncNow}>Sync now</button>
            <button className="btn-secondary" onClick={() => onSave(null)}>Turn off</button>
          </div>
        )}
        <button className="btn-secondary" onClick={() => exportBackup(data)}>Export backup file</button>
      </div>
    </div>
  );
}
