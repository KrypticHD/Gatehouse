export interface NonceResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface SessionResponse {
  authenticated: boolean;
  address?: string;
  chainId?: number;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}) as { error?: string });
    throw new Error(payload.error ?? "request_failed");
  }

  return response.json() as Promise<T>;
}

export function fetchNonce(address: string, chainId: number): Promise<NonceResponse> {
  return postJson<NonceResponse>("/api/auth/nonce", { address, chainId });
}

export function verifySignature(nonce: string, signature: string): Promise<{ ok: true }> {
  return postJson<{ ok: true }>("/api/auth/verify", { nonce, signature });
}

export async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch("/api/auth/session");
  if (!response.ok) {
    return { authenticated: false };
  }
  return response.json() as Promise<SessionResponse>;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
