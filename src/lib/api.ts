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
  success: boolean;
  message: string;
  referenceId: string;
}

/**
 * Client stub for enquiry submission.
 * Validates payload format and simulates an async backend response with a reference ID.
 */
export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
  // Simulate network roundtrip latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!payload.name || !payload.email || !payload.phone) {
    throw new Error("Required fields missing: Name, Email, and Phone number are required.");
  }

  // Generate reference ID for tracking
  const referenceId = `MXC-${Date.now().toString().slice(-6)}`;

  return {
    success: true,
    message: "Thank you for reaching out to MixtCast Visual Solutions. Our AV engineering team will review your requirements and respond within 24 hours.",
    referenceId,
  };
}
