type StatusMessageProps = {
  type: 'success' | 'error' | 'info';
  message?: string;
};

const statusClasses: Record<StatusMessageProps['type'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function StatusMessage({ type, message }: StatusMessageProps) {
  if (!message) return null;
  return <p className={`rounded-md border px-3 py-2 text-sm ${statusClasses[type]}`}>{message}</p>;
}

