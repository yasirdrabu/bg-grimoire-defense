import { useStore } from '../hooks/useStore';
import { useUIStore } from '../../stores/useUIStore';

export function TutorialOverlay() {
  const tutorialActive = useStore(useUIStore, (s) => s.tutorialActive);
  const tutorialMessage = useStore(useUIStore, (s) => s.tutorialMessage);
  const tutorialStep = useStore(useUIStore, (s) => s.tutorialStep);

  if (!tutorialActive || !tutorialMessage) return null;

  return (
    <div
      class="fixed inset-0 z-20"
      style={{ pointerEvents: 'none' }}
    >
      {/* Message callout — bottom-center */}
      <div
        class="hud-interactive tutorial-enter absolute bottom-24 left-1/2 rounded-lg border px-6 py-4 text-center"
        style={{
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
          background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
          borderColor: 'var(--hud-border)',
          maxWidth: '480px',
          minWidth: '280px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}
      >
        {/* Gold accent bar at top */}
        <div
          class="hud-gold-line mb-3 h-px w-full"
        />

        {/* Step indicator */}
        <div
          class="mb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--hud-muted)' }}
        >
          Tutorial · Step {tutorialStep}
        </div>

        {/* Message */}
        <div
          class="text-sm leading-relaxed"
          style={{ color: 'var(--hud-text)' }}
        >
          {tutorialMessage}
        </div>

        {/* Gold accent bar at bottom */}
        <div
          class="hud-gold-line mt-3 h-px w-full"
        />
      </div>
    </div>
  );
}
