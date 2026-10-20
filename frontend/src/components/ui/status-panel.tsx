import Link from "next/link";

interface StatusPanelProps {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

export function StatusPanel({ title, message, actionHref, actionLabel }: StatusPanelProps) {
  return (
    <div className="panel col-span-full py-14 text-center" role="status">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-slate-400">{message}</p>
      {actionHref && actionLabel ? <Link className="button-primary mt-6 inline-flex" href={actionHref}>{actionLabel}</Link> : null}
    </div>
  );
}

