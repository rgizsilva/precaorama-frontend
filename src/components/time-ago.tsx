"use client";
import { useEffect, useState } from "react";

export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const compute = () => {
      const diff = Date.now() - new Date(iso).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) setText("agora mesmo");
      else if (m < 60) setText(`${m}min atrás`);
      else {
        const h = Math.floor(m / 60);
        if (h < 24) setText(`${h}h atrás`);
        else setText(`${Math.floor(h / 24)}d atrás`);
      }
    };
    compute();
    const t = setInterval(compute, 60000);
    return () => clearInterval(t);
  }, [iso]);

  return (
    <span className={className} suppressHydrationWarning>
      {text || new Date(iso).toLocaleDateString("pt-BR")}
    </span>
  );
}
