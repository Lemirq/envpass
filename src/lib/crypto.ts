// Client-side encryption for secret values using AES-GCM.
// The room's invite code is used as the password to derive the encryption key
// via PBKDF2. This means anyone with the invite code can decrypt — which maps
// perfectly to room membership.
//
// TODO: Replace with WorkOS Vault integration for production use.

const SALT = new TextEncoder().encode("envpass-v1");
const ITERATIONS = 100_000;

async function deriveKey(inviteCode: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(inviteCode),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptSecret(
  plaintext: string,
  inviteCode: string
): Promise<string> {
  const key = await deriveKey(inviteCode);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Pack iv + ciphertext into a single base64 string
  const packed = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  packed.set(iv);
  packed.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...packed));
}

export async function decryptSecret(
  encrypted: string,
  inviteCode: string
): Promise<string> {
  const key = await deriveKey(inviteCode);
  const packed = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

  const iv = packed.slice(0, 12);
  const ciphertext = packed.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}
