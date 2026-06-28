import { Download, Check, X, Clock } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { FlareBadge } from '../ui/FlareBadge';
import { formatUTCLong } from '../../utils/solarPhysics';

export function AlertTimeline() {
  const alertHistory = useSolarStore((s) => s.alertHistory);

  function exportCSV() {
    const header = 'Timestamp (UTC),Detected Class,Confidence (%),Time-to-Peak (min),Actual Outcome,Result\n';
    const rows = alertHistory
      .map(
        (e) =>
          `${e.detectedAt.toISOString()},${e.predictedClass}${e.predictedMagnitude.toFixed(1)},${(e.confidence * 100).toFixed(1)},${e.timeToPeakMin},${e.actualClass ?? 'pending'},${e.isCorrect ? 'correct' : e.isFalseAlarm ? 'false_alarm' : 'pending'}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alert-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="solar-card overflow-hidden p-0">
      <div className="flex items-center justify-between p-5 pb-3 border-b border-space-border">
        <div>
          <h3 className="font-display font-bold text-xl text-white">Alert History</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Last {alertHistory.length} detected events · Mix of B/C/M/X · TSS-validated
          </p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary hover:text-white border border-space-border rounded-lg transition"
        >
          <Download className="w-3.5 h-3.5" aria-hidden />
          <span className="font-mono">CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-space-deep">
            <tr className="text-left text-[10px] uppercase tracking-wider text-text-secondary font-mono border-b border-space-border">
              <th className="px-5 py-3">Timestamp (UTC)</th>
              <th className="px-3 py-3">Detected Class</th>
              <th className="px-3 py-3">Confidence</th>
              <th className="px-3 py-3">Time-to-Peak</th>
              <th className="px-3 py-3">Actual Outcome</th>
              <th className="px-5 py-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody>
            {alertHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-text-secondary text-sm">
                  Loading alert history…
                </td>
              </tr>
            ) : (
              alertHistory.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-space-border/50 hover:bg-white/5 transition"
                >
                  <td className="px-5 py-3 font-mono text-xs text-text-primary">
                    {formatUTCLong(e.detectedAt).replace(' UTC', '')}
                  </td>
                  <td className="px-3 py-3">
                    <FlareBadge
                      flareClass={e.predictedClass}
                      magnitude={e.predictedMagnitude}
                      size="sm"
                    />
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-white">
                    {(e.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">
                    <span className="inline-flex items-center gap-1 text-text-primary">
                      <Clock className="w-3 h-3 text-text-secondary" aria-hidden />
                      {e.timeToPeakMin} min
                    </span>
                    <span className="text-text-muted ml-1">±{e.timeToPeakUncertainty}</span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">
                    {e.actualClass ? (
                      <FlareBadge
                        flareClass={e.actualClass}
                        magnitude={e.actualMagnitude}
                        size="sm"
                      />
                    ) : (
                      <span className="text-text-muted">— pending</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {e.isCorrect === true ? (
                      <span className="inline-flex items-center gap-1 text-success-green font-mono text-xs">
                        <Check className="w-3.5 h-3.5" aria-hidden />
                        Correct
                      </span>
                    ) : e.isFalseAlarm === true ? (
                      <span className="inline-flex items-center gap-1 text-solar-red font-mono text-xs">
                        <X className="w-3.5 h-3.5" aria-hidden />
                        False Alarm
                      </span>
                    ) : (
                      <span className="text-text-muted font-mono text-xs">— Pending</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}