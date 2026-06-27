export interface LoadingIndicatorProps {
  /** Label for screen readers */
  label?: string;
}

/**
 * A simple loading spinner displayed while federated modules are loading.
 */
export function LoadingIndicator({ label = 'Loading module…' }: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '120px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'federated-spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes federated-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {label}
      </span>
    </div>
  );
}
