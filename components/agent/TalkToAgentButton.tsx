"use client";

/** Opens the same Talk-to-me overlay as the rail / mobile dock. */
export default function TalkToAgentButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => document.querySelector<HTMLButtonElement>("[data-agent-entry]")?.click()}
      className={className}
    >
      {children}
    </button>
  );
}
