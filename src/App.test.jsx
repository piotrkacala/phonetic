import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

test("renders language selection buttons", () => {
  render(<App />);
  expect(screen.getByRole("button", { name: /polski|polish/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /nato/i })).toBeInTheDocument();
});

test("time options are not preselected when returning to setup", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /polski|polish/i }));
  fireEvent.click(screen.getByRole("button", { name: /typed|wpisywanie/i }));
  fireEvent.click(screen.getByRole("button", { name: /3 min/i }));
  fireEvent.click(screen.getByRole("button", { name: /start quiz|start/i }));
  fireEvent.click(screen.getByRole("button", { name: /back to setup|powrót do ustawień/i }));

  fireEvent.click(screen.getByRole("button", { name: /polski|polish/i }));
  fireEvent.click(screen.getByRole("button", { name: /typed|wpisywanie/i }));

  const noLimitBtn = screen.getByRole("button", { name: /no limit|bez limitu/i });
  const oneMinBtn = screen.getByRole("button", { name: /1 min/i });
  const threeMinBtn = screen.getByRole("button", { name: /3 min/i });
  const fiveMinBtn = screen.getByRole("button", { name: /5 min/i });

  expect(noLimitBtn).not.toHaveClass("is-selected");
  expect(oneMinBtn).not.toHaveClass("is-selected");
  expect(threeMinBtn).not.toHaveClass("is-selected");
  expect(fiveMinBtn).not.toHaveClass("is-selected");
});

test("start is disabled in step 3 until time option is selected", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /polski|polish/i }));
  fireEvent.click(screen.getByRole("button", { name: /typed|wpisywanie/i }));

  const startBtn = screen.getByRole("button", { name: /start quiz|start/i });
  expect(startBtn).toBeDisabled();

  fireEvent.click(screen.getByRole("button", { name: /no limit|bez limitu/i }));
  expect(startBtn).toBeEnabled();
});

test("updates html lang when UI language changes", () => {
  render(<App />);

  const languageSelect = screen.getByRole("combobox");
  fireEvent.change(languageSelect, { target: { value: "pl" } });

  expect(document.documentElement.lang).toBe("pl");
});
