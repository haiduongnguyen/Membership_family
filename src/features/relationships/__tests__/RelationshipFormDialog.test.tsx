import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RelationshipFormDialog from "@/features/relationships/components/RelationshipFormDialog";

describe("RelationshipFormDialog", () => {
  it("submits selected relationship", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <RelationshipFormDialog
        open
        people={[{ id: "p1", full_name: "A" } as any, { id: "p2", full_name: "B" } as any]}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "p1" } });
    fireEvent.change(selects[1], { target: { value: "p2" } });
    fireEvent.change(selects[2], { target: { value: "child" } });
    fireEvent.click(screen.getByText("Lưu quan hệ"));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ sourceId: "p1", targetId: "p2", relationType: "child" })
    );
  });
});
