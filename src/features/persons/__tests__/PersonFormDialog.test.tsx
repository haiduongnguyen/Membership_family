import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PersonFormDialog from "@/features/persons/components/PersonFormDialog";

describe("PersonFormDialog", () => {
  it("submits valid payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(<PersonFormDialog open loading={false} onClose={onClose} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText("Họ tên"), { target: { value: "Nguyễn Văn A" } });
    fireEvent.change(screen.getByPlaceholderText("Quan hệ với tôi"), { target: { value: "Con" } });
    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ full_name: "Nguyễn Văn A", relationship_to_user: "Con" })
    );
  });
});
