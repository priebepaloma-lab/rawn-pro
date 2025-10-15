import type { ChatAttachmentData } from "@/types/chat";

type AttachmentCardProps = {
  attachment: ChatAttachmentData;
};

export function AttachmentCard({ attachment }: AttachmentCardProps) {
  return (
    <div className="ml-0 max-w-xl rounded-3xl border border-[#E8E9EC] bg-white/95 p-4 shadow-[0_14px_28px_rgba(30,30,30,0.06)] backdrop-blur sm:ml-[72px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" />
              <path d="M7 10L12 15L17 10" />
              <path d="M12 15V3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.32em] text-[#B9B9C5]">
              {attachment.tipo}
            </span>
            <span className="text-base font-semibold text-[#1E1E1E]">
              {attachment.titulo}
            </span>
          </div>
        </div>
        {attachment.descricao ? (
          <p className="text-sm leading-6 text-[#444650]">
            {attachment.descricao}
          </p>
        ) : null}
        {attachment.url ? (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0A84FF] px-4 py-2 text-sm font-medium text-[#0A84FF] transition hover:bg-[#0A84FF] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A84FF]"
          >
            Abrir anexo
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13V19C18 20.1 17.1 21 16 21H6C4.9 21 4 20.1 4 19V9C4 7.9 4.9 7 6 7H12" />
              <path d="M15 3H21V9" />
              <path d="M10 14L21 3" />
            </svg>
          </a>
        ) : null}
      </div>
    </div>
  );
}
