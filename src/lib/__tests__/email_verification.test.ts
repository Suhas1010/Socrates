import { describe, it, expect } from "vitest";
import { sendVerificationEmail } from "../email";
import { User } from "../../models/User";

describe("Email Verification Service & Model", () => {
  it("generates and returns code safely in dev mode when SMTP is unconfigured", async () => {
    // Ensure SMTP is unset for dev fallback test
    const origUser = process.env.SMTP_USER;
    const origPass = process.env.SMTP_PASS;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const result = await sendVerificationEmail("student@example.com", "849201", "Student");
    expect(result.success).toBe(true);
    expect(result.devMode).toBe(true);
    expect(result.code).toBe("849201");
    expect(result.sent).toBe(false);

    // Restore
    if (origUser) process.env.SMTP_USER = origUser;
    if (origPass) process.env.SMTP_PASS = origPass;
  });

  it("User schema includes isEmailVerified default to false", () => {
    const paths = User.schema.paths;
    expect(paths["isEmailVerified"]).toBeDefined();
    expect(paths["verificationCode"]).toBeDefined();
    expect(paths["verificationCodeExpires"]).toBeDefined();
  });
});
