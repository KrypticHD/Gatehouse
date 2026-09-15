import { NextResponse } from "next/server";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const waitlistRequestSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).regex(EMAIL_PATTERN),
  // Honeypot: a real visitor never fills this hidden field in; a bot filling out every field
  // does. Filled-in submissions get a fake success and are never written to the database.
  company: z.string().optional(),
  source: z.enum(["hero", "footer"]).default("hero"),
});

const GENERIC_SUCCESS = { message: "You’re on the early list." };

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (
    body &&
    typeof body === "object" &&
    typeof (body as { company?: unknown }).company === "string" &&
    (body as { company: string }).company.length > 0
  ) {
    return NextResponse.json(GENERIC_SUCCESS);
  }

  const parsed = waitlistRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await prisma.waitlistSignup.create({
      data: { email: parsed.data.email, source: parsed.data.source },
    });
    return NextResponse.json(GENERIC_SUCCESS);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "You’re already on the early list." });
    }
    console.error("Waitlist signup failed", error);
    return NextResponse.json({ message: "Couldn’t save your email. Please try again." }, { status: 500 });
  }
}
