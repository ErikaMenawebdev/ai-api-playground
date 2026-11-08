import { useState } from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";

import PromptEditor from "./PromptEditor";

afterEach(() => {
  cleanup();
});

// Componente auxiliar para controlar el estado
function PromptEditorTest({ onGenerate = vi.fn(), initialLoading = false }) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("demo");

  return (
    <PromptEditor
      prompt={prompt}
      setPrompt={setPrompt}
      mode={mode}
      setMode={setMode}
      onGenerate={onGenerate}
      loading={initialLoading}
    />
  );
}

describe("PromptEditor", () => {

  it("should render the editor correctly", () => {
    render(<PromptEditorTest />);

    expect(screen.getByText("Prompt Editor")).toBeInTheDocument();
    expect(screen.getByLabelText("Your prompt")).toBeInTheDocument();
    expect(screen.getByLabelText("Execution mode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate response/i })).toBeInTheDocument();
  });

  it("should display the initial character counter", () => {
    render(<PromptEditorTest />);

    expect(screen.getByText("0/4000 characters")).toBeInTheDocument();
  });

  it("should update the prompt and character counter", async () => {
    const user = userEvent.setup();

    render(<PromptEditorTest />);

    const textarea = screen.getByLabelText("Your prompt");

    await user.type(textarea, "Hello AI");

    expect(textarea).toHaveValue("Hello AI");
    expect(screen.getByText("8/4000 characters")).toBeInTheDocument();
  });

  it("should disable Generate when the prompt is empty", () => {
    render(<PromptEditorTest />);

    expect(
      screen.getByRole("button", { name: /generate response/i })
    ).toBeDisabled();
  });

  it("should enforce the maximum character limit", () => {
    render(<PromptEditorTest />);

    const textarea = screen.getByLabelText("Your prompt");

    expect(textarea).toHaveAttribute("maxLength", "4000");

    fireEvent.change(textarea, {
      target: { value: "a".repeat(4001) }
    });

    expect(
      screen.getByRole("button", { name: /generate response/i })
    ).toBeDisabled();
  });

  it("should call onGenerate with the prompt and selected mode", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();

    render(<PromptEditorTest onGenerate={onGenerate} />);

    const textarea = screen.getByLabelText("Your prompt");
    const modeSelector = screen.getByLabelText("Execution mode");

    await user.type(textarea, "Explain artificial intelligence");
    await user.selectOptions(modeSelector, "live");

    await user.click(
      screen.getByRole("button", { name: /generate response/i })
    );

    expect(onGenerate).toHaveBeenCalledWith(
      "Explain artificial intelligence",
      "live"
    );
  });

  it("should disable controls while loading", () => {
    render(<PromptEditorTest initialLoading={true} />);

    expect(screen.getByLabelText("Your prompt")).toBeDisabled();
    expect(screen.getByLabelText("Execution mode")).toBeDisabled();
    expect(screen.getByRole("button", { name: /new prompt/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /generating/i })).toBeDisabled();
  });

  it("should clear the prompt when clicking New Prompt", async () => {
    const user = userEvent.setup();

    render(<PromptEditorTest />);

    const textarea = screen.getByLabelText("Your prompt");

    await user.type(textarea, "Test prompt");

    await user.click(
      screen.getByRole("button", { name: /new prompt/i })
    );

    expect(textarea).toHaveValue("");
    expect(screen.getByText("0/4000 characters")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate response/i })
    ).toBeDisabled();
  });

});