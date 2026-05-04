import { describe, expect, it, vi } from "vitest";
import { uploadImage, validateImageFile } from "@/features/media/api";

function makeFile(type: string, size: number) {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], "x.png", { type });
}

function makeClient() {
  return {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://img.test/a.png" } }),
      }),
    },
  } as any;
}

describe("media api", () => {
  it("rejects unsupported type", () => {
    const out = validateImageFile(makeFile("application/pdf", 100));
    expect("error" in out).toBe(true);
  });

  it("rejects oversize", () => {
    const out = validateImageFile(makeFile("image/png", 6 * 1024 * 1024));
    expect("error" in out).toBe(true);
  });

  it("uploads valid file", async () => {
    const out = await uploadImage(makeClient(), "relationship-media", "avatars/a.png", makeFile("image/png", 1024));
    expect((out as any).publicUrl).toContain("https://");
  });
});
