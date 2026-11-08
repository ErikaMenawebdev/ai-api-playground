import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";

import History from "./History";

afterEach(() => {
  cleanup();
});

const mockHistory = [
  {
    id: "1",
    prompt: "Explain artificial intelligence",
    response: "Artificial intelligence is a technology that simulates human intelligence.",
    mode: "live",
    model: "gpt-6-luna",
    responseTime: 2500,
    tokens: 100,
    createdAt: "2026-11-05T10:00:00.000Z"
  },
  {
    id: "2",
    prompt: "What is machine learning?",
    response: "Machine learning is a branch of artificial intelligence.",
    mode: "demo",
    model: "Demo Model",
    responseTime: 0,
    tokens: 0,
    createdAt: "2026-11-05T11:00:00.000Z"
  }
];

describe("History", () => {

  it("should render the history section", () => {
    render(
      <History
        history={[]}
        onSelectHistory={vi.fn()}
        onDeleteHistory={vi.fn()}
        onClearHistory={vi.fn()}
      />
    );

    expect(screen.getByText("Query History")).toBeInTheDocument();
    expect(screen.getByText("Review your previous AI interactions.")).toBeInTheDocument();
  });

  it("should display the empty state when there is no history", () => {
    render(
      <History
        history={[]}
        onSelectHistory={vi.fn()}
        onDeleteHistory={vi.fn()}
        onClearHistory={vi.fn()}
      />
    );

    expect(screen.getByText("No history yet")).toBeInTheDocument();
    expect(screen.getByText("0 queries")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /clear history/i })
    ).not.toBeInTheDocument();
  });

  it("should display the history records correctly", () => {
    render(
      <History
        history={mockHistory}
        onSelectHistory={vi.fn()}
        onDeleteHistory={vi.fn()}
        onClearHistory={vi.fn()}
      />
    );

    expect(screen.getByText("2 queries")).toBeInTheDocument();

    expect(screen.getByText("Explain artificial intelligence")).toBeInTheDocument();
    expect(screen.getByText("What is machine learning?")).toBeInTheDocument();

    expect(screen.getByText("gpt-6-luna")).toBeInTheDocument();
    expect(screen.getByText("Demo Model")).toBeInTheDocument();

    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText("DEMO")).toBeInTheDocument();
  });

  it("should call onSelectHistory with the selected record", async () => {
    const user = userEvent.setup();
    const onSelectHistory = vi.fn();

    render(
      <History
        history={mockHistory}
        onSelectHistory={onSelectHistory}
        onDeleteHistory={vi.fn()}
        onClearHistory={vi.fn()}
      />
    );

    const viewButtons = screen.getAllByRole("button", {
      name: /view response/i
    });

    await user.click(viewButtons[0]);

    expect(onSelectHistory).toHaveBeenCalledWith(mockHistory[0]);
  });

  it("should call onDeleteHistory with the selected record ID", async () => {
    const user = userEvent.setup();
    const onDeleteHistory = vi.fn();

    render(
      <History
        history={mockHistory}
        onSelectHistory={vi.fn()}
        onDeleteHistory={onDeleteHistory}
        onClearHistory={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByRole("button", {
      name: /^delete$/i
    });

    await user.click(deleteButtons[0]);

    expect(onDeleteHistory).toHaveBeenCalledWith("1");
  });

  it("should call onClearHistory when clicking Clear History", async () => {
    const user = userEvent.setup();
    const onClearHistory = vi.fn();

    render(
      <History
        history={mockHistory}
        onSelectHistory={vi.fn()}
        onDeleteHistory={vi.fn()}
        onClearHistory={onClearHistory}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /clear history/i })
    );

    expect(onClearHistory).toHaveBeenCalledTimes(1);
  });

});