import { useState, useEffect } from "react";
import { fmt } from "../lib/utils";

export function Topbar({ title }) {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-NG', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    }));
  }, []);

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between h-16 px-9 bg-white border-b border-border">
      <div className="font-semibold text-[16px] text-ink">{title}</div>
      <div className="font-mono text-[12px] text-indigo-mid">{dateStr}</div>
    </div>
  );
}
