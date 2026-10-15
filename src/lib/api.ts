export interface EnquiryPayload {
  name: string;
  company?: string;
  email: string;
  phone: string;
  city: string;
  spaceType: string;
  services: string[];
  timeline: string;
  message: string;
}

export interface EnquiryResponse {
  success: true;
  message: string;
  reference: string;
}

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const TIMEOUT_MS = 15000;
const TIME_ZONE = "Asia/Kolkata";
const SUCCESS_MESSAGE =
  "Thank you for reaching out to MixtCast Visual Solutions. Our AV engineering team will review your requirements and respond within 24 hours.";
const SEND_FAILED = "We couldn't send your enquiry right now. Please try again.";

/** Enquiry reference: "MXC-" + YYMMDD (India date) + "-" + 4 random uppercase alphanumerics, e.g. MXC-261015-K7Q2. */
export function createReference(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => chars[n % chars.length]).join("");
  return `MXC-${get("year")}${get("month")}${get("day")}-${random}`;
}

/**
 * Delivers an enquiry by email via Web3Forms (to the inbox the access key was created for).
 * Resolves only when Web3Forms confirms delivery; every other outcome throws a user-facing error.
 */
export async function submitEnquiry(payload: EnquiryPayload, botcheck = false): Promise<EnquiryResponse> {
  if (!payload.name || !payload.email || !payload.phone) {
    throw new Error("Required fields missing: Name, Email, and Phone number are required.");
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
  if (!accessKey) {
    console.error("[submitEnquiry] VITE_WEB3FORMS_KEY is not set: add it to .env.local (local) or the Vercel environment variables (deployed), then rebuild.");
    throw new Error(SEND_FAILED);
  }

  const now = new Date();
  const reference = createReference(now);
  const company = payload.company?.trim() || "";

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        access_key: accessKey,
        // Must start with "New Website Enquiry" (an inbox filter depends on it).
        subject: `New Website Enquiry ${reference} — ${payload.name.trim()}, ${company || "Individual"}`,
        from_name: "MixtCast Website",
        replyto: payload.email.trim(),
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        company,
        city: payload.city,
        space_type: payload.spaceType,
        services: payload.services.join(", "),
        timeline: payload.timeline,
        message: payload.message,
        reference,
        page_url: window.location.href,
        submitted_at: now.toLocaleString("en-IN", { timeZone: TIME_ZONE, dateStyle: "medium", timeStyle: "short" }),
        botcheck,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.success !== true) {
      console.error("[submitEnquiry] Web3Forms rejected the enquiry", res.status, data?.message);
      throw new Error(SEND_FAILED);
    }
    return { success: true, message: SUCCESS_MESSAGE, reference };
  } catch (err) {
    if (err instanceof Error && err.message === SEND_FAILED) throw err;
    console.error("[submitEnquiry] Request failed", err);
    throw new Error(SEND_FAILED);
  } finally {
    window.clearTimeout(timer);
  }
}

/** Success shown to a bot that ticked the honeypot: looks real, sends nothing. */
export function honeypotResponse(): EnquiryResponse {
  return { success: true, message: SUCCESS_MESSAGE, reference: createReference() };
}
