import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

import UsageStats from "./UsageStats";

afterEach(() => {
  cleanup();
});

describe("UsageStats", () => {

  it("should render the metrics section", () => {
    render(
      <UsageStats
        metrics={{
          model: "--",
          responseTime: "--",
          tokens: "--",
          mode: "demo"
        }}
      />
    );

    expect(screen.getByText("Execution Metrics")).toBeInTheDocument();
    expect(screen.getByText("Last request")).toBeInTheDocument();
  });

  it("should display the initial metric values", () => {
    render(
      <UsageStats
        metrics={{
          model: "--",
          responseTime: "--",
          tokens: "--",
          mode: "demo"
        }}
      />
    );

    expect(screen.getAllByRole("heading", { name: "--" })).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "DEMO" })).toBeInTheDocument();
  });

  it("should display the AI model correctly", () => {
    render(
      <UsageStats
        metrics={{
          model: "gpt-6-luna",
          responseTime: 3752,
          tokens: 89,
          mode: "live"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "gpt-6-luna" })).toBeInTheDocument();
  });

  it("should display the response time in milliseconds", () => {
    render(
      <UsageStats
        metrics={{
          model: "gpt-6-luna",
          responseTime: 3752,
          tokens: 89,
          mode: "live"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "3752 ms" })).toBeInTheDocument();
  });

  it("should display the number of tokens used", () => {
    render(
      <UsageStats
        metrics={{
          model: "gpt-6-luna",
          responseTime: 3752,
          tokens: 89,
          mode: "live"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "89" })).toBeInTheDocument();
  });

  it("should display the execution mode in uppercase", () => {
    render(
      <UsageStats
        metrics={{
          model: "gpt-6-luna",
          responseTime: 3752,
          tokens: 89,
          mode: "live"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "LIVE" })).toBeInTheDocument();
  });

});