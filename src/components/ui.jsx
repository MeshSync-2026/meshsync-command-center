// Reusable UI components
import Icon from "./Icon";

export function Badge({ tone = "gray", children, className = "" }) {
  const tones = {
    ok: "bg-ok-500/15 text-ok-500",
    warn: "bg-warn-500/15 text-warn-500",
    danger: "bg-danger-600/15 text-danger-600",
    brand: "bg-brand-100 text-brand-600",
    gray: "bg-gray-200 text-gray-600",
  };

  return (
    <span className={`badge ${tones[tone] || tones.gray} ${className}`}>
      {children}
    </span>
  );
}


export function PageHeader({ title, subtitle, actions, action, icon }) {
  const acts = actions || action;

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-50 grid place-items-center text-brand-600">
            <Icon name={icon} className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {acts && <div className="flex items-center gap-2">{acts}</div>}
    </div>
  );
}


export function SectionHeader({ title, subtitle, icon }) {
  return (
    <div className="ms-section-header">
      {icon && <Icon name={icon} className="w-4 h-4 text-brand-600" />}
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ icon = "search", title, message, description, action }) {
  const label = title || message;
  const desc = description || (message ? undefined : undefined);

  return (
    <div className="ms-empty">
      <div className="ms-empty-icon">
        <Icon name={icon} className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      {desc && <p className="text-xs text-gray-500 mt-1 max-w-sm">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function MetricCard({ label, value, icon, tone = "brand", subtitle }) {
  const tones = {
    brand: "text-brand-600 bg-brand-50",
    ok: "text-ok-500 bg-ok-500/10",
    warn: "text-warn-500 bg-warn-500/10",
    danger: "text-danger-600 bg-danger-600/10",
    gray: "text-gray-600 bg-gray-100",
  };

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl grid place-items-center flex-shrink-0 ${tones[tone]}`}>
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}


export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative card w-full ${sizes[size]} max-h-[85vh] overflow-y-auto animate-slide-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onCancel, onConfirm, title, message, confirmLabel = "Confirm", danger, tone }) {
  if (!open) return null;

  const close = onClose || onCancel;
  const isDanger = danger || tone === "danger";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={close}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative card w-full max-w-sm animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 ${
                isDanger ? "bg-danger-600/15 text-danger-600" : "bg-warn-500/15 text-warn-500"
              }`}
            >
              <Icon name="alert" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={close} className="btn-secondary">Cancel</button>
            <button
              onClick={() => { onConfirm(); close(); }}
              className={danger ? "btn-danger" : "btn-primary"}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-ghost px-2 py-1"
      >
        <Icon name="chevronLeft" className="w-4 h-4" />
      </button>
      <span className="text-sm text-gray-600 px-2">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-ghost px-2 py-1"
      >
        <Icon name="chevronRight" className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return children;
}
