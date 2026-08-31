import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifyCredentials } from "@/lib/auth";

const TEST_EMAIL = "vitest-auth-user@example.com";
const TEST_PASSWORD = "correct-password-123";

describe("Authentication", () => {
  beforeAll(async () => {
    // Create a dedicated test user with a known password.
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    await db.user.create({
      data: {
        email: TEST_EMAIL,
        passwordHash,
        name: "Vitest Auth User",
        role: "CUSTOMER",
      },
    });
  });

  afterAll(async () => {
    // Clean up so repeated test runs don't collide on the unique email.
    await db.user.deleteMany({ where: { email: TEST_EMAIL } });
  });

  it("succeeds with correct email and password", async () => {
    const result = await verifyCredentials(TEST_EMAIL, TEST_PASSWORD);

    expect(result).not.toBeNull();
    expect(result?.email).toBe(TEST_EMAIL);
    expect(result?.role).toBe("CUSTOMER");
  });

  it("fails with an incorrect password", async () => {
    const result = await verifyCredentials(TEST_EMAIL, "wrong-password");

    expect(result).toBeNull();
  });

  it("fails with an email that doesn't exist", async () => {
    const result = await verifyCredentials(
      "does-not-exist@example.com",
      "any-password"
    );

    expect(result).toBeNull();
  });
});