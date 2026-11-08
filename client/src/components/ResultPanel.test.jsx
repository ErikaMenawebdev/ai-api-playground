import {
  render,
  screen,
  cleanup
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";

import ResultPanel from "./ResultPanel";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ResultPanel", () => {

  it("should display the initial empty state", () => {
    render(
      <ResultPanel
        response=""
        loading={false}
        error=""
      />
    );

    expect(screen.getByText("No response yet")).toBeInTheDocument();

    expect(
      screen.getByText(/Write a prompt and click Generate response/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /copy response/i })
    ).toBeDisabled();
  });

  it("should display the loading state", () => {
    render(
      <ResultPanel
        response=""
        loading={true}
        error=""
      />
    );

    expect(screen.getByText("Generating...")).toBeInTheDocument();

    expect(
      screen.getByText("Generating response...")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /copy response/i })
    ).toBeDisabled();
  });

  it("should display an error message", () => {
    render(
      <ResultPanel
        response=""
        loading={false}
        error="Failed to fetch"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Something went wrong" })
    ).toBeInTheDocument();

    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  });

  it("should render an AI response correctly", () => {
  render(
    <ResultPanel
      response={"## Artificial Intelligence\n\nAI helps solve problems."}
      loading={false}
      error=""
    />
  );

  expect(
    screen.getByText("Response generated")
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", { name: "Artificial Intelligence" })
  ).toBeInTheDocument();

  expect(
    screen.getByText("AI helps solve problems.")
  ).toBeInTheDocument();
});

  it("should copy the response to the clipboard", async () => {
    const user = userEvent.setup();

    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock
      }
    });

    const response = "Artificial Intelligence is fascinating.";

    render(
      <ResultPanel
        response={response}
        loading={false}
        error=""
      />
    );

    await user.click(
      screen.getByRole("button", { name: /copy response/i })
    );

    expect(writeTextMock).toHaveBeenCalledWith(response);

    expect(
      screen.getByRole("button", { name: "Copied!" })
    ).toBeInTheDocument();
  });

  it("should disable the copy button while loading", () => {
    render(
      <ResultPanel
        response="Test response"
        loading={true}
        error=""
      />
    );

    expect(
      screen.getByRole("button", { name: /copy response/i })
    ).toBeDisabled();
  });

});