import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EventFormDialog from "@/features/events/components/EventFormDialog";

describe("EventFormDialog", () => {
  it("submits valid payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    const { container } = render(
      <EventFormDialog
        open
        people={[{ id: "p1", full_name: "A" } as any]}
        loading={false}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Tên sự kiện"), { target: { value: "Sinh nhật" } });
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByText("Lưu sự kiện"));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Sinh nhật", event_date: "2026-01-01" })
      )
    );
  });
});
