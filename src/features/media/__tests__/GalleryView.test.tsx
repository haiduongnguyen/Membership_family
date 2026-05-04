import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GalleryView from "@/features/media/components/GalleryView";

describe("GalleryView", () => {
  it("renders empty state", () => {
    render(<GalleryView people={[]} />);
    expect(screen.getByText(/Chưa có ảnh nào/i)).toBeInTheDocument();
  });

  it("renders image cards", () => {
    render(<GalleryView people={[{ id: "p1", full_name: "A", avatar_url: "https://x/y.png" } as any]} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
