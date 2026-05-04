import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GroupSwitcher from "@/features/groups/components/GroupSwitcher";

describe("GroupSwitcher", () => {
  it("changes selected group", () => {
    const onChange = vi.fn();
    render(
      <GroupSwitcher
        groups={[{ id: "g1", name: "Gia đình" }, { id: "g2", name: "Công ty" }]}
        activeGroupId="g1"
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Chọn nhóm"), { target: { value: "g2" } });
    expect(onChange).toHaveBeenCalledWith("g2");
  });
});
