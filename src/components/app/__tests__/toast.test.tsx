import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToastProvider, useToast } from "@/components/app/toast";

function Demo() {
  const { pushToast } = useToast();
  return <button onClick={() => pushToast("ok", "success")}>Push</button>;
}

describe("toast provider", () => {
  it("renders pushed toast", () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Push"));
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
