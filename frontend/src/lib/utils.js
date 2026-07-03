import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const fmt = {
  naira: (n) => '₦' + Number(n || 0).toLocaleString('en-NG'),
  date:  (d) => d ? new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—',
  time:  (d) => d ? new Date(d).toLocaleString('en-NG', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—',
};
