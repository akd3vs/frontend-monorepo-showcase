import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Feature flag definition with its current resolved value.
 */
interface FeatureFlagEntry {
  name: string;
  description: string;
  defaultValue: boolean;
  currentValue: boolean;
}

/**
 * The feature flags API shape exposed by the host via window.__FEATURE_FLAGS_API__.
 */
interface FeatureFlagsAPI {
  getAllFlags: () => FeatureFlagEntry[];
  setFlag: (name: string, value: boolean) => void;
}

declare global {
  interface Window {
    __FEATURE_FLAGS_API__?: FeatureFlagsAPI;
  }
}

/**
 * Floating devtools widget with feature flag toggles.
 *
 * Collapsed state: Small fixed-position button (bottom-right).
 * Expanded state: Panel listing all feature flags with toggles.
 *
 * Consumes the feature flag API from window.__FEATURE_FLAGS_API__
 * which is set by the host-shell FeatureFlagProvider.
 *
 * Can be disabled via VITE_DISABLE_DEVTOOLS environment variable.
 */
export default function DevtoolsWidget() {
  // Disable widget if environment variable is set
  if (import.meta.env.VITE_DISABLE_DEVTOOLS) {
    return null;
  }

  return <DevtoolsWidgetInner />;
}

function DevtoolsWidgetInner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [flags, setFlags] = useState<FeatureFlagEntry[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const refreshFlags = useCallback(() => {
    const api = window.__FEATURE_FLAGS_API__;
    if (api) {
      setFlags(api.getAllFlags());
    }
  }, []);

  // Refresh flags when panel opens and on initial mount
  useEffect(() => {
    refreshFlags();
  }, [refreshFlags, isExpanded]);

  // Close on Escape key
  useEffect(() => {
    if (!isExpanded) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsExpanded(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleToggle = useCallback(
    (flagName: string, currentValue: boolean) => {
      const api = window.__FEATURE_FLAGS_API__;
      if (api) {
        const newValue = !currentValue;
        api.setFlag(flagName, newValue);
        // Optimistically update local state instead of reading back stale values
        setFlags((prev) =>
          prev.map((flag) =>
            flag.name === flagName ? { ...flag, currentValue: newValue } : flag,
          ),
        );
      }
    },
    [],
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const api = window.__FEATURE_FLAGS_API__;
  if (!api) {
    return null;
  }

  return (
    <div data-testid="devtools-widget" style={containerStyle}>
      {isExpanded && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Feature Flags"
          style={panelStyle}
        >
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Feature Flags</h2>
          </div>
          <ul style={flagListStyle}>
            {flags.map((flag) => (
              <li key={flag.name} style={flagItemStyle}>
                <div style={flagInfoStyle}>
                  <span style={flagNameStyle}>{flag.name}</span>
                  <span style={flagDescStyle}>{flag.description}</span>
                </div>
                <button
                  role="switch"
                  aria-checked={flag.currentValue}
                  aria-label={`Toggle ${flag.name}`}
                  onClick={() => handleToggle(flag.name, flag.currentValue)}
                  style={{
                    ...toggleBaseStyle,
                    ...(flag.currentValue ? toggleOnStyle : toggleOffStyle),
                  }}
                >
                  <span
                    style={{
                      ...toggleKnobStyle,
                      ...(flag.currentValue ? knobOnStyle : knobOffStyle),
                    }}
                  />
                </button>
              </li>
            ))}
          </ul>
          {flags.length === 0 && (
            <p style={emptyStyle}>No feature flags registered.</p>
          )}
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={toggleExpanded}
        aria-label={isExpanded ? 'Close devtools panel' : 'Open devtools panel'}
        aria-expanded={isExpanded}
        style={fabStyle}
      >
        <WrenchIcon />
      </button>
    </div>
  );
}

/**
 * Wrench/gear icon for the floating action button.
 */
function WrenchIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '8px',
};

const fabStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: 'none',
  background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
  color: '#e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

const panelStyle: React.CSSProperties = {
  width: '320px',
  maxHeight: '400px',
  overflowY: 'auto',
  background: 'rgba(30, 30, 46, 0.95)',
  backdropFilter: 'blur(12px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  padding: '16px',
};

const panelHeaderStyle: React.CSSProperties = {
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: '#e0e0e0',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
};

const flagListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const flagItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.04)',
};

const flagInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
  marginRight: '12px',
};

const flagNameStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#e0e0e0',
  fontFamily: 'monospace',
};

const flagDescStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888',
};

const toggleBaseStyle: React.CSSProperties = {
  position: 'relative',
  width: '40px',
  height: '22px',
  borderRadius: '11px',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  flexShrink: 0,
  padding: 0,
};

const toggleOnStyle: React.CSSProperties = {
  background: '#4caf50',
};

const toggleOffStyle: React.CSSProperties = {
  background: '#555',
};

const toggleKnobStyle: React.CSSProperties = {
  position: 'absolute',
  top: '2px',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  background: '#fff',
  transition: 'left 0.2s ease',
  pointerEvents: 'none',
};

const knobOnStyle: React.CSSProperties = {
  left: '20px',
};

const knobOffStyle: React.CSSProperties = {
  left: '2px',
};

const emptyStyle: React.CSSProperties = {
  color: '#888',
  fontSize: '12px',
  textAlign: 'center',
  padding: '16px 0',
  margin: 0,
};
