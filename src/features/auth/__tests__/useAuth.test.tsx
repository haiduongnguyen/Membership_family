import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAuth } from "@/features/auth/hooks/useAuth";

vi.mock("@/features/auth/api", () => ({
  ensureUserRecord: vi.fn().mockResolvedValue(undefined),
  signInWithEmail: vi.fn().mockResolvedValue({ message: "ok" }),
  signUpWithEmail: vi.fn().mockResolvedValue({ message: "ok" }),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

function fakeClient() {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  } as any;
}

describe("useAuth", () => {
  it("login updates loading lifecycle", async () => {
    const { result } = renderHook(() => useAuth(fakeClient()));
    await act(async () => {
      await result.current.login("a@test.com", "123456");
    });
    expect(result.current.loading).toBe(false);
  });
});
