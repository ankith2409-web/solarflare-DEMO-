import { useState } from 'react';
import { X, Bell, Volume2, Link as LinkIcon, Mail, Phone, ShieldAlert, Check } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { audioAlert } from '../../utils/audioAlert';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertSettingsModal({ isOpen, onClose }: AlertSettingsModalProps) {
  const alertSettings = useSolarStore((s) => s.alertSettings);
  const setAlertSettings = useSolarStore((s) => s.setAlertSettings);

  const [slackUrl, setSlackUrl] = useState(alertSettings.slackWebhookUrl);
  const [emailAddr, setEmailAddr] = useState(alertSettings.emailAddress);
  const [smsPhone, setSmsPhone] = useState(alertSettings.smsPhoneNumber);

  const [slackStatus, setSlackStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success'>('idle');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'success'>('idle');

  if (!isOpen) return null;

  const handleBrowserToggle = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permission denied for desktop notifications.');
        return;
      }
    }

    setAlertSettings({ browserEnabled: !alertSettings.browserEnabled });
  };

  const handleTestSlack = async () => {
    if (!slackUrl) return;
    setSlackStatus('testing');
    try {
      // Perform a real POST fetch but with mode: 'no-cors' to prevent CORS block on slack/discord endpoints
      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 *Solar Flare Warning System* — Test Webhook connection successful!`
        }),
        mode: 'no-cors'
      });
      setSlackStatus('success');
      setTimeout(() => setSlackStatus('idle'), 3000);
    } catch {
      setSlackStatus('error');
      setTimeout(() => setSlackStatus('idle'), 3000);
    }
  };

  const handleTestEmail = () => {
    if (!emailAddr) return;
    setEmailStatus('success');
    audioAlert.playChirp();
    setTimeout(() => setEmailStatus('idle'), 3000);
  };

  const handleTestSms = () => {
    if (!smsPhone) return;
    setSmsStatus('success');
    audioAlert.playChirp();
    setTimeout(() => setSmsStatus('idle'), 3000);
  };

  const handleSave = () => {
    setAlertSettings({
      slackWebhookUrl: slackUrl,
      emailAddress: emailAddr,
      smsPhoneNumber: smsPhone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-black/70 backdrop-blur-md p-4">
      <div className="solar-card w-full max-w-lg border border-space-border relative overflow-hidden bg-space-deep/95 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-space-border">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-isro-orange glow-orange" />
            <h3 className="font-display font-bold text-white text-lg">Alert Channel Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition p-1 hover:bg-space-mid rounded"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {/* Audio siren */}
          <div className="flex items-center justify-between bg-space-mid/40 p-3 rounded-lg border border-space-border/50">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-solar-cyan mt-0.5" />
              <div>
                <h4 className="text-white text-sm font-semibold">Audio Warning Siren</h4>
                <p className="text-xs text-text-secondary">Sound an alert chirp when an active M/X-class flare is detected.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertSettings.audioEnabled}
                onChange={(e) => setAlertSettings({ audioEnabled: e.target.checked })}
                className="sr-only peer"
                aria-label="Audio Warning Siren"
              />
              <div className="w-9 h-5 bg-space-black border border-space-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-solar-cyan/80 peer-checked:after:bg-white"></div>
            </label>
          </div>

          {/* Browser Desktop notifications */}
          <div className="flex items-center justify-between bg-space-mid/40 p-3 rounded-lg border border-space-border/50">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-solar-cyan mt-0.5" />
              <div>
                <h4 className="text-white text-sm font-semibold">Browser Push Notifications</h4>
                <p className="text-xs text-text-secondary">Push browser notifications to your desktop even when window is backgrounded.</p>
              </div>
            </div>
            <button
              onClick={handleBrowserToggle}
              className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all ${
                alertSettings.browserEnabled
                  ? 'bg-success-green/20 text-success-green border border-success-green/50'
                  : 'bg-space-black hover:bg-space-border/50 text-white border border-space-border'
              }`}
            >
              {alertSettings.browserEnabled ? 'ACTIVE' : 'ENABLE'}
            </button>
          </div>

          {/* Slack/Discord webhooks */}
          <div className="space-y-2 bg-space-mid/40 p-3 rounded-lg border border-space-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-solar-cyan" />
                <h4 className="text-white text-sm font-semibold">Slack / Discord Webhooks</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSettings.slackEnabled}
                  onChange={(e) => setAlertSettings({ slackEnabled: e.target.checked })}
                  className="sr-only peer"
                  aria-label="Slack / Discord Webhooks"
                />
                <div className="w-9 h-5 bg-space-black border border-space-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-solar-cyan/80 peer-checked:after:bg-white"></div>
              </label>
            </div>
            {alertSettings.slackEnabled && (
              <div className="flex gap-2 mt-2">
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackUrl}
                  onChange={(e) => setSlackUrl(e.target.value)}
                  className="flex-1 bg-space-black border border-space-border rounded px-3 py-1.5 text-xs text-white font-mono placeholder:text-text-muted focus:outline-none focus:border-solar-cyan"
                  aria-label="Slack or Discord webhook URL"
                />
                <button
                  onClick={handleTestSlack}
                  disabled={!slackUrl || slackStatus === 'testing'}
                  className="px-3 py-1.5 bg-space-black border border-space-border hover:bg-space-border/50 text-white font-bold rounded text-xs transition"
                >
                  {slackStatus === 'testing' ? 'TESTING...' : slackStatus === 'success' ? 'SENT!' : 'TEST'}
                </button>
              </div>
            )}
          </div>

          {/* Email notifications */}
          <div className="space-y-2 bg-space-mid/40 p-3 rounded-lg border border-space-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-solar-cyan" />
                <h4 className="text-white text-sm font-semibold">Email Alerts (Simulated)</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSettings.emailEnabled}
                  onChange={(e) => setAlertSettings({ emailEnabled: e.target.checked })}
                  className="sr-only peer"
                  aria-label="Email Alerts"
                />
                <div className="w-9 h-5 bg-space-black border border-space-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-solar-cyan/80 peer-checked:after:bg-white"></div>
              </label>
            </div>
            {alertSettings.emailEnabled && (
              <div className="flex gap-2 mt-2">
                <input
                  type="email"
                  placeholder="operations@isro.gov.in"
                  value={emailAddr}
                  onChange={(e) => setEmailAddr(e.target.value)}
                  className="flex-1 bg-space-black border border-space-border rounded px-3 py-1.5 text-xs text-white font-mono placeholder:text-text-muted focus:outline-none focus:border-solar-cyan"
                  aria-label="Email Address"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={!emailAddr || emailStatus === 'success'}
                  className="px-3 py-1.5 bg-space-black border border-space-border hover:bg-space-border/50 text-white font-bold rounded text-xs transition"
                >
                  {emailStatus === 'success' ? 'SENT!' : 'TEST'}
                </button>
              </div>
            )}
          </div>

          {/* SMS notifications */}
          <div className="space-y-2 bg-space-mid/40 p-3 rounded-lg border border-space-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-solar-cyan" />
                <h4 className="text-white text-sm font-semibold">SMS Alerts (Simulated)</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSettings.smsEnabled}
                  onChange={(e) => setAlertSettings({ smsEnabled: e.target.checked })}
                  className="sr-only peer"
                  aria-label="SMS Alerts"
                />
                <div className="w-9 h-5 bg-space-black border border-space-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-solar-cyan/80 peer-checked:after:bg-white"></div>
              </label>
            </div>
            {alertSettings.smsEnabled && (
              <div className="flex gap-2 mt-2">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className="flex-1 bg-space-black border border-space-border rounded px-3 py-1.5 text-xs text-white font-mono placeholder:text-text-muted focus:outline-none focus:border-solar-cyan"
                  aria-label="Phone Number"
                />
                <button
                  onClick={handleTestSms}
                  disabled={!smsPhone || smsStatus === 'success'}
                  className="px-3 py-1.5 bg-space-black border border-space-border hover:bg-space-border/50 text-white font-bold rounded text-xs transition"
                >
                  {smsStatus === 'success' ? 'SENT!' : 'TEST'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-space-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-space-border hover:bg-space-mid rounded text-sm text-white font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-isro-orange text-space-black hover:bg-isro-amber hover:glow-orange font-bold rounded text-sm transition"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
