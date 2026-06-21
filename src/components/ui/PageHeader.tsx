import type { ReactNode } from "react";

// PageHeader menampilkan judul halaman dan area aksi kanan.
export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold tracking-tight text-[#0a2a55] sm:text-2xl">
          {title}
        </h1>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0">{action}</div> : null}
    </div>
  );
}
