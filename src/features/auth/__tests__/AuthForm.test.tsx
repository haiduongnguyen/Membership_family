import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthForm from "@/features/auth/components/AuthForm";

describe("AuthForm", () => {
  it("calls login callback", async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    const onRegister = vi.fn().mockResolvedValue(undefined);
    render(<AuthForm loading={false} error="" message="" onLogin={onLogin} onRegister={onRegister} />);
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@test.com" } });
    fireEvent.change(screen.getByPlaceholderText(/M.t kh.u/i), { target: { value: "123456" } });
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onLogin).toHaveBeenCalledWith("a@test.com", "123456");
  });
});
