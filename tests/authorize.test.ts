import { describe, it, expect, vi } from "vitest";
import { getAuthorizedSession } from "@/lib/authorize";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

const mockedGetServerSession = vi.mocked(getServerSession);

describe("getAuthorizedSession", () => {
  it("returns null when there is no session", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const result = await getAuthorizedSession();

    expect(result).toBeNull();
  });

  it("returns the session when no specific role is required", async () => {
    const fakeSession = {
      user: { id: "u1", role: "CUSTOMER" },
      expires: "2099-01-01",
    };
    mockedGetServerSession.mockResolvedValueOnce(fakeSession as never);

    const result = await getAuthorizedSession();

    expect(result).toEqual(fakeSession);
  });

  it("blocks a CUSTOMER from an ADMIN-only action", async () => {
    const fakeSession = {
      user: { id: "u1", role: "CUSTOMER" },
      expires: "2099-01-01",
    };
    mockedGetServerSession.mockResolvedValueOnce(fakeSession as never);

    const result = await getAuthorizedSession(["ADMIN"]);

    expect(result).toBeNull();
  });

  it("allows an ADMIN through an ADMIN-only action", async () => {
    const fakeSession = {
      user: { id: "u2", role: "ADMIN" },
      expires: "2099-01-01",
    };
    mockedGetServerSession.mockResolvedValueOnce(fakeSession as never);

    const result = await getAuthorizedSession(["ADMIN"]);

    expect(result).toEqual(fakeSession);
  });
});