import { describe, expect, it, vi } from "vitest";
import { ensureUserRecord, signInWithEmail, signUpWithEmail } from "@/features/auth/api";

function makeClient() {
  const upsert = vi.fn().mockResolvedValue({});
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: "a@test.com", user_metadata: {} } }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: "u1" }, session: null }, error: null }),
    },
    from: vi.fn().mockReturnValue({ upsert }),
  } as any;
}

describe("auth api", () => {
  it("ensureUserRecord upserts public users", async () => {
    const client = makeClient();
    await ensureUserRecord(client);
    expect(client.from).toHaveBeenCalledWith("users");
  });

  it("signInWithEmail returns success message", async () => {
    const client = makeClient();
    const out = await signInWithEmail(client, "a@test.com", "123456");
    expect(out.message).toContain("Đăng nhập");
  });

  it("signUpWithEmail returns verify message when no session", async () => {
    const client = makeClient();
    const out = await signUpWithEmail(client, "a@test.com", "123456");
    expect(out.message).toContain("Kiểm tra email");
  });
});
