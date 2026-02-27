import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

describe("quiz flow integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("timed mode timeout ends session and allows review recovery", () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /polski|polish/i }));
    fireEvent.click(screen.getByRole("button", { name: /typed|wpisywanie/i }));
    fireEvent.click(screen.getByRole("button", { name: /5 min/i }));
    fireEvent.click(screen.getByRole("button", { name: /start quiz|start/i }));

    fireEvent.click(screen.getByRole("button", { name: /show hint|pokaż podpowiedź/i }));
    const hintedAnswer = container.querySelector(".help-line")?.textContent || "";

    act(() => {
      vi.advanceTimersByTime(301000);
    });

    expect(screen.getByText(/unanswered|bez odpowiedzi/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /review mistakes|przejrzyj błędy/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /review mistakes|przejrzyj błędy/i }));

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: hintedAnswer },
    });
    fireEvent.click(screen.getByRole("button", { name: /check|sprawdź/i }));

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByText(/recovered|odzyskane/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1/)).toBeInTheDocument();
  });
});
