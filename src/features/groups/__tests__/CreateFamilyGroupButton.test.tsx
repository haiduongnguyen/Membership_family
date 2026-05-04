import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreateFamilyGroupButton from "@/features/groups/components/CreateFamilyGroupButton";

describe("CreateFamilyGroupButton", () => {
  it("renders and handles click", () => {
    const onCreateFamilyGroup = vi.fn().mockResolvedValue(undefined);
    render(<CreateFamilyGroupButton onCreateFamilyGroup={onCreateFamilyGroup} />);
    screen.getByText("+ Nhóm Gia đình").click();
    expect(onCreateFamilyGroup).toHaveBeenCalled();
  });
});
