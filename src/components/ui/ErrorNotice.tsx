import { CircleAlert } from 'lucide-react';

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
