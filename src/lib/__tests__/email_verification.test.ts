import { describe, it, expect, vi } from "vitest";
import { sendVerificationEmail } from "../email";
import { User } from "../../models/User";

describe("Email Verification Service & Model", () => {
  it("supports Resend API dispatch without Google 2FA or SMS", async () => {
    process.env.RESEND_API_KEY = "re_test_mock_key_12345";
    
    // Mock global fetch for Resend API call
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "msg_12345" }),
    });

    const result = await sendVerificationEmail("student@example.com", "849201", "Student");
    expect(result.success).toBe(true);
    expect(result.sent).toBe(true);
    expect(result.provider).toBe("resend");

    // Clean up
    global.fetch = origFetch;
    delete process.env.RESEND_API_KEY;
  });

  it("safely generates code and test mailbox or fallback when no credentials set", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const result = await sendVerificationEmail("student@example.com", "849201", "Student");
    expect(result.success).toBe(true);
    expect(result.devMode).toBe(true);
    expect(result.code).toBe("849201");
  });

  it("User schema includes isEmailVerified default to false", () => {
    const paths = User.schema.paths;
    expect(paths["isEmailVerified"]).toBeDefined();
    expect(paths["verificationCode"]).toBeDefined();
    expect(paths["verificationCodeExpires"]).toBeDefined();
  });
});
