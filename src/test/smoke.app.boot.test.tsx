import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("app boot", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByText(/Supabase|Ký Ức Quan Hệ/i)).toBeInTheDocument();
  });
});
