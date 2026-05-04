import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ImageUploader from "@/features/media/components/ImageUploader";

describe("ImageUploader", () => {
  it("calls callback when file selected", () => {
    const onFileSelected = vi.fn().mockResolvedValue(undefined);
    render(<ImageUploader onFileSelected={onFileSelected} label="Anh" />);

    const input = screen.getByLabelText("Anh") as HTMLInputElement;
    const file = new File([new Blob(["x"], { type: "image/png" })], "a.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelected).toHaveBeenCalled();
  });
});
