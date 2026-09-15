import type { CommunityDraftInput } from "@/lib/validation/community-draft";

export interface CreateCommunityResponse {
  id: string;
  slug: string;
}

export interface ApiErrorBody {
  error: string;
  details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
}

export class CommunitiesApiError extends Error {
  details?: ApiErrorBody["details"];

  constructor(body: ApiErrorBody) {
    super(body.error);
    this.details = body.details;
  }
}

export async function createCommunity(draft: CommunityDraftInput): Promise<CreateCommunityResponse> {
  const response = await fetch("/api/communities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  const body = (await response.json().catch(() => ({}))) as CreateCommunityResponse | ApiErrorBody;

  if (!response.ok) {
    throw new CommunitiesApiError(body as ApiErrorBody);
  }

  return body as CreateCommunityResponse;
}

export async function submitCommunityForVerification(communityId: string): Promise<void> {
  const response = await fetch(`/api/communities/${communityId}/submit`, { method: "POST" });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "request_failed" }))) as ApiErrorBody;
    throw new CommunitiesApiError(body);
  }
}
