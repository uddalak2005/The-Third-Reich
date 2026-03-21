import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors p-0.5">
      {copied ? <Check className="w-3.5 h-3.5 text-sentinel-green" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
