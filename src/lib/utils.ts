import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random 6-character alphanumeric invite code
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar-looking characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Copy to clipboard with auto-clear
export async function copyToClipboard(text: string, clearAfterMs: number = 30000) {
  await navigator.clipboard.writeText(text);
  
  // Best-effort clipboard clear after timeout
  setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current === text) {
        await navigator.clipboard.writeText('');
      }
    } catch {
      // Clipboard read may be denied — that's fine
    }
  }, clearAfterMs);
}
