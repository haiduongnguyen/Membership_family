import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventCalendar from "@/features/events/components/EventCalendar";

describe("EventCalendar", () => {
  it("renders calendar container", () => {
    render(<EventCalendar events={[]} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});
